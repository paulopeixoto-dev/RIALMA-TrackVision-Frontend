import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { createVuesticTestPlugin } from '@/test/vuestic'
import DashboardPage from './DashboardPage.vue'

describe('DashboardPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const authStore = useAuthStore()
    authStore.permissions = ['users.manage', 'vehicles.manage', 'cameras.manage']
  })

  it('renders template dashboard cards for allowed modules', () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', redirect: '/dashboard' },
        { path: '/dashboard', name: 'dashboard', component: DashboardPage },
        { path: '/users', name: 'users', component: { template: '<div />' } },
        { path: '/vehicles', name: 'vehicles', component: { template: '<div />' } },
        { path: '/locations', name: 'locations', component: { template: '<div />' } },
      ],
    })

    const wrapper = mount(DashboardPage, {
      global: { plugins: [router, createVuesticTestPlugin()] },
    })

    const moduleGrid = wrapper.get('[data-test="dashboard-module-grid"]')
    expect(moduleGrid.text()).toContain('Usuarios')
    expect(moduleGrid.text()).toContain('Controle de acesso administrativo')
    expect(moduleGrid.text()).toContain('Veiculos')
    expect(moduleGrid.text()).toContain('Cadastro de caminhoes monitorados')
    expect(moduleGrid.text()).toContain('Locais e cameras')
    expect(moduleGrid.text()).toContain('Topologia de portarias e equipamentos')
  })
})
