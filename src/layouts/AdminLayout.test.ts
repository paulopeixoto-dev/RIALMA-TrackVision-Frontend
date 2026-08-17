import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { createVuesticTestPlugin } from '@/test/vuestic'
import AdminLayout from './AdminLayout.vue'

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
      { path: '/users', name: 'users', component: { template: '<div>Users</div>' } },
      { path: '/roles', name: 'roles', component: { template: '<div>Roles</div>' } },
      { path: '/permissions', name: 'permissions', component: { template: '<div>Permissions</div>' } },
      { path: '/vehicles', name: 'vehicles', component: { template: '<div>Vehicles</div>' } },
      { path: '/trips', name: 'trips', component: { template: '<div>Trips</div>' } },
      { path: '/locations', name: 'locations', component: { template: '<div>Locations</div>' } },
      { path: '/edge-nodes', name: 'edge-nodes', component: { template: '<div>Edge Nodes</div>' } },
      { path: '/cameras', name: 'cameras', component: { template: '<div>Cameras</div>' } },
      { path: '/camera-pairs', name: 'camera-pairs', component: { template: '<div>Camera Pairs</div>' } },
      { path: '/recording-devices', name: 'recording-devices', component: { template: '<div>Recording Devices</div>' } },
    ],
  })
}

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    })
    setActivePinia(createPinia())
    const authStore = useAuthStore()
    authStore.user = { id: 1, name: 'Paulo Peixoto', email: 'admin@trackvision.local', is_active: true, permissions: [] }
    authStore.permissions = ['users.manage', 'vehicles.manage', 'captures.view', 'cameras.manage', 'permissions.manage']
  })

  it('renders a Vuestic layout shell with sidebar, topbar and content', async () => {
    const router = createTestRouter()
    await router.push('/dashboard')
    await router.isReady()

    const wrapper = mount(AdminLayout, {
      global: { plugins: [router, createVuesticTestPlugin()] },
    })

    expect(wrapper.get('[data-test="admin-layout"]').classes()).toContain('admin-layout')
    expect(wrapper.get('[data-test="admin-sidebar"]').text()).toContain('Dashboard')
    expect(wrapper.get('[data-test="admin-topbar"]').text()).toContain('Paulo Peixoto')
    expect(wrapper.text()).toContain('Dashboard')
  })

  it('toggles the minimized sidebar state from the topbar control', async () => {
    const router = createTestRouter()
    await router.push('/dashboard')
    await router.isReady()

    const wrapper = mount(AdminLayout, {
      global: { plugins: [router, createVuesticTestPlugin()] },
    })

    expect(wrapper.get('[data-test="admin-sidebar"]').classes()).not.toContain('sidebar--minimized')
    await wrapper.get('[data-test="sidebar-toggle"]').trigger('click')
    expect(wrapper.get('[data-test="admin-sidebar"]').classes()).toContain('sidebar--minimized')
  })
})
