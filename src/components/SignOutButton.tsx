import {  useMutation } from "@apollo/client";
import { Logout, User } from "../graphql/auth";
import { useAuthPanel } from "../contexts";
import { toast } from "react-hot-toast";
import { GenericButton } from "./GenericButton";

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
      <GenericButton
        onClick={handleLogoutClick}
        disabled={logoutLoading}
        className="w-30"
      >
        {logoutLoading ? "Signing out…" : "Sign out"}
      </GenericButton>
  );
}
