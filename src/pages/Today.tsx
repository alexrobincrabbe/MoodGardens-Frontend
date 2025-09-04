import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@apollo/client";

import { UpsertEntry, RequestGarden, GetGarden } from "../graphql";
import { entrySchema, type EntryForm } from "../validation";
import { isoDayKey } from "../utils";

export default function Today() {
  const [gardenId, setGardenId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EntryForm>({ resolver: zodResolver(entrySchema) });

  const [upsertEntry] = useMutation(UpsertEntry);
  const [requestGarden] = useMutation(RequestGarden);

  const onSubmit = async (vals: EntryForm) => {
    setStatusText("");
    const dayKey = isoDayKey(); // e.g. "2025-09-04" in your local TZ

    try {
      // 1) Save the entry (now includes dayKey)
      const upsertVars = { text: vals.text, songUrl: vals.songUrl, dayKey };
      console.debug("[Today] upsertEntry vars:", upsertVars);
      await upsertEntry({ variables: upsertVars });

      // 2) Request the day garden for today
      const res = await requestGarden({
        variables: { period: "DAY", periodKey: dayKey },
      });

      const newId = res.data?.requestGarden?.id ?? null;
      if (!newId) {
        setStatusText("Could not start garden job (no id returned).");
        console.error("[Today] requestGarden returned no id", res);
        return;
      }

      setGardenId(newId);
      setStatusText("Generating your mood garden…");
      reset();
    } catch (err) {
      console.error("[Today] submit failed:", err);
      setStatusText("Something went wrong while saving or starting the garden.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Today</h1>
        <p className="text-sm text-gray-500">
          Log a sentence and an optional song. We’ll grow a “day garden.”
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">What’s on your mind?</label>
          <textarea
            className="mt-1 w-full rounded-lg border p-3"
            rows={4}
            placeholder="I felt stressed about the test, but proud I finished…"
            {...register("text")}
          />
          {errors.text && (
            <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">
            Song (optional URL: Spotify/YouTube/etc.)
          </label>
          <input
            type="url"
            className="mt-1 w-full rounded-lg border p-2"
            placeholder="https://open.spotify.com/track/..."
            {...register("songUrl")}
          />
          {errors.songUrl && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.songUrl.message)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save & Generate Garden"}
        </button>

        {statusText && (
          <p className="mt-2 text-sm text-gray-600">{statusText}</p>
        )}
      </form>

      {/* Show today's garden preview */}
      <TodayGardenPreview
        periodKey={isoDayKey()}
        statusText={statusText}
        key={gardenId ?? "nogarden"} // force remount when a new job is requested
      />
    </div>
  );
}

/** Lightweight preview component responsible only for reading/polling */
function TodayGardenPreview({
  periodKey,
  statusText,
}: {
  periodKey: string;
  statusText?: string;
}) {
  const { data, loading, error, startPolling, stopPolling, refetch } = useQuery(GetGarden, {
    variables: { period: "DAY", periodKey },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const [progress, setProgress] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);

  useEffect(() => {
    startPolling(1500);
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  const garden = data?.garden;

  useEffect(() => {
    const s = data?.garden?.status;
    if (s === "READY" || s === "FAILED") stopPolling();
  }, [data?.garden?.status, stopPolling]);

  const serverProgress =
    typeof (garden as any)?.progress === "number" ? (garden as any).progress : null;

  // Local progress estimator: accelerate to ~70% in ~8s, then slowly approach 90% and wait.
  useEffect(() => {
    const status = garden?.status;
    const isPending = status === "PENDING";

    if (status === "READY") {
      setProgress(100);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTsRef.current = null;
      return;
    }

    if (status === "FAILED") {
      setProgress(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTsRef.current = null;
      return;
    }

    if (serverProgress !== null && isPending) {
      setProgress(Math.max(0, Math.min(99, serverProgress)));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTsRef.current = null;
      return;
    }

    if (isPending) {
      if (startTsRef.current == null) startTsRef.current = performance.now();
      const tick = (now: number) => {
        if (!startTsRef.current) return;
        const elapsed = (now - startTsRef.current) / 1000;
        let est = 0;
        if (elapsed <= 8) {
          const t = elapsed / 8;
          est = 70 * (1 - Math.pow(1 - t, 3));
        } else if (elapsed <= 30) {
          const t = (elapsed - 8) / 22;
          est = 70 + 20 * t;
        } else {
          est = 90;
        }
        setProgress((prev) => Math.min(99, Math.max(prev, est)));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    }
  }, [garden?.status, serverProgress]);

  function gardenStageLabel(p: number): string {
    if (p < 20) return "Seeds planted…";
    if (p < 50) return "Sprouting 🌱";
    if (p < 80) return "Growing strong 🌿";
    if (p < 100) return "Almost blooming 🌸";
    return "Fully bloomed 🌼";
  }

  const displayProgress = Math.round(serverProgress ?? progress);

  return (
    <section className="rounded-xl border p-4">
      <h2 className="mb-2 text-lg font-semibold">Today’s Garden</h2>

      {error && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          GraphQL error: {error.message}
        </div>
      )}

      {loading && <p>Checking status…</p>}
      {!loading && !garden && <p>No garden yet.</p>}

      {garden && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Status: <span className="font-medium">{garden.status}</span>
          </p>

          {statusText && garden.status !== "READY" && (
            <p className="text-sm text-gray-500">{statusText}</p>
          )}

          {garden.status === "PENDING" && (
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>{gardenStageLabel(displayProgress)}</span>
                <span>{displayProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-teal-500 transition-[width] duration-300 ease-out"
                  style={{ width: `${displayProgress}%` }}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={displayProgress}
                  role="progressbar"
                />
              </div>
            </div>
          )}

          {garden.imageUrl && garden.status === "READY" && (
            <div className="mt-2">
              <img
                src={garden.imageUrl}
                alt={`Garden for ${garden.periodKey}`}
                className="w-full rounded-lg"
              />
              {garden.summary && (
                <p className="mt-2 text-sm text-gray-600">{garden.summary}</p>
              )}
              <div className="mt-3 flex gap-2">
                <a
                  href={garden.imageUrl}
                  download
                  className="rounded border px-3 py-1 text-sm"
                >
                  Download
                </a>
                <button
                  className="rounded border px-3 py-1 text-sm"
                  onClick={() => navigator.clipboard.writeText(garden.imageUrl)}
                >
                  Copy Link
                </button>
                <button
                  className="rounded border px-3 py-1 text-sm"
                  onClick={() => refetch()}
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
