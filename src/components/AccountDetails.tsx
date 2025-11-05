import { useState } from "react";
import { User, UpdateDisplayName } from "../graphql/auth";
import { useMutation } from "@apollo/client";
import { useAuthData } from "../hooks";

export function AccountDetails() {
  const { user, authReady } = useAuthData();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [displayNameMut, { loading: displayNameUpdating }] =
    useMutation(UpdateDisplayName);

  async function submitDisplayName(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName) {
      return;
    }
    await displayNameMut({
      variables: { displayName: displayName },
      refetchQueries: [{ query: User }],
    });
  }
  const busy = !authReady && displayNameUpdating;

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div>{user.di}</div>
        <label className="block text-sm font-medium">Change Display Name</label>
        <input
          className="mt-1 w-full rounded-lg border p-2"
          placeholder="choose a name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={busy}
        />
        <button
          onClick={submitDisplayName}
          className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {displayNameUpdating ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
}
