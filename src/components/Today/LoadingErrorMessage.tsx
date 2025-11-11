import { ApolloError } from "@apollo/client";


type LoadingErrorMessageProps = {
  loading: boolean;
  error: ApolloError | undefined;
};

export function LoadingErrorMessage({ loading, error }: LoadingErrorMessageProps) {
  return (
    <>
      {loading && (
        <div className="mb-2 text-[11px] text-gray-500">Loading gardens…</div>
      )}
      {error && (
        <div className="mb-2 text-[11px] text-red-600">Failed to load.</div>
      )}
    </>
  );
}