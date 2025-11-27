import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useApolloClient } from "@apollo/client";
import { VerifyEmail } from "../graphql/auth";
import toast from "react-hot-toast";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [verifyEmail, { loading }] = useMutation(VerifyEmail);
  const client = useApolloClient(); // 👈 get Apollo Client instance

  useEffect(() => {
    async function doVerify() {
      if (!token) {
        toast.error("Missing verification token.");
        navigate("/#login");
        return;
      }

      try {
        await verifyEmail({ variables: { token } });

        // 🔄 Reset the Apollo cache so `user` query updates
        await client.resetStore();

        toast.success("Email verified! You're now signed in.");
        navigate("/today");
      } catch (err: any) {
        console.error(err);
        toast.error(
          err?.graphQLErrors?.[0]?.message ||
            "Verification failed or token expired."
        );
        navigate("/#login");
      }
    }

    doVerify();
  }, [token, verifyEmail, client, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg text-gray-600">
        {loading ? "Verifying your email…" : "Preparing verification…"}
      </p>
    </div>
  );
}
