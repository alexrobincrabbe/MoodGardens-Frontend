import { useState, useEffect } from "react";
import { User, UpdateDisplayName } from "../graphql/auth";
import { useMutation } from "@apollo/client";
import { useAuthData } from "../hooks";
import toast from "react-hot-toast";

export function AccountDetails() {
  const { user, authReady } = useAuthData();
  const [displayName, setDisplayName] = useState("");
  const [displayNameMut, { loading: displayNameUpdating }] =
    useMutation(UpdateDisplayName);
  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
  }, [user]);

  async function submitDisplayName(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName) {
      return;
    }
    await displayNameMut({
      variables: { displayName: displayName },
      refetchQueries: [{ query: User }],
    });
    toast.success("Display name updated!")
  }
  const busy = !authReady && displayNameUpdating;

   if (!authReady) {
    return (
      <div className="rounded-xl bg-peach-cream p-4 text-sm text-gray-500">
        Checking your account…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border p-4 text-sm text-gray-500">
        You’re signed out.
      </div>
    );
  }

  return (
    <div className="rounded-xl flex justify-center p-4">
      <div className="flex flex-col w-50 items-center justify-center">
        <div>{user.di}</div>
        <label className="block m-2 w-full text-center text-sm font-medium">Change Display Name</label>
        <input
          className="m-2 pb-1 w-full rounded-lg text-center bg-charcoal-grey p-0 text-2xl text-pastel-aqua"
          placeholder="choose a name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={busy}
        />
        <button
          onClick={submitDisplayName}
          className="m-2 w-full rounded-lg bg-pastel-aqua px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {displayNameUpdating ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
}
