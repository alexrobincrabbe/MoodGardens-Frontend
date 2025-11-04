import { useCallback, useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UpsertEntry, RequestGarden, MyEntries, EntryByDay} from "../graphql";
import type { EntryForm } from "../validation";

export function useTodayData(skip: boolean, today: string) {
  const {
    data: todayData,
    loading: todayLoading,
    refetch: refetchToday,
  } = useQuery(EntryByDay, {
    variables: { dayKey: today }, 
    fetchPolicy: "cache-and-network",
    skip,
  });


  return { todayData, todayLoading, refetchToday };
}


type UseTodayEntrySubmitArgs = {
    today: string;
    resetForm: () => void;
    refetchFeed: () => Promise<any>;
};

export function useTodayEntrySubmit({
    today,
    resetForm,
    refetchFeed,
}: UseTodayEntrySubmitArgs) {
    const [statusText, setStatusText] = useState<string>("");

    const [upsertEntry] = useMutation(UpsertEntry);
    const [requestGarden] = useMutation(RequestGarden);

    const onSubmit = useCallback(
        async (vals: EntryForm) => {
            setStatusText("");
            try {
                await upsertEntry({
                    variables: { text: vals.text, songUrl: vals.songUrl, dayKey: today },
                });

                const res = await requestGarden({
                    variables: { period: "DAY", periodKey: today },
                });

                const newId = res.data?.requestGarden?.id ?? null;
                if (!newId) {
                    setStatusText("Could not start garden job (no id returned).");
                    return;
                }

                setStatusText("Generating your mood garden…");

                resetForm();
                await refetchFeed();
            } catch (err) {
                console.error("[Today] submit failed:", err);
                setStatusText(
                    "Something went wrong while saving or starting the garden."
                );
            }
        },
        [today, upsertEntry, requestGarden, resetForm, refetchFeed]
    );

    return { onSubmit, statusText };
}

export function useEntriesFeed(opts?: { authed?: boolean }) {
  const LIMIT = 10;
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

  // Seed from first page ONCE (not when skipped)
  useEffect(() => {
    if (skip) return;
    if (!initialLoadingRaw && data?.myEntries && totalFetched === 0) {
      const firstPage: any[] = data.myEntries;
      setTotalFetched(firstPage.length);
      setItems(dedupeById(firstPage));
      setHasMore(firstPage.length === LIMIT);
    }
  }, [skip, initialLoadingRaw, data?.myEntries, totalFetched, dedupeById]);

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
      setItems((prev) => dedupeById([...prev, ...nextPage]));
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
  ]);

  const refetchFeed = useCallback(async () => {
    if (skip) return;
    const res = await refetch({ limit: LIMIT, offset: 0 });
    const firstPage: any[] = res.data?.myEntries ?? [];
    setTotalFetched(firstPage.length);
    setItems(dedupeById(firstPage));
    setHasMore(firstPage.length === LIMIT);
  }, [skip, refetch, dedupeById]);

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

