import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createVuesticTestPlugin } from '@/test/vuestic'
import BaseModal from './BaseModal.vue'

describe('BaseModal', () => {
  it('renders through Vuestic modal with title and content when open', () => {
    const wrapper = mount(BaseModal, {
      props: { open: true, title: 'Novo veiculo' },
      slots: { default: 'Formulario' },
      global: {
        plugins: [createVuesticTestPlugin()],
        stubs: { Teleport: true },
      },
    })

    expect(wrapper.findComponent({ name: 'VaModal' }).exists()).toBe(true)
    expect(wrapper.text()).toContain('Novo veiculo')
    expect(wrapper.text()).toContain('Formulario')
  })

  it('emits close from the header action', async () => {
    const wrapper = mount(BaseModal, {
      props: { open: true, title: 'Editar usuario' },
      global: {
        plugins: [createVuesticTestPlugin()],
        stubs: { Teleport: true },
      },
    })

    await wrapper.get('[aria-label="Fechar"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
