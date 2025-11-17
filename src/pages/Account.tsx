import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-hot-toast";
import {
  User,
  UpdateUserSettings,
  TodayMetaQuery,
  UpdateUserProfile,
  ChangePassword,
} from "../graphql";

import { getTimezoneLabel, ALL_TIMEZONES } from "../utils";
import { useAuthData } from "../hooks";

export function Account() {
  const { user, authReady } = useAuthData();

  // Existing settings
  const [timezone, setTimezone] = useState("UTC");
  const [dayRolloverHour, setDayRolloverHour] = useState(0);

  // New profile fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  // New password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [updateSettings, { loading: savingSettings }] =
    useMutation(UpdateUserSettings);

  const [updateProfile, { loading: savingProfile }] =
    useMutation(UpdateUserProfile);

  const [changePassword, { loading: changingPassword }] =
    useMutation(ChangePassword);

  useEffect(() => {
    if (!user) return;
    setTimezone(user.timezone ?? "UTC");
    setDayRolloverHour(user.dayRolloverHour ?? 0);
    setDisplayName(user.displayName ?? "");
    setEmail(user.email ?? "");
  }, [user]);

  async function saveSettings(partial: {
    timezone?: string;
    dayRolloverHour?: number;
  }) {
    const nextTimezone = partial.timezone ?? timezone;
    const nextHour = partial.dayRolloverHour ?? dayRolloverHour ?? 0;

    setTimezone(nextTimezone);
    setDayRolloverHour(nextHour);

    try {
      const safeHour = Math.min(23, Math.max(0, Math.floor(nextHour)));

      await updateSettings({
        variables: {
          timezone: nextTimezone,
          dayRolloverHour: safeHour,
        },
        refetchQueries: [{ query: User }, { query: TodayMetaQuery }],
        awaitRefetchQueries: false,
      });

      toast.success("Settings updated");
    } catch (err) {
      console.error("[Account] updateUserSettings failed:", err);
      toast.error("Could not update settings. Please try again.");
    }
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email cannot be empty.");
      return;
    }

    try {
      const result = await updateProfile({
        variables: {
          displayName: displayName.trim(),
          email: email.trim(),
        },
        refetchQueries: [{ query: User }],
      });

      if (result.errors && result.errors.length > 0) {
        // Treat GraphQL errors as failures
        const msg =
          result.errors[0].message ?? "Could not update your account details.";
        toast.error(msg);
        return;
      }

      if (!result.data?.updateUserProfile) {
        toast.error("Could not update your account details.");
        return;
      }

      toast.success("Account details updated");
    } catch (err: any) {
      // This still catches *network* errors
      console.error("[Account] updateUserProfile network error:", err);
      toast.error("Network error while updating profile. Please try again.");
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();

    // local validation ...

    try {
      const result = await changePassword({
        variables: {
          currentPassword,
          newPassword,
        },
      });

      if (result.errors && result.errors.length > 0) {
        const msg =
          result.errors[0].message ?? "Could not change your password.";
        toast.error(msg);
        return;
      }

      if (!result.data?.changePassword) {
        toast.error("Could not change your password.");
        return;
      }

      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("[Account] changePassword network error:", err);
      toast.error("Network error while changing password. Please try again.");
    }
  }

  if (!authReady && !user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6">
        <p className="text-sm text-gray-500">Loading account settings…</p>
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
    <div className="mx-auto max-w-xl space-y-8 rounded-2xl bg-white p-6">
      <h1 className="text-3xl font-semibold">Account</h1>

      {/* Profile settings */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Display name
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={savingProfile}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={savingProfile}
            />
            <p className="mt-1 text-xs text-gray-500">
              Used for login and account-related notifications.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      {/* Security / password */}
      <section className="space-y-4 border-t border-gray-100 pt-6">
        <h2 className="text-lg font-medium">Security</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Current password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={changingPassword}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              New password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={changingPassword}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Confirm new password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={changingPassword}
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {changingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>

      {/* Timezone & rollover */}
      <section className="space-y-6 border-t border-gray-100 pt-6">
        {/* Timezone */}
        <div>
          <label className="mb-1 block text-sm font-medium">Timezone</label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={isKnownTimezone ? timezone : "CUSTOM"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "CUSTOM") return;
              saveSettings({ timezone: val });
            }}
            disabled={savingSettings}
          >
            {ALL_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {getTimezoneLabel(tz)}
              </option>
            ))}
            <option value="CUSTOM">Custom timezone…</option>
          </select>

          {!isKnownTimezone && (
            <input
              className="mt-2 w-full rounded-md border border-gray-300 p-2 text-sm"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              onBlur={() => saveSettings({ timezone })}
              placeholder="Enter IANA timezone, e.g. Europe/Berlin"
              disabled={savingSettings}
            />
          )}

          <p className="mt-1 text-xs text-gray-500">
            Used to decide which day your diary entry belongs to.
          </p>
        </div>

        {/* Day rollover hour */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Day rollover time
          </label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={dayRolloverHour}
            onChange={(e) => {
              const hour = Number(e.target.value);
              saveSettings({ dayRolloverHour: hour });
            }}
            disabled={savingSettings}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}:00
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Entries after midnight but before this time count as the previous
            day.
          </p>
        </div>
      </section>
    </div>
  );
}
