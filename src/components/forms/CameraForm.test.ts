import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createVuesticTestPlugin } from '@/test/vuestic'
import CameraForm from './CameraForm.vue'

describe('CameraForm', () => {
  it('does not display existing camera password and emits password only when typed', async () => {
    const wrapper = mount(CameraForm, {
      props: {
        modelValue: {
          location_id: 1,
          edge_node_id: 1,
          name: 'LPR Entrada',
          type: 'lpr',
          vendor: 'intelbras',
          host: '192.168.1.10',
          port: 80,
          channel: 1,
          username: 'admin',
          password: '',
          is_active: true,
        },
        locations: [{ id: 1, uuid: 'loc-1', name: 'Portaria', description: null, is_active: true }],
        edgeNodes: [{
          id: 1,
          uuid: 'edge-1',
          name: 'Edge 01',
          description: null,
          status: 'offline',
          last_seen_at: null,
          is_active: true,
          location: { id: 1, uuid: 'loc-1', name: 'Portaria', description: null, is_active: true },
        }],
        errors: {},
        submitting: false,
      },
      global: { plugins: [createVuesticTestPlugin()] },
    })

    expect(wrapper.text()).not.toContain('camera-secret')

    await wrapper.find('input[name="password"]').setValue('new-secret')

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, unknown>
    expect(emitted.password).toBe('new-secret')
  })
})
