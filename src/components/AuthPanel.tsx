import { useState } from "react";
import { User } from "../graphql/auth";
import { useAuthPanel } from "../contexts";
import toast from "react-hot-toast";

export function AuthPanel() {
  return (
    
      <div className="rounded-xl  p-4">
        <div className="mb-3 flex  justify-between gap-2">
          <SetModeButton buttonMode="login" />
          <SetModeButton buttonMode="register" />
        </div>
        <RegisterLoginForm />
      </div>
  );
}

type SetModeButtonProps = {
  buttonMode: "register" | "login";
};

function SetModeButton({ buttonMode }: SetModeButtonProps) {
  const { mode, setMode, busy } = useAuthPanel();
  return (
    <button
      type="button"
      onClick={() => setMode(buttonMode)}
      className={`rounded-lg px-3 py-1 text-charcoal-grey bg-peach-cream text-sm ${
        buttonMode === mode ? "border" : ""
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
        toast.success(`Registered with email address ${loginDetails.email}`)
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
        toast.success(`Signed in as ${loginDetails.email}`)
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
    <form onSubmit={handleSubmit} className="flex flex-col items-center mt-4 space-y-3">
      <div>
        <label className="block text-sm text-center font-medium">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-lg p-2 text-center"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />
      </div>
      {mode === "register" && (
        <div>
          <label className="block text-sm font-medium text-center">Display Name</label>
          <input
            className="mt-1 w-full rounded-lg p-2 text-center"
            placeholder="choose a name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={busy}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-center">Password</label>
        <input
          type="password"
          className="mt-1 w-full rounded-lg p-2 text-center"
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
        className="rounded-lg bg-peach-cream  px-4 py-2 text-charcoal-grey disabled:opacity-60"
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
