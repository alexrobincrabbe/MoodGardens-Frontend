export function WeekdayHeaders() {
  return (
    <div className="mb-1 grid grid-cols-7 gap-px text-center text-[10px] font-medium text-gray-600 sm:mb-2 sm:gap-2 sm:text-xs">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <div key={d} className="p-1">
          {d}
        </div>
      ))}
    </div>
  );
}