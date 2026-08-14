import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createVuesticTestPlugin } from '@/test/vuestic'
import BaseButton from './BaseButton.vue'

function mountButton(props = {}) {
  return mount(BaseButton, {
    props,
    slots: { default: 'Salvar' },
    global: { plugins: [createVuesticTestPlugin()] },
  })
}

describe('BaseButton', () => {
  it('renders through Vuestic button while keeping loading disabled', () => {
    const wrapper = mountButton({ loading: true })

    expect(wrapper.findComponent({ name: 'VaButton' }).exists()).toBe(true)
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Salvar')
  })

  it('emits click when enabled', async () => {
    const onClick = vi.fn()
    const wrapper = mount(BaseButton, {
      slots: { default: 'Entrar' },
      attrs: { onClick },
      global: { plugins: [createVuesticTestPlugin()] },
    })

    await wrapper.get('button').trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
