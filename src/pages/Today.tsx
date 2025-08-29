// src/pages/Today.tsx
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gql, useMutation } from "@apollo/client";

const UpsertEntry = gql`
  mutation UpsertEntry($text: String!, $songUrl: String) {
    upsertEntry(text: $text, songUrl: $songUrl) {
      id
      dayKey
      mood {
        valence
        arousal
        tags
      }
      createdAt
    }
  }
`;

const RequestGarden = gql`
  mutation RequestGarden($period: GardenPeriod!, $periodKey: String!) {
    requestGarden(period: $period, periodKey: $periodKey) {
      id
      status
      period
      periodKey
      imageUrl
    }
  }
`;

const GetGarden = gql`
  query GetGarden($period: GardenPeriod!, $periodKey: String!) {
    garden(period: $period, periodKey: $periodKey) {
      id
      status
      imageUrl
      summary
      period
      periodKey
      updatedAt
    }
  }
`;

const schema = z.object({
  text: z.string().min(5, "Tell me a little more about your day."),
  songUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

type FormVals = z.infer<typeof schema>;

function isoDayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export default function Today() {
  const [gardenId, setGardenId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormVals>({ resolver: zodResolver(schema) });

  const [upsertEntry] = useMutation(UpsertEntry);
  const [requestGarden] = useMutation(RequestGarden);

  const onSubmit = async (vals: FormVals) => {
    setStatusText("");
    const dayKey = isoDayKey();

    // 1) Save the entry
    await upsertEntry({ variables: { text: vals.text, songUrl: vals.songUrl } });

    // 2) Request (or re-request) the DAY garden for today
    const res = await requestGarden({
      variables: { period: "DAY", periodKey: dayKey },
    });

    setGardenId(res.data?.requestGarden?.id ?? null);
    setStatusText("Generating your mood garden…");
    reset();
  };

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Today</h1>
        <p className="text-sm text-gray-500">
          Log a sentence, mood, and optional song. We’ll grow a “day garden.”
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
            <p className="mt-1 text-sm text-red-600">{errors.songUrl.message as string}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save & Generate Garden"}
        </button>
      </form>

      {gardenId && <TodayGardenPreview periodKey={isoDayKey()} statusText={statusText} />}
    </div>
  );
}

import { useEffect } from "react";
import { useQuery } from "@apollo/client";

function TodayGardenPreview({ periodKey, statusText }: { periodKey: string; statusText?: string }) {
  const { data, loading, refetch, startPolling, stopPolling } = useQuery(GetGarden, {
    variables: { period: "DAY", periodKey },
    fetchPolicy: "network-only",
    pollInterval: 0, // we’ll enable after mount
  });

  useEffect(() => {
    startPolling(1500);
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  const garden = data?.garden;

  return (
    <section className="rounded-xl border p-4">
      <h2 className="mb-2 text-lg font-semibold">Today’s Garden</h2>
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
                <button className="rounded border px-3 py-1 text-sm" onClick={() => refetch()}>
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
