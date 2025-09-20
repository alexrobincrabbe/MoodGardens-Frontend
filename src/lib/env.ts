// Normalizes API_BASE and helps build URLs safely
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, "") ?? "";

/** Join API base + path (handles leading/trailing slashes) */
export const apiUrl = (path: string) =>
  `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

/** GraphQL endpoint URL; if API_BASE is empty, fall back to relative /graphql */
export const gqlUrl = () => (API_BASE ? `${API_BASE}/graphql` : "/graphql");
