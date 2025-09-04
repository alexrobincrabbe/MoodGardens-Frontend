import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GetGarden, RequestGarden } from "../graphql";
import type { Period } from "../utils";
import { periodKeyFor } from "../utils";

// --- small helpers ----------------------------------------------------

const isTerminalStatus = (status?: string) =>
  status === "READY" || status === "FAILED";

// Encapsulate polling using refs for stability
function useGardenPolling(
  refetchFn: (vars: { period: Period; periodKey: string }) => void
) {
  const timerRef = useRef<number | null>(null);
  const targetKeyRef = useRef<string>("");

  const stop = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    targetKeyRef.current = "";
  }, []);

  const start = useCallback(
    (period: Period, periodKey: string) => {
      stop();
      const target = `${period}:${periodKey}`;
      targetKeyRef.current = target;

      timerRef.current = window.setInterval(() => {
        if (targetKeyRef.current === target) {
          refetchFn({ period, periodKey });
        }
      }, 1500);
    },
    [refetchFn, stop]
  );

  useEffect(() => stop, [stop]); // cleanup on unmount
  return { start, stop };
}

// --- page -------------------------------------------------------------

export default function Gardens() {
  // UI state
  const [period, setPeriod] = useState<Period>("DAY");
  const computedKey = useMemo(() => periodKeyFor(period), [period]);
  const [currentKey, setCurrentKey] = useState<string>(() => periodKeyFor("DAY"));

  // Data hooks (shared GraphQL docs)
  const [fetchGarden, { data, loading, error, refetch }] = useLazyQuery(GetGarden, {
    fetchPolicy: "network-only",
  });
  const [requestGarden, { loading: requesting, error: requestError }] =
    useMutation(RequestGarden);

  // Derived
  const garden = data?.garden;
  const status = garden?.status;
  const busy = loading || requesting;

  // Polling (uses refetch when available; falls back to initial fetch)
  const { start: startPolling, stop: stopPolling } = useGardenPolling((vars) =>
    refetch ? refetch(vars) : fetchGarden({ variables: vars })
  );

  // Stop polling when job completes/fails
  useEffect(() => {
    if (isTerminalStatus(status)) stopPolling();
  }, [status, stopPolling]);

  // Handlers
  const onFetch = () => {
    const key = computedKey;
    setCurrentKey(key);
    stopPolling();
    fetchGarden({ variables: { period, periodKey: key } });
  };

  const onGenerate = async () => {
    const key = computedKey;
    setCurrentKey(key);
    stopPolling();
    await requestGarden({ variables: { period, periodKey: key } });
    await fetchGarden({ variables: { period, periodKey: key } });
    startPolling(period, key);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gardens</h1>
          <p className="text-sm text-gray-500">View or generate your gardens by period.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="rounded border px-3 py-2"
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            disabled={busy}
          >
            <option value="DAY">Day</option>
            <option value="WEEK">Week</option>
            <option value="MONTH">Month</option>
            <option value="YEAR">Year</option>
          </select>

          <button className="rounded border px-3 py-2 text-sm" onClick={onFetch} disabled={busy}>
            {loading ? "Loading…" : "Fetch"}
          </button>

          <button
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            onClick={onGenerate}
            disabled={busy}
            title="Request generation and auto-refresh until it's ready"
          >
            {requesting ? "Requesting…" : "Generate"}
          </button>
        </div>
      </header>

      <section className="rounded-xl border p-4">
        <p className="text-sm text-gray-600">
          Period: <span className="font-medium">{period}</span> • Key:{" "}
          <span className="font-mono">{currentKey}</span>
        </p>

        {(error || requestError) && (
          <p className="mt-2 text-sm text-red-600">
            {error?.message || requestError?.message}
          </p>
        )}

        {!garden && !loading && (
          <p className="mt-2 text-gray-500">No garden yet for this period/key.</p>
        )}

        {garden && (
          <div className="mt-4">
            <p className="text-sm">
              Status: <span className="font-medium">{garden.status}</span>
              {garden.updatedAt && (
                <>
                  {" "}
                  • Updated:{" "}
                  <span className="font-mono">
                    {new Date(garden.updatedAt).toLocaleString()}
                  </span>
                </>
              )}
            </p>

            {garden.status === "PENDING" && (
              <p className="mt-2 text-sm text-gray-500">Growing your garden…</p>
            )}

            {garden.imageUrl && garden.status === "READY" && (
              <div className="mt-3">
                <img
                  src={garden.imageUrl}
                  alt={`${garden.period} ${garden.periodKey}`}
                  className="w-full rounded-lg"
                />
                {garden.summary && (
                  <p className="mt-2 text-sm text-gray-600">{garden.summary}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <a href={garden.imageUrl} download className="rounded border px-3 py-1 text-sm">
                    Download
                  </a>
                  <button
                    className="rounded border px-3 py-1 text-sm"
                    onClick={() => navigator.clipboard.writeText(garden.imageUrl)}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}

            {garden.status === "FAILED" && (
              <p className="mt-2 text-sm text-red-600">Generation failed. Please try again.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
