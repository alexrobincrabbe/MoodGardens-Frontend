import { Listbox } from "@headlessui/react";

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
      <Listbox value={selectedYear} onChange={setSelectedYear}>
        <div className="relative inline-block">
          <Listbox.Button className="flex w-20 justify-end rounded border border-gray-300 bg-white px-2 py-1">
            <div className="w-full text-left">{selectedYear}</div> ▾
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 w-full rounded border border-gray-200 bg-white shadow-md">
            {years.map((year) => (
              <Listbox.Option
                key={year}
                value={year}
                className={({ active }) =>
                  `cursor-pointer px-3 py-1 ${
                    active
                      ? "bg-emerald-100 text-emerald-800"
                      : "hover:bg-emerald-50"
                  }`
                }
              >
                {year}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      <Listbox value={selectedMonth} onChange={setSelectedMonth}>
        <div className="relative inline-block">
          <Listbox.Button className="flex w-32 justify-end rounded border border-gray-300 bg-white px-2 py-1">
            <div className="w-full text-left">{selectedMonth}</div> ▾
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 w-full rounded border border-gray-200 bg-white shadow-md">
            {months.map((month) => (
              <Listbox.Option
                key={month}
                value={month}
                className={({ active }) =>
                  `cursor-pointer px-3 py-1 ${
                    active
                      ? "bg-emerald-100 text-emerald-800"
                      : "hover:bg-emerald-50"
                  }`
                }
              >
                {month}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
