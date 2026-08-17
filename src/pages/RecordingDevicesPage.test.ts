import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import RecordingDeviceForm from '@/components/forms/RecordingDeviceForm.vue'
import { createVuesticTestPlugin } from '@/test/vuestic'
import RecordingDevicesPage from './RecordingDevicesPage.vue'

vi.mock('@/services/recordingDevicesService', () => ({
  recordingDevicesService: {
    list: vi.fn().mockResolvedValue({
      data: [{
        id: 1,
        uuid: 'nvr-uuid',
        name: 'NVR Portaria 01',
        vendor: 'intelbras',
        protocol: 'http',
        host: '10.0.8.150',
        port: 80,
        username: 'trackvision_ro',
        auth_type: 'digest',
        has_password: true,
        is_active: true,
        location: { id: 1, uuid: 'loc-uuid', name: 'Portaria' },
        edge_node: { id: 1, uuid: 'edge-uuid', name: 'Edge Local' },
      }],
    }),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/services/cameraRecordingSourcesService', () => ({
  cameraRecordingSourcesService: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/services/locationsService', () => ({
  locationsService: {
    list: vi.fn().mockResolvedValue({
      data: [{ id: 1, uuid: 'loc-uuid', name: 'Portaria', description: null, is_active: true }],
    }),
  },
}))

vi.mock('@/services/edgeNodesService', () => ({
  edgeNodesService: {
    list: vi.fn().mockResolvedValue({
      data: [{
        id: 1,
        uuid: 'edge-uuid',
        name: 'Edge Local',
        description: null,
        status: 'online',
        last_seen_at: null,
        is_active: true,
        location: { id: 1, uuid: 'loc-uuid', name: 'Portaria', description: null, is_active: true },
      }],
    }),
  },
}))

vi.mock('@/services/camerasService', () => ({
  camerasService: {
    list: vi.fn().mockResolvedValue({
      data: [{
        id: 2,
        uuid: 'camera-uuid',
        name: 'Camera Apoio',
        type: 'support',
        vendor: 'intelbras',
        host: '10.0.8.151',
        port: 80,
        channel: 1,
        username: null,
        is_active: true,
      }],
    }),
  },
}))

describe('RecordingDevicesPage', () => {
  it('renders NVR devices and opens the Vuestic form', async () => {
    const wrapper = mount(RecordingDevicesPage, {
      attachTo: document.body,
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Gravadores/NVRs')
    expect(wrapper.text()).toContain('NVR Portaria 01')

    await wrapper.get('[data-test="create-recording-device"]').trigger('click')
    await flushPromises()

    expect(document.body.querySelector('[data-test="recording-device-form"]')).not.toBeNull()
    wrapper.unmount()
  })

  it('omits an empty password when an edited recording device is submitted', async () => {
    const wrapper = mount(RecordingDeviceForm, {
      props: {
        modelValue: {
          location_id: 1,
          edge_node_id: 1,
          name: 'NVR Portaria 01',
          vendor: 'intelbras',
          protocol: 'http',
          host: '10.0.8.150',
          port: 80,
          username: 'trackvision_ro',
          auth_type: 'digest',
          password: '',
          is_active: true,
        },
        isEditing: true,
        locations: [{ id: 1, uuid: 'loc-uuid', name: 'Portaria', description: null, is_active: true }],
        edgeNodes: [{
          id: 1,
          uuid: 'edge-uuid',
          name: 'Edge Local',
          description: null,
          status: 'online',
          last_seen_at: null,
          is_active: true,
          location: { id: 1, uuid: 'loc-uuid', name: 'Portaria', description: null, is_active: true },
        }],
        errors: {},
        submitting: false,
      },
      global: { plugins: [createVuesticTestPlugin()] },
    })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]?.[0]).not.toHaveProperty('password')
  })
})
