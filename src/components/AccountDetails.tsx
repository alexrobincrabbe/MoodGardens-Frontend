import { useState } from "react";
import { Me, UpdateDisplayName} from "../graphql/auth";
import { useQuery, useMutation } from "@apollo/client";

export default function AccountDetails() {
  const { data: userData, loading: meLoading } = useQuery(Me, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const me = userData?.me ?? null;
  
  const [displayName, setDisplayName] = useState(me.displayName);
  const [displayNameMut, { loading: displayNameUpdating }] =
    useMutation(UpdateDisplayName);

  async function submitDisplayName(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName) {
      return;
    }
    await displayNameMut({
          variables: {displayName: displayName},
          refetchQueries: [{ query: Me }],
        });
  }
    const busy = meLoading && displayNameUpdating;

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div>{me.di}</div>
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
        className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-60">{ displayNameUpdating ? "Updating..." : "Update"}</button>
      </div>
    </div>
  );
}
