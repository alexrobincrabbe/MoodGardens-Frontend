// src/hooks/useLogout.ts
import { useCallback } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { Logout, User } from "../../graphql/auth";

export function useLogout() {
  const client = useApolloClient();
  const [logoutMut, { loading }] = useMutation(Logout);

  const logout = useCallback(async () => {
    try {
      await logoutMut();
      // same cache clearing logic as before
      await client.resetStore();
      client.writeQuery({ query: User, data: { user: null } });
      await client.clearStore();
    } catch (err) {
      console.error("[Auth] logout error:", err);
      throw err;
    }
  }, [logoutMut, client]);

  return { logout, loading };
}
