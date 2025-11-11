import { useCallback, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { PaginatedDiaryEntries} from "../graphql";

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
  } = useQuery(PaginatedDiaryEntries, {
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
    if (!initialLoadingRaw && data?.paginatedDiaryEntries && totalFetched === 0) {
      const firstPage: any[] = data.paginatedDiaryEntries;
      setTotalFetched(firstPage.length);
      setItems(dedupeById(firstPage));
      setHasMore(firstPage.length === LIMIT);
    }
  }, [skip, initialLoadingRaw, data?.paginatedDiaryEntries, totalFetched, dedupeById]);

  const loadMore = useCallback(async () => {
    if (skip) return;
    if (initialLoadingRaw || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchMore({
        variables: { limit: LIMIT, offset: totalFetched },
      });
      const nextPage: any[] = res.data?.paginatedDiaryEntries ?? [];
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
    const firstPage: any[] = res.data?.paginatedDiaryEntries ?? [];
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

