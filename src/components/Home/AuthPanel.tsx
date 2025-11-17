import { useState } from "react";
import { User } from "../../graphql/auth";
import { useAuthPanel } from "../../contexts";
import toast from "react-hot-toast";
import { GenericButton } from "../Common/GenericButton";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@apollo/client";
import { LoginWithGoogle } from "../../graphql/auth";

export function AuthPanel() {
  return (
    <div className="rounded-xl p-4">
      <div className="mb-3 flex justify-center">
        <SetModeButton className="flex-1" buttonMode="login" />
        <SetModeButton className="flex-1" buttonMode="register" />
      </div>
      <RegisterLoginForm />
    </div>
  );
}

type SetModeButtonProps = {
  buttonMode: "register" | "login";
  className: string;
};

function SetModeButton({ buttonMode, className }: SetModeButtonProps) {
  const { mode, setMode, busy } = useAuthPanel();
  return (
    <button
      type="button"
      onClick={() => setMode(buttonMode)}
      className={
        className +
        ` px-3 py-1 ${
          buttonMode === mode
            ? "bg-coral border-2 border-slate-500 text-white"
            : "bg-peach-cream"
        }`
      }
      disabled={busy}
    >
      {buttonMode}
    </button>
  );
}

function RegisterLoginForm() {
  const [loginWithGoogleMut] = useMutation(LoginWithGoogle);

  const { mode, busy, registerMut, loginMut, client } = useAuthPanel();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [msg, setMsg] = useState<string>("");
  const navigate = useNavigate();

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
        toast.success(`Registered with email address ${loginDetails.email}`);
        setPassword("");
        setDisplayName("");
        navigate("/today");
      } else {
        const loginUser = await loginMut({
          variables: loginDetails,
          refetchQueries: [{ query: User }],
        });
        await client.resetStore();

        const user = loginUser.data?.login?.user;
        if (!user) throw new Error("Unexpected response.");
        toast.success(`Signed in as ${loginDetails.email}`);
        setMsg("Signed in.");
        setPassword("");
        navigate("/today");
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
        JSON.stringify(network?.result ?? err, null, 2),
      );
    }
  }

  return (
    <form
      id="login"
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col items-center space-y-3"
    >
      <div>
        <label className="block text-center">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-lg bg-emerald-50 p-2 text-center"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />
      </div>
      {mode === "register" && (
        <div>
          <label className="block text-center">Display Name</label>
          <input
            className="mt-1 w-full rounded-lg bg-emerald-50 p-2 text-center"
            placeholder="choose a name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={busy}
          />
        </div>
      )}
      <div>
        <label className="block text-center">Password</label>
        <input
          type="password"
          className="mt-1 w-full rounded-lg bg-emerald-50 p-2 text-center"
          placeholder="••••••••"
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
        />
      </div>

      <GenericButton
        type="submit"
        disabled={busy}
        className="bg-peach-cream rounded-lg px-4 py-2 disabled:opacity-60"
      >
        {busy
          ? mode === "register"
            ? "Registering…"
            : "Signing in…"
          : mode === "register"
            ? "Create account"
            : "Sign in"}
      </GenericButton>

      {/* Divider */}
      <div className="my-2 text-xs text-gray-400">or</div>

      {/* Google login */}

      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const idToken = credentialResponse.credential;
            if (!idToken) {
              toast.error("Could not get Google credential.");
              return;
            }

            const result = await loginWithGoogleMut({
              variables: { idToken },
              refetchQueries: [{ query: User }],
            });

            await client.resetStore();

            const user = result.data?.loginWithGoogle?.user;
            if (!user)
              throw new Error("Unexpected response from Google login.");

            toast.success(`Signed in as ${user.email}`);
            setMsg("Signed in.");
            setPassword("");
            navigate("/today");
          } catch (err: any) {
            console.log(err);
            // same error handling pattern as your other mutations
          }
        }}
        onError={() => {
          toast.error("Google login failed.");
        }}
      />

      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </form>
  );
}
