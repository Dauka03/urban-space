import { useAuthStore } from '@/store/authStore'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://150.136.246.222:3000').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  path: string,
  { method = 'GET', body, headers }: { method?: string; body?: unknown; headers?: HeadersInit } = {}
): Promise<T> {
  const isForm = body instanceof FormData
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      // Let the browser set the multipart boundary for FormData bodies.
      ...(!isForm && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })

  // 204 / empty bodies (e.g. soft-delete) have nothing to parse.
  if (response.status === 204) return undefined as T
  const text = await response.text()

  if (!response.ok) {
    // A 401 on a request we sent a token with means the stored token is stale/invalid.
    // Sign the user out so the UI stops showing them as authenticated.
    // (Login/OTP requests carry no Authorization header, so their 401 = wrong code is untouched.)
    if (response.status === 401 && new Headers(headers).has('Authorization')) {
      useAuthStore.getState().logout()
    }

    // Prefer the server-provided error message; fall back to statusText
    // (often empty over HTTP/2) and finally to a generic label.
    let message = response.statusText || `Request failed (${response.status})`
    if (text) {
      try {
        const parsed = JSON.parse(text) as { message?: string | string[] }
        if (parsed?.message) {
          message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message
        }
      } catch {
        // Non-JSON error body — keep the fallback message.
      }
    }
    throw new ApiError(response.status, message)
  }

  return (text ? JSON.parse(text) : undefined) as T
}

export const apiClient = {
  get: <T>(path: string, headers?: HeadersInit) => request<T>(path, { method: 'GET', headers }),

  post: <T>(path: string, body: unknown, headers?: HeadersInit) =>
    request<T>(path, { method: 'POST', body, headers }),

  patch: <T>(path: string, body: unknown, headers?: HeadersInit) =>
    request<T>(path, { method: 'PATCH', body, headers }),

  delete: <T>(path: string, headers?: HeadersInit) => request<T>(path, { method: 'DELETE', headers }),
}

/** Authorization header for ADMIN/USER-protected endpoints. Empty when not signed in. */
export function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Build a `?a=1&b=2` query string, skipping undefined/null/empty values. */
export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}
