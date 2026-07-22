// C-3 / L-3 FIX: Converted from .js to .ts with proper types.
// The token is stored in module-level state; for multi-process deployments (PM2
// cluster, Kubernetes) replace this with a Redis-backed store.
let accessToken: string | null = null;

export const setAccessToken = (token: string): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => {
  return accessToken;
};
