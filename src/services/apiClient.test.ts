import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createApiClient } from './apiClient'

describe('apiClient', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('normalizes validation errors from Laravel responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({
          message: 'The plate field is required.',
          errors: { plate: ['The plate field is required.'] },
        }),
      }),
    )

    const client = createApiClient({ apiBaseUrl: 'http://api.test', getToken: () => 'token' })

    const request = client.post('/admin/vehicles', {})

    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({
      status: 422,
      isUnauthorized: false,
      isForbidden: false,
      errors: { plate: ['The plate field is required.'] },
    })
  })

  it('uses bearer token and handles head responses without JSON parsing', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    const client = createApiClient({ apiBaseUrl: 'http://api.test', getToken: () => 'abc' })

    await client.head('/admin/vehicles')

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Headers

    expect(init.method).toBe('HEAD')
    expect(headers.get('Authorization')).toBe('Bearer abc')
  })

  it('clears persisted session when the API rejects an invalid token', async () => {
    localStorage.setItem('trackvision.token', 'stale-token')
    localStorage.setItem('trackvision.user', JSON.stringify({ id: 1 }))
    localStorage.setItem('trackvision.permissions', JSON.stringify(['captures.view']))
    const unauthorizedListener = vi.fn()
    window.addEventListener('trackvision:unauthorized', unauthorizedListener)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthenticated.' }),
      }),
    )

    const client = createApiClient({
      apiBaseUrl: 'http://api.test',
      getToken: () => localStorage.getItem('trackvision.token'),
    })

    await expect(client.get('/admin/trips')).rejects.toMatchObject({ status: 401 })

    expect(localStorage.getItem('trackvision.token')).toBeNull()
    expect(localStorage.getItem('trackvision.user')).toBeNull()
    expect(localStorage.getItem('trackvision.permissions')).toBeNull()
    expect(unauthorizedListener).toHaveBeenCalledOnce()
    window.removeEventListener('trackvision:unauthorized', unauthorizedListener)
  })
})
