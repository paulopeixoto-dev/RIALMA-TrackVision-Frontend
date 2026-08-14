import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { ApiError } from '@/services/apiClient'
import { useAuthStore } from '@/stores/authStore'
import { createVuesticTestPlugin } from '@/test/vuestic'
import LoginPage from './LoginPage.vue'

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}))

vi.mock('@/services/permissionProbeService', () => ({
  permissionProbeService: {
    probeEffectivePermissions: vi.fn().mockResolvedValue(['users.manage']),
  },
}))

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/login', name: 'login', component: LoginPage },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
      { path: '/users', name: 'users', component: { template: '<div>Users</div>' } },
    ],
  })
}

async function mountLogin(path = '/login?redirect=/users') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createTestRouter()
  await router.push(path)
  await router.isReady()

  const wrapper = mount(LoginPage, {
    global: {
      plugins: [pinia, router, createVuesticTestPlugin()],
    },
  })

  return { wrapper, router, authStore: useAuthStore() }
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the Vuestic Admin auth template surface', async () => {
    const { wrapper } = await mountLogin()

    expect(wrapper.get('[data-test="auth-template"]').classes()).toContain('auth-template')
    expect(wrapper.get('[data-test="auth-brand-panel"]').text()).toContain('RIALMA')
    expect(wrapper.get('[data-test="login-form"]').text()).toContain('Acesso administrativo')
    expect(wrapper.find('input[name="email"]').exists()).toBe(true)
    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
  })

  it('submits credentials and follows the redirect query', async () => {
    const { wrapper, router, authStore } = await mountLogin('/login?redirect=/users')
    const login = vi.spyOn(authStore, 'login').mockResolvedValue(undefined)

    await wrapper.find('input[name="email"]').setValue('admin@trackvision.local')
    await wrapper.find('input[name="password"]').setValue('Admin@123456')
    await wrapper.get('[data-test="login-form"]').trigger('submit')
    await flushPromises()

    expect(login).toHaveBeenCalledWith({
      email: 'admin@trackvision.local',
      password: 'Admin@123456',
    })
    expect(router.currentRoute.value.fullPath).toBe('/users')
  })

  it('shows an unauthorized message without leaving the login route', async () => {
    const { wrapper, authStore, router } = await mountLogin('/login')
    vi.spyOn(authStore, 'login').mockRejectedValue(new ApiError(401, 'Falha'))

    await wrapper.find('input[name="email"]').setValue('wrong@example.com')
    await wrapper.find('input[name="password"]').setValue('wrong-password')
    await wrapper.get('[data-test="login-form"]').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Credenciais invalidas.')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('toggles password visibility', async () => {
    const { wrapper } = await mountLogin()
    const passwordInput = () => wrapper.find('input[name="password"]')

    expect(passwordInput().attributes('type')).toBe('password')
    await wrapper.get('[data-test="password-visibility"]').trigger('click')
    expect(passwordInput().attributes('type')).toBe('text')
  })
})
