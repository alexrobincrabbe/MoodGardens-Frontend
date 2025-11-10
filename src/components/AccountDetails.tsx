import { useState, useEffect } from "react";
import { User, UpdateDisplayName } from "../graphql/auth";
import { useMutation } from "@apollo/client";
import { useAuthData } from "../hooks";
import toast from "react-hot-toast";
import { GenericButton } from "../components";

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
    toast.success("Display name updated!");
  }
  const busy = !authReady && displayNameUpdating;

  if (!authReady) {
    return (
      <div className="bg-peach-cream rounded-xl p-4 text-sm text-gray-500">
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
    <div className="flex justify-center rounded-xl p-4">
      <div className="flex w-50 flex-col items-center justify-center">
        <div>{user.di}</div>
        <label className="m-2 block w-full text-center text-lg">
          Change Display Name
        </label>
        <input
          className="bg-peach-cream m-2 w-full rounded-lg p-0 pb-1 text-center text-2xl font-extrabold"
          placeholder="choose a name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={busy}
        />
        <span className="m-2">
          <GenericButton onClick={submitDisplayName} className="">
            {displayNameUpdating ? "Updating..." : "Update"}
          </GenericButton>
        </span>
      </div>
    </div>
  );
}
