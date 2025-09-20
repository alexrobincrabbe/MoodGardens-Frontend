import { createContext, useContext } from "react";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
export type AuthUser = { id: string; email: string; createdAt: string };
export type Ctx = {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthed: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<Ctx | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
