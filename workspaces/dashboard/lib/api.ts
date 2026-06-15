// Single source of truth for API base URL
// Falls back chain: env var → production URL
export const API_BASE = 
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://ventureos-production.up.railway.app')

export async function apiFetch(path: string, options?: RequestInit) {
  const url = API_BASE 
    ? `${API_BASE}${path}` 
    : path
  return fetch(url, options)
}
