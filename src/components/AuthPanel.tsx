import { useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Me, Register, Login, Logout } from "../graphql/auth";

export default function AuthPanel() {
  const client = useApolloClient();
  const { data, loading: meLoading } = useQuery(Me, { fetchPolicy: "cache-first" });
  const me = data?.me ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [msg, setMsg] = useState<string>("");

  const [registerMut, { loading: regLoading }] = useMutation(Register);
  const [loginMut, { loading: loginLoading }] = useMutation(Login);
  const [logoutMut, { loading: logoutLoading }] = useMutation(Logout);

  const busy = meLoading || regLoading || loginLoading || logoutLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const variables = { email: email.trim(), password };
      if (!variables.email || !variables.password) {
        setMsg("Please enter email and password.");
        return;
      }

      const result =
        mode === "register"
          ? await registerMut({ variables })
          : await loginMut({ variables });

      const user = result.data?.[mode]?.user;
      if (user) {
        // Ensure Apollo cache has the latest "me"
        client.writeQuery({ query: Me, data: { me: user } });
        setMsg(mode === "register" ? "Registered & signed in." : "Signed in.");
        setPassword("");
      } else {
        setMsg("Unexpected response. Please try again.");
      }
    } catch (err: any) {
  const network = (err as any)?.networkError as any;
  const detailed =
    err?.graphQLErrors?.[0]?.message ||
    network?.result?.errors?.[0]?.message ||
    network?.message ||
    err?.message;

  setMsg(detailed || "Authentication failed.");
  console.error(
    "[Auth] register/login error:",
    JSON.stringify(network?.result ?? err, null, 2)
  );
}
  }

  async function handleLogout() {
    setMsg("");
    try {
      await logoutMut();
      // Clear user from cache
      client.writeQuery({ query: Me, data: { me: null } });
      await client.clearStore();
      setMsg("Signed out.");
    } catch (err: any) {
      setMsg(err?.message ?? "Logout failed.");
    }
  }

  if (me) {
    return (
      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Signed in as</p>
            <p className="font-medium">{me.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={busy}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {logoutLoading ? "Signing out…" : "Sign out"}
          </button>
        </div>
        {msg && <p className="mt-2 text-xs text-gray-500">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg px-3 py-1 text-sm ${
            mode === "login" ? "bg-black text-white" : "border"
          }`}
          disabled={busy}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-lg px-3 py-1 text-sm ${
            mode === "register" ? "bg-black text-white" : "border"
          }`}
          disabled={busy}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border p-2"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border p-2"
            placeholder="••••••••"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {busy ? (mode === "register" ? "Registering…" : "Signing in…") : mode === "register" ? "Create account" : "Sign in"}
        </button>

        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </form>
    </div>
  );
}
