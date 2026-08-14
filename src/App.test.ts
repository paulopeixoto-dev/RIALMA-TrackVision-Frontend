import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import App from './App.vue'
import { createAppRouter } from './router'
import { createVuesticTestPlugin } from './test/vuestic'

describe('App', () => {
  it('mounts the router shell', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createAppRouter()

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router, createVuesticTestPlugin()],
      },
    })

    await router.push('/login')
    await router.isReady()

    expect(wrapper.text()).toContain('RIALMA TrackVision')
  })
})
