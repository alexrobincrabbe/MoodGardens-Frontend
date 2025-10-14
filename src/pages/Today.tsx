// apps/web/src/pages/Today.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@apollo/client";
import {
  UpsertEntry,
  RequestGarden,
  GetGarden,
  MyEntries,
  EntryByDay,
} from "../graphql";
import { Me } from "../graphql/auth";
import { entrySchema, type EntryForm } from "../validation";
import { isoDayKey } from "../utils";
import {
  AdvancedImage,
  lazyload,
  responsive,
  placeholder,
} from "@cloudinary/react";
import { gardenThumb, gardenDownloadUrl, gardenShareUrl } from "../utils";
import { shareNative } from "../utils/share";
import { downloadImage } from "../utils/download";
import { ShareMenu } from "../components/ShareMenu";
/* --------------------------------------------------------------------------- */

export default function Today() {
  const { data: userData, loading: userLoading } = useQuery(Me, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });
  const me = userData?.me ?? null;
  const [gardenId, setGardenId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>("");
  const authed = !!me;
  const authReady = !userLoading;
  const dayKey = isoDayKey();
  // Only check today's entry when authenticated
  const {
    data: todayData,
    loading: todayLoading,
    refetch: refetchToday,
  } = useQuery(EntryByDay, {
    variables: { dayKey },
    fetchPolicy: "cache-and-network",
    skip: !authReady || !authed,
  });

  const hasToday = Boolean(todayData?.entryByDay);

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
    try {
      await upsertEntry({
        variables: { text: vals.text, songUrl: vals.songUrl, dayKey },
      });

      const res = await requestGarden({
        variables: { period: "DAY", periodKey: dayKey },
      });
      const newId = res.data?.requestGarden?.id ?? null;
      if (!newId) {
        setStatusText("Could not start garden job (no id returned).");
        return;
      }

      setGardenId(newId);
      setStatusText("Generating your mood garden…");
      reset();

      await refetchToday();
      await refetchFeed();
    } catch (err) {
      console.error("[Today] submit failed:", err);
      setStatusText(
        "Something went wrong while saving or starting the garden."
      );
    }
  };

  // FEED state/hooks live here; UI component is below
  const {
    items,
    hasMore,
    loadingMore,
    loadMore,
    refetchFeed,
    initialError,
    initialLoading,
  } = useEntriesFeed({ excludeDayKey: dayKey, authed });

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Today</h1>
        <p className="text-sm text-gray-500">
          Write about your day. We’ll grow a “day garden.”
        </p>
      </header>

      {!authReady && (
        <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-600">
          Checking session…
        </div>
      )}

      {!authed && authReady && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Please sign in to log entries and see your gardens.
        </div>
      )}

      {authed && !todayLoading && !hasToday && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              What’s on your mind {me?.displayName ?? ""}?
            </label>
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
      )}

      {authed && hasToday && (
        <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
          You’ve already logged an entry for{" "}
          <span className="font-medium">{dayKey}</span>.
        </div>
      )}

      {/* Only render preview while authed (component also reads auth and skips its query) */}
      {authed && (
        <TodayGardenPreview
          periodKey={dayKey}
          statusText={statusText}
          key={gardenId ?? (hasToday ? "has" : "no")}
        />
      )}

      {/* Entries feed with infinite scroll */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your entries</h2>

        {!authed && authReady && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Sign in to see your saved entries and gardens.
          </div>
        )}

        {authed && initialLoading && (
          <p className="text-sm text-gray-500">Loading entries…</p>
        )}
        {authed && !initialLoading && items.length === 0 && !initialError && (
          <p className="text-sm text-gray-500">No entries yet.</p>
        )}

        {items.map((e) => (
          <article key={e.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{e.dayKey}</span>
              <time dateTime={e.createdAt}>
                {new Date(e.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="mt-1 text-sm">{e.text}</p>

            {/* Related day garden */}
            {e.garden && (
              <div className="mt-2">
                <p className="text-xs text-gray-600">
                  Garden status:{" "}
                  <span className="font-medium">{e.garden.status}</span>
                </p>

                {e.garden.status !== "READY" &&
                  typeof e.garden.progress === "number" && (
                    <div className="mt-1">
                      <div className="mb-1 flex items-center justify-between text-[10px] text-gray-500">
                        <span>Growing…</span>
                        <span>{Math.round(e.garden.progress)}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-black transition-[width] duration-300 ease-out"
                          style={{ width: `${Math.round(e.garden.progress)}%` }}
                        />
                      </div>
                    </div>
                  )}

                {e.garden?.publicId && e.garden.status === "READY" && (
                  <div className="mt-2">
                    <AdvancedImage
                      key={e.garden.publicId}
                      cldImg={gardenThumb(e.garden.publicId)}
                      plugins={[
                        lazyload(),
                        responsive({ steps: [256, 384, 512, 640, 768, 1024] }),
                        placeholder({ mode: "blur" }),
                      ]}
                      alt={`Garden for ${e.garden.periodKey}`}
                      decoding="async"
                      className="mt-2 w-full rounded-md"
                    />

                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        className="rounded border px-3 py-1 text-sm"
                        onClick={() =>
                          downloadImage(
                            gardenDownloadUrl(
                              e.garden.publicId,
                              `mood-garden-${e.garden.periodKey}.png`
                            ),
                            `mood-garden-${e.garden.periodKey}.png`
                          )
                        }
                      >
                        Download
                      </button>

                      {/* Share menu */}
                      <ShareMenu
                        url={
                          e.garden.shareUrl ?? gardenShareUrl(e.garden.publicId)
                        }
                        text={`My Mood Garden for ${e.garden.dayKey} 🌱 #MoodGardens`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>
        ))}

        {/* Only mount the trigger when we actually have more pages */}
        {hasMore && (
          <LoadMoreTrigger
            onVisible={loadMore}
            loading={loadingMore}
            hasMore={hasMore}
          />
        )}
      </section>
    </div>
  );
}

/* ---------------------- TodayGardenPreview ---------------------- */

type PreviewProps = { periodKey: string; statusText?: string };

function TodayGardenPreview({ periodKey, statusText }: PreviewProps) {
  const { data: userData, loading: userLoading } = useQuery(Me, { fetchPolicy: "cache-first" });
  const authed = !!userData?.me;
  const authReady = !userLoading;

  const { data, error, startPolling, stopPolling } = useQuery(GetGarden, {
    variables: { period: "DAY", periodKey },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    skip: !authed || !authReady,
  });

  const [progress, setProgress] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!authed) {
      stopPolling?.();
      return;
    }
    startPolling?.(1500);
    return () => stopPolling?.();
  }, [authed, startPolling, stopPolling]);

  const garden = data?.garden;

  useEffect(() => {
    const s = data?.garden?.status;
    if (s === "READY" || s === "FAILED") stopPolling?.();
  }, [data?.garden?.status, stopPolling]);

  const serverProgress =
    typeof (garden as any)?.progress === "number"
      ? (garden as any).progress
      : null;

  useEffect(() => {
    if (!authed) return;

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
  }, [authed, garden?.status, serverProgress]);

  function gardenStageLabel(p: number): string {
    if (p < 20) return "Seeds planted…";
    if (p < 50) return "Sprouting 🌱";
    if (p < 80) return "Growing strong 🌿";
    if (p < 100) return "Almost blooming 🌸";
    return "Fully bloomed 🌼";
  }

  const displayProgress = Math.round(serverProgress ?? progress);

  if (!authed) {
    return (
      <section className="rounded-xl border p-4">
        <h2 className="mb-2 text-lg font-semibold">Today’s Garden</h2>
        <p className="text-sm text-amber-700">
          Please sign in to generate and view your garden.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border p-4">
      <h2 className="mb-2 text-lg font-semibold">Today’s Garden</h2>

      {error && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          GraphQL error: {error.message}
        </div>
      )}

      {!garden && <p>No garden yet.</p>}

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

          {garden.publicId && garden.status === "READY" && (
            <div className="mt-2">
              <AdvancedImage
                key={garden.publicId}
                cldImg={gardenThumb(garden.publicId)}
                plugins={[
                  lazyload(),
                  responsive({ steps: [256, 384, 512, 640, 768, 1024] }),
                  placeholder({ mode: "blur" }),
                ]}
                alt={`Garden for ${garden.periodKey}`}
                decoding="async"
                className="w-full rounded-lg"
              />

              {garden.summary && (
                <p className="mt-2 text-sm text-gray-600">{garden.summary}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded border px-3 py-1 text-sm"
                  onClick={() =>
                    downloadImage(
                      gardenDownloadUrl(
                        garden.publicId,
                        `mood-garden-${garden.periodKey}.png`
                      ),
                      `mood-garden-${garden.periodKey}.png`
                    )
                  }
                >
                  Download
                </button>

                <button
                  className="rounded border px-3 py-1 text-sm"
                  onClick={() =>
                    shareNative(
                      garden.shareUrl ?? gardenShareUrl(garden.publicId),
                      `My Mood Garden for ${garden.periodKey} 🌱 #MoodGardens`
                    )
                  }
                >
                  Share
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------------------- Entries feed hook & components ---------------------- */

function useEntriesFeed(opts?: { excludeDayKey?: string; authed?: boolean }) {
  const LIMIT = 10;
  const excludeDayKey = opts?.excludeDayKey;
  const isAuthed = opts?.authed ?? true;
  const skip = !isAuthed;

  const [items, setItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(!skip);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [totalFetched, setTotalFetched] = useState<number>(0);

  const {
    data,
    loading: initialLoadingRaw,
    error: initialErrorRaw,
    fetchMore,
    refetch,
  } = useQuery(MyEntries, {
    variables: { limit: LIMIT, offset: 0 },
    notifyOnNetworkStatusChange: true,
    skip,
    fetchPolicy: "network-only",
  });

  // Force stable empty state when skipped
  useEffect(() => {
    if (skip) {
      setItems([]);
      setHasMore(false);
      setLoadingMore(false);
      setTotalFetched(0);
    }
  }, [skip]);

  const dedupeById = useCallback((arr: any[]) => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const e of arr) {
      const id = e?.id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(e);
    }
    return out;
  }, []);

  const filterOutToday = useCallback(
    (arr: any[]) =>
      excludeDayKey ? arr.filter((e) => e.dayKey !== excludeDayKey) : arr,
    [excludeDayKey]
  );

  // Seed from first page ONCE (not when skipped)
  useEffect(() => {
    if (skip) return;
    if (!initialLoadingRaw && data?.myEntries && totalFetched === 0) {
      const firstPage: any[] = data.myEntries;
      setTotalFetched(firstPage.length);
      setItems(dedupeById(filterOutToday(firstPage)));
      setHasMore(firstPage.length === LIMIT);
    }
  }, [
    skip,
    initialLoadingRaw,
    data?.myEntries,
    totalFetched,
    dedupeById,
    filterOutToday,
  ]);

  const loadMore = useCallback(async () => {
    if (skip) return;
    if (initialLoadingRaw || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchMore({
        variables: { limit: LIMIT, offset: totalFetched },
      });
      const nextPage: any[] = res.data?.myEntries ?? [];
      setTotalFetched((n) => n + nextPage.length);
      setItems((prev) => dedupeById([...prev, ...filterOutToday(nextPage)]));
      setHasMore(nextPage.length === LIMIT);
    } finally {
      setLoadingMore(false);
    }
  }, [
    skip,
    fetchMore,
    hasMore,
    initialLoadingRaw,
    loadingMore,
    totalFetched,
    dedupeById,
    filterOutToday,
  ]);

  const refetchFeed = useCallback(async () => {
    if (skip) return;
    const res = await refetch({ limit: LIMIT, offset: 0 });
    const firstPage: any[] = res.data?.myEntries ?? [];
    setTotalFetched(firstPage.length);
    setItems(dedupeById(filterOutToday(firstPage)));
    setHasMore(firstPage.length === LIMIT);
  }, [skip, refetch, dedupeById, filterOutToday]);

  const initialLoading = skip ? false : initialLoadingRaw;
  const initialError = skip ? undefined : initialErrorRaw;

  return {
    items,
    hasMore: skip ? false : hasMore,
    loadingMore: skip ? false : loadingMore,
    loadMore,
    refetchFeed,
    initialError,
    initialLoading,
  };
}

function LoadMoreTrigger({
  onVisible,
  loading,
  hasMore,
}: {
  onVisible: () => void;
  loading: boolean;
  hasMore: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!hasMore) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading) {
          onVisible();
        }
      },
      { rootMargin: "200px 0px 0px 0px" }
    );

    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [onVisible, loading, hasMore]);

  return (
    <div ref={ref} className="py-4 text-center text-sm text-gray-500">
      {loading
        ? "Loading more…"
        : hasMore
        ? "Scroll to load more…"
        : "No more entries."}
    </div>
  );
}
