// src/pages/Gardens.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gql, useLazyQuery, useMutation } from "@apollo/client";

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

type Period = "DAY" | "WEEK" | "MONTH" | "YEAR";

function periodKeyFor(p: Period, d = new Date()) {
  const iso = d.toISOString();
  if (p === "DAY") return iso.slice(0, 10); // YYYY-MM-DD (UTC)
  if (p === "MONTH") return iso.slice(0, 7); // YYYY-MM
  if (p === "YEAR") return iso.slice(0, 4); // YYYY
  // WEEK: approximate ISO week key “YYYY-W##”
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Monday=0
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export default function Gardens() {
  const [period, setPeriod] = useState<Period>("DAY");
  const computedKey = useMemo(() => periodKeyFor(period), [period]);
  const [currentKey, setCurrentKey] = useState<string>(() =>
    periodKeyFor("DAY")
  );
  const pollTimer = useRef<number | null>(null);
  const pollingKeyRef = useRef<string>("");
  const [fetchGarden, { data, loading, error, refetch }] = useLazyQuery(
    GetGarden,
    {
      fetchPolicy: "network-only",
    }
  );
  const [requestGarden, { loading: requesting, error: requestError }] =
    useMutation(RequestGarden);

  const garden = data?.garden;

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    pollingKeyRef.current = "";
  }, []);

  const startPolling = useCallback(
    (period: Period, periodKey: string) => {
      stopPolling();
      pollingKeyRef.current = `${period}:${periodKey}`;
      pollTimer.current = window.setInterval(() => {
        if (pollingKeyRef.current === `${period}:${periodKey}`) {
          if (refetch) {
            refetch({ period, periodKey });
          } else {
            fetchGarden({ variables: { period, periodKey } });
          }
        }
      }, 1500);
    },
    [fetchGarden, refetch, stopPolling]
  );
  const status = garden?.status;

  useEffect(() => {
    if (status === "READY" || status === "FAILED") {
      stopPolling();
    }
  }, [status, stopPolling]);

  // cleanup on unmount: use the stable callback
  useEffect(() => stopPolling, [stopPolling]);

  // when using them:
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
  const busy = loading || requesting;

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gardens</h1>
          <p className="text-sm text-gray-500">
            View or generate your gardens by period.
          </p>
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
          <button
            className="rounded border px-3 py-2 text-sm"
            onClick={onFetch}
            disabled={busy}
          >
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
          <p className="mt-2 text-gray-500">
            No garden yet for this period/key.
          </p>
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
                  <a
                    href={garden.imageUrl}
                    download
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Download
                  </a>
                  <button
                    className="rounded border px-3 py-1 text-sm"
                    onClick={() =>
                      navigator.clipboard.writeText(garden.imageUrl)
                    }
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}

            {garden.status === "FAILED" && (
              <p className="mt-2 text-sm text-red-600">
                Generation failed. Please try again.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
