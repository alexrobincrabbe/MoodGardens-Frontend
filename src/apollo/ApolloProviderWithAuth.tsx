// src/apollo/ApolloProviderWithAuth.tsx
import React, { useMemo } from "react";
import { ApolloProvider } from "@apollo/client";
import { useAuth } from "../auth/context";
import { makeApolloClient } from "./client";

export default function ApolloProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { refresh } = useAuth();
  const client = useMemo(() => makeApolloClient(() => refresh()), [refresh]);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
