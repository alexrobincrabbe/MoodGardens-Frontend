import { useEffect, useRef } from "react";

export function LoadMoreTrigger({
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
