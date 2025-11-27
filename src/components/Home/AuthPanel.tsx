import { useState } from "react";
import { User } from "../../graphql/auth";
import { useAuthPanel } from "../../contexts";
import toast from "react-hot-toast";
import { GenericButton } from "../Common/GenericButton";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@apollo/client";
import { LoginWithGoogle } from "../../graphql/auth";
import { RequestPasswordReset } from "../../graphql/auth";

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
  const [requestPasswordResetMut] = useMutation(RequestPasswordReset);
  const { mode, setMode, busy, registerMut, loginMut, client } = useAuthPanel();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [msg, setMsg] = useState<string>("");
  const navigate = useNavigate();
  const [resetBusy, setResetBusy] = useState(false);

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

        const result = await registerMut({
          variables: registerDetails,
          // no refetchQueries – user is NOT logged in after register
        });

        // 1) Handle GraphQL errors returned in the result
        const gqlError = result.errors?.[0];
        const code = gqlError?.extensions?.code;

        if (gqlError) {
          console.error("[Auth] register GraphQL error:", gqlError);

          let message =
            gqlError.message || "Registration failed. Please try again.";

          if (code === "EMAIL_IN_USE") {
            message = "That email address is already in use.";
          } else if (code === "BAD_USER_INPUT") {
            // backend already sends nice messages like:
            // "Email, password and display name are required."
            // "Please enter a valid email address."
            // "Password must be at least 8 characters long."
            // so gqlError.message is usually enough
          }

          setMsg(message);
          toast.error(message);
          return;
        }

        // 2) If no GraphQL error but no user, treat as generic failure
        const user = result.data?.register?.user;
        if (!user) {
          const fallback = "Registration failed. Please try again.";
          setMsg(fallback);
          toast.error(fallback);
          return;
        }

        // 🎉 success
        toast.success(
          `Account created for ${loginDetails.email}. Please check your email to verify your address before signing in.`,
        );
        setMsg(
          "Account created. Please check your email for a verification link before signing in.",
        );

        setPassword("");
        setDisplayName("");
        setMode("login");
      } else {
        // LOGIN
        const loginResult = await loginMut({
          variables: loginDetails,
          refetchQueries: [{ query: User }],
        });

        await client.resetStore();

        // 1) Handle GraphQL errors returned in the result (if errorPolicy: 'all')
        const gqlError = loginResult.errors?.[0];
        const code = gqlError?.extensions?.code;

        if (gqlError) {
          console.error("[Auth] login GraphQL error:", gqlError);

          let message = gqlError.message || "Sign-in failed. Please try again.";

          if (code === "EMAIL_NOT_VERIFIED") {
            message =
              "Please verify your email before signing in. Check your inbox for the verification link.";
          } else if (code === "UNAUTHENTICATED") {
            message = "Invalid email or password.";
          }

          setMsg(message);
          toast.error(message);
          return;
        }

        // 2) If no GraphQL error but no user, treat as generic failure
        const user = loginResult.data?.login?.user;
        if (!user) {
          const fallback = "Sign-in failed. Please try again.";
          setMsg(fallback);
          toast.error(fallback);
          return;
        }

        toast.success(`Signed in as ${loginDetails.email}`);
        setMsg("Signed in.");
        setPassword("");
        navigate("/today");
      }
    } catch (err: any) {
      // This catch is for thrown ApolloError / network errors
      console.error("[Auth] register/login error (raw):", err);

      const graphError = err?.graphQLErrors?.[0];
      const network = err?.networkError as any;
      const code = graphError?.extensions?.code;

      let detailed =
        graphError?.message ||
        network?.result?.errors?.[0]?.message ||
        network?.message ||
        err?.message;

      if (code === "EMAIL_NOT_VERIFIED" && mode === "login") {
        detailed =
          "Please verify your email before signing in. Check your inbox for the verification link.";
      } else if (code === "UNAUTHENTICATED" && mode === "login") {
        detailed = "Invalid email or password.";
      } else if (code === "EMAIL_IN_USE" && mode === "register") {
        detailed = "That email address is already in use.";
      }

      if (!detailed) {
        detailed = "Authentication failed.";
      }

      setMsg(detailed);
      toast.error(detailed);
    }
  }

  async function handleRequestPasswordReset() {
    const emailTrimmed = email.trim();

    if (!emailTrimmed) {
      const message = "Please enter your email before requesting a reset.";
      setMsg(message);
      toast.error(message);
      return;
    }

    setResetBusy(true);

    try {
      await requestPasswordResetMut({
        variables: { email: emailTrimmed },
      });
      const message =
        "If an account exists for that email, a password reset link has been sent.";
      toast.success(message);
    } catch (err: any) {
      console.error("[Auth] requestPasswordReset error:", err);

      const graphError = err?.graphQLErrors?.[0];
      const network = err?.networkError as any;

      const detailed =
        graphError?.message ||
        network?.result?.errors?.[0]?.message ||
        network?.message ||
        err?.message ||
        "Failed to request password reset.";

      setMsg(detailed);
      toast.error(detailed);
    } finally {
      setResetBusy(false);
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
      {msg && <p className="text-sm text-red-600">{msg}</p>}

      {/* Forgot password link – only in login mode */}
      {mode === "login" && (
        <button
          type="button"
          onClick={handleRequestPasswordReset}
          disabled={busy || resetBusy}
          className="mt-1 text-sm text-blue-600 underline disabled:opacity-60"
        >
          {resetBusy ? "Sending…" : "Forgot your password?"}
        </button>
      )}

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
    </form>
  );
}
