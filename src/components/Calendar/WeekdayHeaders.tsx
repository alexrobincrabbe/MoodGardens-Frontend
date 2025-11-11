export function WeekdayHeaders() {
  return (
    <div className="md:mb-1 grid grid-cols-7  text-center font-extrabold md:text-xl mb-2 gap-2 text-xs">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <div key={d} className="p-1">
          {d}
        </div>
      ))}
    </div>
  );
}