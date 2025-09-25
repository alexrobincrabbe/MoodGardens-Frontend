import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { MyGardensByMonth } from "../graphql";
import { periodKeyFor, isoDayKey } from "../utils";

export default function Calendar() {
  const thisMonth = new Date().toLocaleString("default", { month: "long" });
  const [selectedMonth, setSelectedMonth] = useState<string>(thisMonth);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" })
  );
  const monthIndex = months.findIndex((m) => m === selectedMonth);
  const year = 2025;

  // UTC-safe month math
  const daysInMonth = useMemo(
    () => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate(),
    [year, monthIndex]
  );
  const firstOfMonthUTC = useMemo(
    () => new Date(Date.UTC(year, monthIndex, 1)),
    [year, monthIndex]
  );
  const leadingBlanks = useMemo(() => {
    const sun0 = firstOfMonthUTC.getUTCDay();
    return (sun0 + 6) % 7; // Mon-first
  }, [firstOfMonthUTC]);

  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < leadingBlanks; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [leadingBlanks, daysInMonth]);

  // Data
  const monthKey = useMemo(
    () => periodKeyFor("MONTH", new Date(Date.UTC(year, monthIndex, 1))),
    [year, monthIndex]
  );
  const { data, loading, error } = useQuery(MyGardensByMonth, { variables: { monthKey } });

  const byDay = useMemo(() => {
    const list = data?.myGardensByMonth ?? [];
    return Object.fromEntries(list.map((g: any) => [g.periodKey, g]));
  }, [data]);

  return (
    <div className="mx-auto max-w-5xl px-2 py-2 sm:px-4 sm:py-4">
      {/* Month selector */}
      <div className="mb-2 sm:mb-3">
        {isEditing ? (
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setIsEditing(false);
            }}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="cursor-pointer text-left text-base font-semibold sm:text-lg"
            title="Click to change month"
          >
            {selectedMonth} {year}
          </button>
        )}
      </div>

      {/* Weekday header (Mon–Sun) */}
      <div className="mb-1 grid grid-cols-7 gap-px text-center text-[10px] font-medium text-gray-600 sm:mb-2 sm:gap-2 sm:text-xs">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="p-1">
            {d}
          </div>
        ))}
      </div>

      {/* Loading / error */}
      {loading && <div className="mb-2 text-[11px] text-gray-500">Loading gardens…</div>}
      {error && <div className="mb-2 text-[11px] text-red-600">Failed to load.</div>}

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px sm:gap-2 md:gap-3">
        {cells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`blank-${idx}`}
                className="min-h-16 rounded border border-gray-100 bg-gray-50 sm:min-h-24"
              />
            );
          }

          const dUTC = new Date(Date.UTC(year, monthIndex, day));
          const key = isoDayKey(dUTC);
          const g = byDay[key] as
            | { imageUrl?: string | null; summary?: string | null; status?: string }
            | undefined;

          return (
            <div className="flex flex-col gap-1 rounded border border-gray-200 bg-white p-1 sm:gap-2 sm:p-2" key={key}>
              <div className="text-[10px] text-gray-500">{day}</div>

              {/* Square image slot */}
              <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-50">
                {g?.imageUrl ? (
                  <img
                    src={g.imageUrl}
                    alt={g.summary ?? "Garden preview"}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                    Empty
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
