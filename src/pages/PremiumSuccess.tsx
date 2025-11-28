import { useAuthData } from "../hooks";

export function PremiumSuccessPage() {
  const { user, authed } = useAuthData();

  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <h1 className="mb-4 text-3xl font-semibold">Welcome to Mood Gardens Premium 🌱</h1>

      {authed && user?.isPremium ? (
        <p className="mb-4 text-lg">
          Your subscription is active. You now have access to all premium features.
        </p>
      ) : (
        <p className="mb-4 text-lg">
          Your payment was successful. If this page doesn&apos;t update automatically,
          try refreshing — it may take a moment for Stripe to notify the server.
        </p>
      )}

      <a
        href="/account"
        className="inline-block rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
      >
        Go to your account
      </a>
    </div>
  );
}
