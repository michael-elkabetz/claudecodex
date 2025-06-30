export const GITHUB_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID,
  REDIRECT_URI: import.meta.env.VITE_GITHUB_REDIRECT_URI,
  SCOPES: 'repo',
} as const; 