

const OFFSET_ZONES = Array.from({ length: 27 }, (_, i) => {
  const offset = i - 12; // -12 → +14
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset).toString().padStart(2, "0");
  return `UTC${sign}${abs}:00`;
});

const COMMON_TZS = [
  "UTC",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Australia/Sydney",
];

export const ALL_TIMEZONES = [...COMMON_TZS, ...OFFSET_ZONES];

const TZ_LABEL_OVERRIDES: Record<string, string> = {
  "Europe/Berlin": "Europe/Berlin (UTC+01:00)",
  "Europe/London": "Europe/London (UTC+00:00)",
  "Europe/Paris": "Europe/Paris (UTC+01:00)",
  "America/New_York": "America/New_York (UTC-05:00)",
  "America/Chicago": "America/Chicago (UTC-06:00)",
  "America/Denver": "America/Denver (UTC-07:00)",
  "America/Los_Angeles": "America/Los_Angeles (UTC-08:00)",
  "Asia/Tokyo": "Asia/Tokyo (UTC+09:00)",
  "Asia/Hong_Kong": "Asia/Hong_Kong (UTC+08:00)",
  "Asia/Singapore": "Asia/Singapore (UTC+08:00)",
  "Australia/Sydney": "Australia/Sydney (UTC+10:00)",
};

export function getTimezoneLabel(tz: string): string {
  if (TZ_LABEL_OVERRIDES[tz]) return TZ_LABEL_OVERRIDES[tz];
  if (tz.startsWith("UTC")) return tz;
  return tz;
}