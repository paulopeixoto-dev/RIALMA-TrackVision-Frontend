import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { createVuesticTestPlugin } from '@/test/vuestic'
import TheTopbar from './TheTopbar.vue'

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
    ],
  })
}

describe('TheTopbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const authStore = useAuthStore()
    authStore.user = { id: 1, name: 'Paulo Peixoto', email: 'admin@trackvision.local', is_active: true, permissions: [] }
  })

  it('shows operational context and emits sidebar toggles', async () => {
    const router = createTestRouter()
    await router.push('/dashboard')
    await router.isReady()

    const wrapper = mount(TheTopbar, {
      global: { plugins: [router, createVuesticTestPlugin()] },
    })

    expect(wrapper.get('[data-test="admin-topbar"]').text()).toContain('Painel administrativo')
    expect(wrapper.get('[data-test="admin-topbar"]').text()).toContain('Paulo Peixoto')
    await wrapper.get('[data-test="sidebar-toggle"]').trigger('click')
    expect(wrapper.emitted('toggle-sidebar')).toHaveLength(1)
  })

  it('logs out and routes to login', async () => {
    const router = createTestRouter()
    await router.push('/dashboard')
    await router.isReady()
    const authStore = useAuthStore()
    const logout = vi.spyOn(authStore, 'logout').mockResolvedValue(undefined)

    const wrapper = mount(TheTopbar, {
      global: { plugins: [router, createVuesticTestPlugin()] },
    })

    await wrapper.get('[data-test="logout-button"]').trigger('click')
    await flushPromises()

    expect(logout).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.name).toBe('login')
  })
})
