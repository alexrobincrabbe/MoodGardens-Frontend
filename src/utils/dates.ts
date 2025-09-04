export type Period = "DAY" | "WEEK" | "MONTH" | "YEAR";

export function isoDayKey(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

export function periodKeyFor(p: Period, d = new Date()) {
  const iso = d.toISOString();
  if (p === "DAY") return iso.slice(0, 10);  // YYYY-MM-DD
  if (p === "MONTH") return iso.slice(0, 7); // YYYY-MM
  if (p === "YEAR") return iso.slice(0, 4);  // YYYY

  // WEEK: ISO week key “YYYY-W##”
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
