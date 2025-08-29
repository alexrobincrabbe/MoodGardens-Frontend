// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const apollo = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:4000/graphql",
    credentials: "omit", // <= key change
  }),
  cache: new InMemoryCache(),
});

