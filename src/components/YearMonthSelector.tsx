type YearMonthSelectorProps = {
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  years: number[];
  selectedMonth: string;
  setSelectedMonth: React.Dispatch<React.SetStateAction<string>>;
  months: string[];
};

export function YearMonthSelector({
  selectedYear,
  setSelectedYear,
  years,
  selectedMonth,
  setSelectedMonth,
  months,
}: YearMonthSelectorProps) {
  return (
    <div className="mb-2 sm:mb-3">
      <select
        value={selectedYear}
        onChange={(e) => {
          setSelectedYear(Number(e.target.value));
        }}
        autoFocus
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <select
        value={selectedMonth}
        onChange={(e) => {
          setSelectedMonth(e.target.value);
        }}
        autoFocus
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
      >
        {months.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
}
