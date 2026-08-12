import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { createAppRouter } from './index'

vi.mock('@/services/authService', () => ({
  authService: {
    logout: vi.fn().mockResolvedValue(undefined),
    me: vi.fn().mockResolvedValue({ id: 1, name: 'Paulo', email: 'paulo@example.com' }),
  },
}))

vi.mock('@/services/permissionProbeService', () => ({
  permissionProbeService: {
    probeEffectivePermissions: vi.fn().mockResolvedValue([]),
  },
}))

describe('router guards', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('redirects unauthenticated users from protected routes to login', async () => {
    const router = createAppRouter()

    await router.push('/vehicles')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('redirects authenticated users without route permission to forbidden', async () => {
    const store = useAuthStore()
    store.token = 'token-123'
    store.user = { id: 1, name: 'Paulo', email: 'paulo@example.com' }
    store.permissions = []

    const router = createAppRouter()

    await router.push('/vehicles')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('forbidden')
  })
})
