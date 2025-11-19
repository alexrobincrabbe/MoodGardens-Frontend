import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GetGardensByPeriod } from "../graphql";
import { type Garden, type GardenPeriod } from "../types";



const PERIOD_LABELS: { [P in GardenPeriod]: string } = {
  DAY: "Daily",
  WEEK: "Weekly",
  MONTH: "Monthly",
  YEAR: "Yearly",
};

export function History() {
  const [period, setPeriod] = useState<GardenPeriod>("WEEK");

  const { data, loading, error } = useQuery(GetGardensByPeriod, {
    variables: { period },
    fetchPolicy: "cache-and-network",
  });

  const gardens = data?.gardensByPeriod ?? [];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="inline-flex rounded-full bg-emerald-50 p-1">
        {(["DAY", "WEEK", "MONTH", "YEAR"] as GardenPeriod[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={[
              "px-4 py-1 text-sm rounded-full transition-colors",
              period === p
                ? "bg-emerald-600 text-white"
                : "text-emerald-700 hover:bg-emerald-100",
            ].join(" ")}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading gardens…</p>}
      {error && (
        <p className="text-sm text-red-500">
          Could not load gardens: {error.message}
        </p>
      )}

      {!loading && gardens.length === 0 && (
        <p className="text-sm text-slate-500">
          No {PERIOD_LABELS[period].toLowerCase()} gardens yet. Keep writing and
          they will appear here 🌱
        </p>
      )}

      {/* Timeline style list */}
      <ol className="space-y-4">
        {gardens
          .slice()
          .sort((a: Garden, b: Garden) => (a.periodKey > b.periodKey ? -1 : 1)) // newest first
          .map((g: Garden) => (
            <li
              key={g.id}
              className="flex gap-4 rounded-xl border border-emerald-100 bg-white/70 p-3 shadow-sm"
            >
              <div className="flex flex-col items-center">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="flex-1 w-px bg-emerald-100" />
              </div>
              <div className="flex-1 flex gap-4">
                {g.imageUrl && (
                  <img
                    src={g.imageUrl}
                    alt={`${PERIOD_LABELS[g.period]} garden ${g.periodKey}`}
                    className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-emerald-900">
                      {PERIOD_LABELS[g.period]} garden · {g.periodKey}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wide rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                      {g.status}
                    </span>
                  </div>
                  {g.summary && (
                    <p className="text-sm text-slate-700 line-clamp-3">
                      {g.summary}
                    </p>
                  )}
                  {g.shareUrl && (
                    <a
                      href={g.shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-700 hover:text-emerald-900 underline"
                    >
                      View shared garden
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
      </ol>
    </div>
  );
}
