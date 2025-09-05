import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const uri = import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql";

export const apollo = new ApolloClient({
  link: new HttpLink({
    uri,
    credentials: "include", // send/receive auth cookies cross-site
  }),
  cache: new InMemoryCache(),
});
