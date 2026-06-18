import { useAuthStore } from '@/store/authStore'

const BASE_URL = 'http://150.136.246.222:3000'

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

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText)
  }

  // 204 / empty bodies (e.g. soft-delete) have nothing to parse.
  if (response.status === 204) return undefined as T
  const text = await response.text()
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
