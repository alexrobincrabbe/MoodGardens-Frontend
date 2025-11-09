// useGardenWatcher.ts
import { useQuery } from "@apollo/client";
import { GetGarden } from "../graphql";
import { toast } from "react-hot-toast";
import { useEffect, useRef } from "react";

export function useGardenWatcher(periodKey: string, authed: boolean) {
  const { data, startPolling, stopPolling } = useQuery(GetGarden, {
    variables: { period: "DAY", periodKey },
    skip: !authed,
    fetchPolicy: "network-only",
  });

  const prevStatus = useRef<string | null>(null);
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!authed) return;
    startPolling(3000);
    return () => stopPolling();
  }, [authed, startPolling, stopPolling]);

  useEffect(() => {
    const next = data?.garden?.status;
    if (
      prevStatus.current !== "READY" &&
      next === "READY" &&
      !hasShownToast.current
    ) {
      toast.success("Your garden is ready 🌱");
      hasShownToast.current = true;
    }
    prevStatus.current = next;
  }, [data?.garden?.status]);
}
