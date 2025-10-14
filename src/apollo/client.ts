import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { gqlUrl } from "../lib/env";

export function makeApolloClient(onUnauthed?: () => void) {
    const httpLink = createHttpLink({
        uri: gqlUrl(),            // <-- uses API_BASE
        credentials: "include",   // send cookies
    });

    const errorLink = onError(({ graphQLErrors, networkError }) => {
        const unauth =
            graphQLErrors?.some((e) => (e.extensions as any)?.code === "UNAUTHENTICATED") ||
            (networkError as any)?.statusCode === 401;
        if (unauth && onUnauthed) onUnauthed();
    });

    return new ApolloClient({
        link: from([errorLink, httpLink]),
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: { errorPolicy: "ignore" },
            query: { errorPolicy: "ignore" },
            mutate: { errorPolicy: "all" },
        },
    });
}

