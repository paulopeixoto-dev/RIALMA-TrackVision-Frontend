import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from './authStore'

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      tokenType: 'Bearer',
      accessToken: 'token-123',
      expiresAt: '2026-08-12T10:00:00.000000Z',
      user: { id: 1, name: 'Paulo', email: 'paulo@example.com', permissions: ['vehicles.manage'] },
    }),
    logout: vi.fn().mockResolvedValue(undefined),
    me: vi.fn().mockResolvedValue({ id: 1, name: 'Paulo', email: 'paulo@example.com' }),
  },
}))

vi.mock('@/services/permissionProbeService', () => ({
  permissionProbeService: {
    probeEffectivePermissions: vi.fn().mockResolvedValue(['vehicles.manage']),
  },
}))

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('logs in and persists token, user and effective permissions', async () => {
    const store = useAuthStore()

    await store.login({ email: 'paulo@example.com', password: 'secret' })

    expect(store.token).toBe('token-123')
    expect(store.user?.email).toBe('paulo@example.com')
    expect(store.can('vehicles.manage')).toBe(true)
    expect(localStorage.getItem('trackvision.token')).toBe('token-123')
    expect(localStorage.getItem('trackvision.permissions')).toBe(JSON.stringify(['vehicles.manage']))
  })
})
