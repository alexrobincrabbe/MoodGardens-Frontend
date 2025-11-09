import { useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import { GetGarden, User } from "../graphql";
import { GardenFeedItem } from "../components";
import { toast } from "react-hot-toast";

type PreviewProps = {
  periodKey: string;
  onGardenReady?: () => void;
};

export function TodayGardenPreview({ periodKey, onGardenReady }: PreviewProps) {
  const { data: userData, loading: userLoading } = useQuery(User, {
    fetchPolicy: "cache-first",
  });
  const authed = !!userData?.user;
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

  const hasEverBeenNonReadyRef = useRef(false);
  const hasShownToastRef = useRef(false);
  const hasNotifiedParentRef = useRef(false);

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

  const status = garden?.status;

  // Toast + notify parent when we see it become READY *after* being non-ready
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
      toast.success("Your garden is ready 🌱");
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
    return <GardenFeedItem garden={garden} day={periodKey} />;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Status: <span className="font-medium">{status}</span>
      </p>

      {status === "PENDING" && (
        <p className="text-sm text-gray-500">Generating your mood garden…</p>
      )}

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
    </div>
  );
}
