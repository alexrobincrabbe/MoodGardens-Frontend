import { useState } from "react";
import { User } from "../graphql/auth";
import { AuthPanelProvider, useAuthPanel } from "../contexts";

export function AuthPanel() {
  return (
    <AuthPanelProvider>
      <div className="rounded-xl border p-4">
        <div className="mb-3 flex gap-2">
          <SetModeButton buttonMode="login" />
          <SetModeButton buttonMode="register" />
        </div>
        <RegisterLoginForm />
      </div>
    </AuthPanelProvider>
  );
}

type SetModeButtonProps = {
  buttonMode: "register" | "login";
};

function SetModeButton({ buttonMode }: SetModeButtonProps) {
  const { setMode, busy } = useAuthPanel();
  return (
    <button
      type="button"
      onClick={() => setMode(buttonMode)}
      className={`rounded-lg px-3 py-1 text-sm ${
        buttonMode === "login" ? "bg-black text-white" : "border"
      }`}
      disabled={busy}
    >
      {buttonMode}
    </button>
  );
}

function RegisterLoginForm() {
  const { mode, busy, registerMut, loginMut, client } = useAuthPanel();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [msg, setMsg] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    try {
      const loginDetails = { email: email.trim(), password };
      if (!loginDetails.email || !loginDetails.password) {
        setMsg("Please enter email and password.");
        return;
      }

      if (mode === "register") {
        const registerDetails = {
          ...loginDetails,
          displayName: displayName.trim(),
        };
        if (!registerDetails.displayName) {
          setMsg("Please enter a display name.");
          return;
        }
        const newUser = await registerMut({
          variables: registerDetails,
          refetchQueries: [{ query: User }],
        });
        await client.resetStore();

        const user = newUser.data?.register?.user;
        if (!user) throw new Error("Unexpected response.");
        setMsg("Registered & signed in.");
        setPassword("");
        setDisplayName("");
      } else {
        const loginUser = await loginMut({
          variables: loginDetails,
          refetchQueries: [{ query: User }],
        });
        await client.resetStore();

        const user = loginUser.data?.login?.user;
        if (!user) throw new Error("Unexpected response.");
        setMsg("Signed in.");
        setPassword("");
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

  return (
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
      {mode === "register" && (
        <div>
          <label className="block text-sm font-medium">Display Name</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            placeholder="choose a name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={busy}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          className="mt-1 w-full rounded-lg border p-2"
          placeholder="••••••••"
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
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
        {busy
          ? mode === "register"
            ? "Registering…"
            : "Signing in…"
          : mode === "register"
          ? "Create account"
          : "Sign in"}
      </button>

      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </form>
  );
}
