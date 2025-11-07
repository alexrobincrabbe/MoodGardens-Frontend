/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { Register, Login } from "../graphql/auth";
import { useAuthData } from "../hooks";

type AuthMode = "login" | "register";

function useAuthPanelController() {
  const client = useApolloClient();
  const { authReady, authed, user } = useAuthData();
  const [mode, setMode] = useState<AuthMode>("login");
  const [registerMut, { loading: registerLoading }] = useMutation(Register);
  const [loginMut, { loading: loginLoading }] = useMutation(Login);
  const busy = !authReady || registerLoading || loginLoading;
  return {
    authed,
    user,
    mode,
    setMode,
    busy,
    registerMut,
    loginMut,
    client,
  };
}

type AuthPanelController = ReturnType<typeof useAuthPanelController>;

const AuthPanelContext = createContext<AuthPanelController | null>(null);

export function AuthPanelProvider({ children }: { children: ReactNode }) {
  const controller = useAuthPanelController();
  return (
    <AuthPanelContext.Provider value={controller}>
      {children}
    </AuthPanelContext.Provider>
  );
}

export function useAuthPanel() {
  const ctx = useContext(AuthPanelContext);
  if (!ctx) throw new Error("useAuthPanel must be used within AuthPanelProvider");
  return ctx;
}
