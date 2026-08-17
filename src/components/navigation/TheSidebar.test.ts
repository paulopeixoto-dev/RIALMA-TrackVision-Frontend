import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import TheSidebar from './TheSidebar.vue'

describe('TheSidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows only navigation items allowed by effective permissions', async () => {
    const authStore = useAuthStore()
    authStore.permissions = ['captures.view']

    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', redirect: '/dashboard' },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
        { path: '/vehicles', name: 'vehicles', component: { template: '<div />' } },
        { path: '/trips', name: 'trips', component: { template: '<div />' } },
        { path: '/recording-devices', name: 'recording-devices', component: { template: '<div />' } },
      ],
    })

    const wrapper = mount(TheSidebar, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Viagens')
    expect(wrapper.text()).not.toContain('Veiculos')
    expect(wrapper.text()).not.toContain('Gravadores/NVRs')
  })

  it('shows the NVR navigation item to users who manage cameras', () => {
    const authStore = useAuthStore()
    authStore.permissions = ['cameras.manage']

    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', redirect: '/dashboard' },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
        { path: '/locations', name: 'locations', component: { template: '<div />' } },
        { path: '/edge-nodes', name: 'edge-nodes', component: { template: '<div />' } },
        { path: '/cameras', name: 'cameras', component: { template: '<div />' } },
        { path: '/camera-pairs', name: 'camera-pairs', component: { template: '<div />' } },
        { path: '/recording-devices', name: 'recording-devices', component: { template: '<div />' } },
      ],
    })

    const wrapper = mount(TheSidebar, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('Gravadores/NVRs')
  })

  it('emits toggle and marks the minimized state', async () => {
    const authStore = useAuthStore()
    authStore.permissions = ['captures.view']

    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', redirect: '/dashboard' },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
        { path: '/trips', name: 'trips', component: { template: '<div />' } },
      ],
    })

    const wrapper = mount(TheSidebar, {
      props: { minimized: true },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.get('[data-test="admin-sidebar"]').classes()).toContain('sidebar--minimized')
    await wrapper.get('[data-test="sidebar-minimize"]').trigger('click')
    expect(wrapper.emitted('toggle-minimized')).toHaveLength(1)
  })
})
