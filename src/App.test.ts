import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import App from './App.vue'
import { createAppRouter } from './router'

describe('App', () => {
  it('mounts the router shell', async () => {
    const router = createAppRouter()
    router.push('/login')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.text()).toContain('RIALMA TrackVision')
  })
})
