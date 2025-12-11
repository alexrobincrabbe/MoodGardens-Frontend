import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GetGarden, RegenerateGarden } from "../../graphql";
import { GardenFeedItem, GenericButton } from "..";
import { toast } from "react-hot-toast";
import { useAuthData } from "../../hooks";

type PreviewProps = {
  periodKey: string;
  onGardenReady?: () => void;
  refetchFeed: () => Promise<any>;
};

export function TodayGardenPreview({
  periodKey,
  onGardenReady,
  refetchFeed,
}: PreviewProps) {
  const { user, authed, authReady } = useAuthData();
  const regenTokens = user.regenerateTokens;
  const { data, error, startPolling, stopPolling, refetch } = useQuery(
    GetGarden,
    {
      variables: { period: "DAY", periodKey },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
      skip: !authed || !authReady,
    },
  );

  const [progress, setProgress] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);
  const hasEverBeenNonReadyRef = useRef(false);
  const hasShownToastRef = useRef(false);
  const hasNotifiedParentRef = useRef(false);
  const garden = data?.garden;
  const serverProgress =
    typeof (garden as any)?.progress === "number"
      ? (garden as any).progress
      : null;
  const displayProgress = Math.round(serverProgress ?? progress);
  const status = garden?.status;
  const summary = garden?.summary;
  const regenerate = useRegenerateGarden(refetchFeed, refetch);
  useEffect(() => {
    if (!authed) {
      stopPolling?.();
    }
  }, [authed, stopPolling]);
  useEffect(() => {
    if (!authed) return;
    if (status === "PENDING") {
      startPolling?.(1500);
    }
  }, [authed, status, startPolling]);
  useEffect(() => {
    const s = data?.garden?.status;
    if (s === "READY" || s === "FAILED") stopPolling?.();
  }, [data?.garden?.status, stopPolling]);
  useEffect(() => {
    if (!status) return;
    if (status !== "READY") {
      hasEverBeenNonReadyRef.current = true;
    }
    if (
      status === "READY" &&
      hasEverBeenNonReadyRef.current &&
      !hasShownToastRef.current
    ) {
      toast.success("Your garden is ready");
      hasShownToastRef.current = true;

      if (!hasNotifiedParentRef.current) {
        onGardenReady?.();
        hasNotifiedParentRef.current = true;
      }
    }
  }, [status, onGardenReady]);
  useEffect(() => {
    if (!authed) return;
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
          // cubic ease-out to 70%
        } else if (elapsed <= 30) {
          const t = (elapsed - 8) / 22;
          est = 70 + 20 * t; // slow drift from 70 → 90
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
  }, [authed, status, serverProgress]);
  if (!authed) {
    return (
      <p className="text-sm text-amber-700">
        Please sign in to generate and view your garden.
      </p>
    );
  }
  if (error) {
    return (
      <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        GraphQL error: {error.message}
      </div>
    );
  }
  if (!garden) {
    return <p className="text-sm text-gray-500">No garden yet.</p>;
  }
  if (status === "READY") {
  const handleRegenerateClick = () => {
    if (regenTokens <= 0) {
      toast.error("You don’t have any regenerate tokens left.");
      return;
    }

    const ok = window.confirm(
      "Regenerating will permanently replace this garden image with a new one. The current version cannot be restored. Do you want to continue?"
    );

    if (!ok) return;

    void regenerate(garden.id);
  };

  return (
    <>
      <GardenFeedItem garden={garden} day={periodKey} />
      <GenericButton onClick={handleRegenerateClick}>
        Regenerate ({regenTokens})
      </GenericButton>
    </>
  );
}


  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Status: <span className="font-medium">{status}</span>
      </p>

      {status === "PENDING" && (
        <p className="text-sm text-gray-500">{summary}</p>
      )}

      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
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
    </div>
  );
}

function useRegenerateGarden(
  refetchFeed: () => Promise<any>,
  refetchGarden: () => Promise<any>,
) {
  const [regenerateGardenMutation] = useMutation(RegenerateGarden);

  const regenerate = useCallback(
    async (gardenId: string | number) => {
      await regenerateGardenMutation({
        variables: { gardenId: String(gardenId) },
      });

      // Make sure both the feed and the today-garden query refresh
      await Promise.all([refetchGarden(), refetchFeed()]);
    },
    [regenerateGardenMutation, refetchFeed, refetchGarden],
  );

  return regenerate;
}
