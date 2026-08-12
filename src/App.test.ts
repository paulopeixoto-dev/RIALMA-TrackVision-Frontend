import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import App from './App.vue'
import { createAppRouter } from './router'

describe('App', () => {
  it('mounts the router shell', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createAppRouter()

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    })

    await router.push('/login')
    await router.isReady()

    expect(wrapper.text()).toContain('RIALMA TrackVision')
  })
})
