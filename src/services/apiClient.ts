import type { FieldErrors } from '@/types/api'

const sessionKeys = ['trackvision.token', 'trackvision.user', 'trackvision.permissions']

export class ApiError extends Error {
  readonly isUnauthorized: boolean
  readonly isForbidden: boolean

  constructor(
    readonly status: number,
    message: string,
    readonly errors: FieldErrors = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.isUnauthorized = status === 401
    this.isForbidden = status === 403
  }
}

export interface ApiClientOptions {
  apiBaseUrl: string
  getToken: () => string | null
  onUnauthorized?: () => void
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function clearPersistedSession(): void {
  sessionKeys.forEach((key) => localStorage.removeItem(key))
  window.dispatchEvent(new CustomEvent('trackvision:unauthorized'))
}

export function createApiClient(options: ApiClientOptions) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')

    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const token = options.getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(joinUrl(options.apiBaseUrl, path), { ...init, headers })

    if (!response.ok) {
      let payload: { message?: string; errors?: FieldErrors } = {}

      try {
        payload = (await response.json()) as { message?: string; errors?: FieldErrors }
      } catch {
        payload = {}
      }

      if (response.status === 401) {
        clearPersistedSession()
        options.onUnauthorized?.()
      }

      throw new ApiError(response.status, payload.message ?? 'Erro ao comunicar com a API.', payload.errors ?? {})
    }

    if (init.method === 'HEAD' || response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    head: (path: string) => request<void>(path, { method: 'HEAD' }),
  }
}
