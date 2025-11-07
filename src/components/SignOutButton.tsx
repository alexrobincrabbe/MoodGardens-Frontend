import {  useMutation } from "@apollo/client";
import { Logout, User } from "../graphql/auth";
import { useAuthPanel } from "../contexts";
import { toast } from "react-hot-toast";

export function SignOutButton() {
  const { user, busy, client } = useAuthPanel();
  const [logoutMut, { loading: logoutLoading }] = useMutation(Logout);

  async function handleLogoutClick() {
    try {
      await logoutMut();
      await client.resetStore();
      client.writeQuery({ query: User, data: { user: null } });
      await client.clearStore();
      toast.success("Signed out!");
    } catch (err) {
      console.error("[Auth] logout error:", err);
    }
  }

  if (busy || !user) return null;

  return (
      <button
        onClick={handleLogoutClick}
        disabled={logoutLoading}
        className="m-1 w-30 rounded-lg px-3 py-1 text-sm text-charcoal-grey bg-peach-cream hover:bg-eucalyptus disabled:opacity-60"
      >
        {logoutLoading ? "Signing out…" : "Sign out"}
      </button>
  );
}
