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
      ],
    })

    const wrapper = mount(TheSidebar, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Viagens')
    expect(wrapper.text()).not.toContain('Veiculos')
  })
})
