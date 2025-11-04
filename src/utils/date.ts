export function formatDayKey(dayKey: string): string {
  const date = new Date(dayKey);
  if (isNaN(date.getTime())) return dayKey; // fallback if invalid

  const day = date.getDate();
  const daySuffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  const year = date.getFullYear();

  return `${weekday} ${day}${daySuffix} of ${month} ${year}`;
}
