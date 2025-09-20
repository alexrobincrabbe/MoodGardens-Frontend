import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { gqlUrl } from "../lib/env";
import { AuthContext, type Ctx, type AuthUser, type AuthStatus } from "./context";

async function gqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(gqlUrl(), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    const msg = json?.errors?.[0]?.message ?? res.statusText ?? "GraphQL error";
    throw new Error(msg);
  }
  return json.data as T;
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await gqlFetch<{ me: AuthUser | null }>(`query { me { id email createdAt } }`);
      if (data.me) {
        setUser(data.me);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await gqlFetch<{ login: { user: AuthUser } }>(
      `mutation($email:String!, $password:String!) {
        login(email:$email, password:$password) { user { id email createdAt } }
      }`,
      { email, password }
    );
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await gqlFetch<{ logout: boolean }>(`mutation { logout }`);
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo<Ctx>(() => ({
    status, user, isAuthed: status === "authenticated", refresh, login, logout
  }), [status, user, refresh, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
