import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ResetPassword } from "../graphql/auth";
import toast from "react-hot-toast";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [resetPassword, { loading }] = useMutation(ResetPassword);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    if (!token) {
      toast.error("Missing reset token.");
      navigate("/#login");
    }
  }, [token, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!token) {
      const message = "Reset link is invalid or missing.";
      setMsg(message);
      toast.error(message);
      return;
    }

    const pw = password.trim();
    const pw2 = confirm.trim();

    if (!pw || !pw2) {
      const message = "Please enter and confirm your new password.";
      setMsg(message);
      toast.error(message);
      return;
    }

    if (pw !== pw2) {
      const message = "Passwords do not match.";
      setMsg(message);
      toast.error(message);
      return;
    }

    if (pw.length < 8) {
      const message = "Password must be at least 8 characters long.";
      setMsg(message);
      toast.error(message);
      return;
    }

    try {
      const result = await resetPassword({
        variables: {
          token,
          newPassword: pw,
        },
      });

      if (!result.data?.resetPassword) {
        const fallback = "Password reset failed. Please try again.";
        setMsg(fallback);
        toast.error(fallback);
        return;
      }

      toast.success("Your password has been updated. You can now sign in.");
      navigate("/#login");
    } catch (err: any) {
      console.error("[ResetPassword] error:", err);

      const graphError = err?.graphQLErrors?.[0];
      const network = err?.networkError as any;

      const detailed =
        graphError?.message ||
        network?.result?.errors?.[0]?.message ||
        network?.message ||
        err?.message ||
        "Password reset failed.";

      setMsg(detailed);
      toast.error(detailed);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
      >
        <h1 className="mb-4 text-center text-xl font-semibold text-slate-800">
          Reset your password
        </h1>

        <div className="mb-3">
          <label className="block text-sm text-slate-700">New password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg bg-emerald-50 p-2"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-slate-700">
            Confirm new password
          </label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg bg-emerald-50 p-2"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-coral py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Updating password…" : "Update password"}
        </button>

        {msg && (
          <p className="mt-3 text-center text-sm text-gray-600">{msg}</p>
        )}
      </form>
    </div>
  );
}
