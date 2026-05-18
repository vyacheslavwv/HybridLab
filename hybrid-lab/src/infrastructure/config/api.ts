/** Base URL for metrics backend (HTTPS via reverse proxy). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://hybrid-lab.duckdns.org/api';
