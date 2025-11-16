import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "react-hot-toast";
import { User, UpdateUserSettings, TodayMetaQuery } from "../graphql";

// --- timezone data + labels ---

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

const ALL_TIMEZONES = [...COMMON_TZS, ...OFFSET_ZONES];

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

function getTimezoneLabel(tz: string): string {
  if (TZ_LABEL_OVERRIDES[tz]) return TZ_LABEL_OVERRIDES[tz];
  if (tz.startsWith("UTC")) return tz;
  return tz;
}

// --- component ---

export function Account() {
  const { data, loading, error } = useQuery(User, {
    fetchPolicy: "cache-and-network",
  });

  const [updateSettings, { loading: saving }] = useMutation(UpdateUserSettings);

  const user = data?.user ?? null;

  const [timezone, setTimezone] = useState("UTC");
  const [dayRolloverHour, setDayRolloverHour] = useState(0);

  // Seed from user when it loads
  useEffect(() => {
    if (!user) return;
    setTimezone(user.timezone ?? "UTC");
    setDayRolloverHour(user.dayRolloverHour ?? 0);
  }, [user]);

  // Helper: save settings when a value changes
  async function saveSettings(partial: {
    timezone?: string;
    dayRolloverHour?: number;
  }) {
    const nextTimezone = partial.timezone ?? timezone;
    const nextHour =
      partial.dayRolloverHour ?? dayRolloverHour ?? 0;

    // Update local state immediately for snappy UI
    setTimezone(nextTimezone);
    setDayRolloverHour(nextHour);

    try {
      const safeHour = Math.min(23, Math.max(0, Math.floor(nextHour)));

      await updateSettings({
        variables: {
          timezone: nextTimezone,
          dayRolloverHour: safeHour,
        },
        refetchQueries: [
          { query: User },
          { query: TodayMetaQuery }, // so Today page uses fresh day key
        ],
        awaitRefetchQueries: false,
      });

      toast.success("Settings updated");
    } catch (err) {
      console.error("[Account] updateUserSettings failed:", err);
      toast.error("Could not update settings. Please try again.");
    }
  }

  if (loading && !user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6">
        <p className="text-sm text-gray-500">Loading account settings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6">
        <p className="text-sm text-red-600">
          Could not load account settings: {error.message}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6">
        <p className="text-sm text-gray-600">
          Please sign in to view and edit your account settings.
        </p>
      </div>
    );
  }

  const isKnownTimezone = ALL_TIMEZONES.includes(timezone);

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Account</h1>

      <section className="space-y-1">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Email:</span> {user.email}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Display name:</span>{" "}
          {user.displayName}
        </p>
      </section>

      <section className="space-y-6">
        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={isKnownTimezone ? timezone : "CUSTOM"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "CUSTOM") return;
              saveSettings({ timezone: val });
            }}
            disabled={saving}
          >
            {ALL_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {getTimezoneLabel(tz)}
              </option>
            ))}
            <option value="CUSTOM">Custom timezone…</option>
          </select>

          {/* Custom text input when timezone isn't in the list */}
          {!isKnownTimezone && (
            <input
              className="mt-2 w-full rounded-md border border-gray-300 p-2 text-sm"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              onBlur={() => saveSettings({ timezone })}
              placeholder="Enter IANA timezone, e.g. Europe/Berlin"
              disabled={saving}
            />
          )}

          <p className="text-xs text-gray-500 mt-1">
            Used to decide which day your diary entry belongs to.
          </p>
        </div>

        {/* Day rollover hour */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Day rollover time
          </label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={dayRolloverHour}
            onChange={(e) => {
              const hour = Number(e.target.value);
              saveSettings({ dayRolloverHour: hour });
            }}
            disabled={saving}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}:00
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Entries after midnight but before this time count as the previous
            day.
          </p>
        </div>
      </section>
    </div>
  );
}
