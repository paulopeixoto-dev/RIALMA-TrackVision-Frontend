import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuthService } from './authService'

describe('authService', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts credentials and returns normalized login response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        token_type: 'Bearer',
        access_token: 'token-123',
        expires_at: '2026-08-12T10:00:00.000000Z',
        user: { id: 1, name: 'Paulo', email: 'paulo@example.com' },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const service = createAuthService({ apiBaseUrl: 'http://api.test', getToken: () => null })

    const result = await service.login({ email: 'paulo@example.com', password: 'secret' })

    expect(result.accessToken).toBe('token-123')
    expect(result.user.email).toBe('paulo@example.com')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/auth/login',
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })
})
