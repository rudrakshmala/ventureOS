// Single source of truth for API base URL
// Falls back chain: env var → relative (same domain) → empty string
export const API_BASE = 
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 
  ''

export async function apiFetch(path: string, options?: RequestInit) {
  const url = API_BASE 
    ? `${API_BASE}${path}` 
    : path
  return fetch(url, options)
}
