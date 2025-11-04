import { useState } from "react";
import {
  useAuthData,
  useMakeCells,
  useMakePreviewGallery,
  useFetchGardens,
  useMakeCalendarGardens,
} from "../hooks";
import {
  PreviewModal,
  YearMonthSelector,
  WeekdayHeaders,
  CalendarGrid,
  LoadingErrorMessage
} from "../components";
import type { SelectedGarden } from "../types";

export function Calendar() {
  const { authed, authReady } = useAuthData();
  const skip = !authReady || !authed;
  const [selected, setSelected] = useState<SelectedGarden | null>(null);
  const thisMonth = new Date().toLocaleString("default", { month: "long" });
  const thisYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>(thisMonth);
  const [selectedYear, setSelectedYear] = useState<number>(thisYear);
  const years = Array.from({ length: thisYear - 2024 + 1 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" })
  );
  const monthIndex = months.findIndex((m) => m === selectedMonth);
  const cells = useMakeCells({ year: selectedYear, monthIndex });
  const { data, loading, error } = useFetchGardens({
    skip,
    year: selectedYear,
    monthIndex,
  });
  const calendarViewGardens = useMakeCalendarGardens({ data });
  const previewGallery = useMakePreviewGallery({ data });

  return (
    <div className="mx-auto max-w-5xl px-2 py-2 sm:px-4 sm:py-4">
      <YearMonthSelector
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        years={years}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        months={months}
      />
      <WeekdayHeaders />
      <LoadingErrorMessage error={error} loading={loading} />
      <CalendarGrid
        cells={cells}
        calendarViewGardens={calendarViewGardens}
        selectedYear={selectedYear}
        monthIndex={monthIndex}
        setSelected={setSelected}
      />
      {selected && (
        <PreviewModal
          selected={selected}
          onClose={() => setSelected(null)}
          previewGallery={previewGallery}
          onSelect={(item) => setSelected(item)}
        />
      )}
    </div>
  );
}


