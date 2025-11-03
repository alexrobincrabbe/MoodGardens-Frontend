import { useQuery } from "@apollo/client";
import { User } from "../graphql/auth";

export function useAuthData() {
  const { data: userData, loading: userLoading } = useQuery(User, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });
  const user = userData?.user ?? null;
  const authed = !!user;
  const authReady = !userLoading;
  return { user, authed, authReady };
}


