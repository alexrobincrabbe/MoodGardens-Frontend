import { useMutation } from "@apollo/client";
import { Logout, User } from "../graphql/auth";
import { useAuthPanel } from "../contexts";
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
    } catch (err) {
      console.error("[Auth] logout error:", err);
    }
  }

  if (busy || !user) return null;

  return (
    <span className="flex justify-center">
      <GenericButton
        onClick={handleLogoutClick}
        disabled={logoutLoading}
        className=""
      >
        {logoutLoading ? "Signing out…" : "Sign out"}
      </GenericButton>
    </span>
  );
}
