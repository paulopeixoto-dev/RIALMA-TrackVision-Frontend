import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CameraRecordingSourceForm from '@/components/forms/CameraRecordingSourceForm.vue'
import RecordingDeviceForm from '@/components/forms/RecordingDeviceForm.vue'
import { cameraRecordingSourcesService } from '@/services/cameraRecordingSourcesService'
import { camerasService } from '@/services/camerasService'
import { edgeNodesService } from '@/services/edgeNodesService'
import { locationsService } from '@/services/locationsService'
import { recordingDevicesService } from '@/services/recordingDevicesService'
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
    listAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/services/cameraRecordingSourcesService', () => ({
  cameraRecordingSourcesService: {
    list: vi.fn().mockResolvedValue({
      data: [{
        id: 1,
        uuid: 'source-uuid',
        camera: { id: 2, uuid: 'camera-uuid', name: 'Camera Apoio', type: 'support', vendor: 'intelbras', host: '10.0.8.151', port: 80, channel: 1, username: null, is_active: true },
        recording_device: { id: 1, uuid: 'nvr-uuid', name: 'NVR Portaria 01', vendor: 'intelbras', protocol: 'http', host: '10.0.8.150', port: 80, username: null, auth_type: 'digest', has_password: true, is_active: true },
        channel: 1,
        stream: 'main',
        target_offset_seconds: 2,
        search_window_seconds: 5,
        is_active: true,
      }],
    }),
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
    listAll: vi.fn().mockResolvedValue([{ id: 1, uuid: 'loc-uuid', name: 'Portaria', description: null, is_active: true }]),
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
    listAll: vi.fn().mockResolvedValue([]),
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
    listAll: vi.fn().mockResolvedValue([]),
  },
}))

describe('RecordingDevicesPage', () => {
  beforeEach(() => {
    vi.mocked(recordingDevicesService.list).mockReset()
    vi.mocked(recordingDevicesService.list).mockResolvedValue({
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
    })
    vi.mocked(recordingDevicesService.listAll).mockReset().mockResolvedValue([{
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
    }])
    vi.mocked(cameraRecordingSourcesService.list).mockReset()
    vi.mocked(cameraRecordingSourcesService.list).mockResolvedValue({
      data: [{
        id: 1,
        uuid: 'source-uuid',
        camera: { id: 2, uuid: 'camera-uuid', name: 'Camera Apoio', type: 'support', vendor: 'intelbras', host: '10.0.8.151', port: 80, channel: 1, username: null, is_active: true },
        recording_device: { id: 1, uuid: 'nvr-uuid', name: 'NVR Portaria 01', vendor: 'intelbras', protocol: 'http', host: '10.0.8.150', port: 80, username: null, auth_type: 'digest', has_password: true, is_active: true },
        channel: 1,
        stream: 'main',
        target_offset_seconds: 2,
        search_window_seconds: 5,
        is_active: true,
      }],
    })
    vi.mocked(cameraRecordingSourcesService.remove).mockReset()
    vi.mocked(cameraRecordingSourcesService.update).mockReset().mockResolvedValue({} as never)
    vi.mocked(locationsService.listAll).mockReset().mockResolvedValue([
      { id: 1, uuid: 'loc-uuid', name: 'Portaria', description: null, is_active: true },
    ])
    vi.mocked(edgeNodesService.listAll).mockReset().mockResolvedValue([])
    vi.mocked(camerasService.listAll).mockReset().mockResolvedValue([])
  })

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

  it('loads the next page of recording devices', async () => {
    vi.mocked(recordingDevicesService.list)
      .mockResolvedValueOnce({
        data: [{
          id: 1,
          uuid: 'nvr-page-one',
          name: 'NVR Pagina 1',
          vendor: 'intelbras',
          protocol: 'http',
          host: '10.0.8.150',
          port: 80,
          username: null,
          auth_type: 'digest',
          has_password: true,
          is_active: true,
        }],
        meta: { current_page: 1, last_page: 2 },
      })
      .mockResolvedValueOnce({
        data: [{
          id: 2,
          uuid: 'nvr-page-two',
          name: 'NVR Pagina 2',
          vendor: 'intelbras',
          protocol: 'http',
          host: '10.0.8.151',
          port: 80,
          username: null,
          auth_type: 'digest',
          has_password: true,
          is_active: true,
        }],
        meta: { current_page: 2, last_page: 2 },
      })

    const wrapper = mount(RecordingDevicesPage, {
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await flushPromises()

    await wrapper.get('[data-test="devices-next-page"]').trigger('click')
    await flushPromises()

    expect(recordingDevicesService.list).toHaveBeenLastCalledWith(2)
    expect(wrapper.text()).toContain('NVR Pagina 2')
  })

  it('confirms mapping removal in a Vuestic modal before calling the API', async () => {
    vi.mocked(cameraRecordingSourcesService.remove).mockResolvedValue()
    const wrapper = mount(RecordingDevicesPage, {
      attachTo: document.body,
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await flushPromises()

    await wrapper.get('[data-test="remove-recording-source"]').trigger('click')
    await flushPromises()

    expect(cameraRecordingSourcesService.remove).not.toHaveBeenCalled()
    expect(document.body.querySelector('[data-test="confirm-remove-recording-source"]')).not.toBeNull()

    await document.body.querySelector<HTMLButtonElement>('[data-test="confirm-remove-recording-source"]')?.click()
    await flushPromises()

    expect(cameraRecordingSourcesService.remove).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
    wrapper.unmount()
  })

  it('loads the next page of recording source mappings', async () => {
    vi.mocked(cameraRecordingSourcesService.list)
      .mockResolvedValueOnce({
        data: [{
          id: 1,
          uuid: 'source-page-one',
          camera: { id: 2, uuid: 'camera-uuid', name: 'Camera Pagina 1', type: 'support', vendor: 'intelbras', host: '10.0.8.151', port: 80, channel: 1, username: null, is_active: true },
          recording_device: { id: 1, uuid: 'nvr-uuid', name: 'NVR Portaria 01', vendor: 'intelbras', protocol: 'http', host: '10.0.8.150', port: 80, username: null, auth_type: 'digest', has_password: true, is_active: true },
          channel: 1,
          stream: 'main',
          target_offset_seconds: 2,
          search_window_seconds: 5,
          is_active: true,
        }],
        meta: { current_page: 1, last_page: 2 },
      })
      .mockResolvedValueOnce({
        data: [{
          id: 2,
          uuid: 'source-page-two',
          camera: { id: 3, uuid: 'camera-two-uuid', name: 'Camera Pagina 2', type: 'support', vendor: 'intelbras', host: '10.0.8.152', port: 80, channel: 2, username: null, is_active: true },
          recording_device: { id: 1, uuid: 'nvr-uuid', name: 'NVR Portaria 01', vendor: 'intelbras', protocol: 'http', host: '10.0.8.150', port: 80, username: null, auth_type: 'digest', has_password: true, is_active: true },
          channel: 2,
          stream: 'sub',
          target_offset_seconds: 2,
          search_window_seconds: 5,
          is_active: true,
        }],
        meta: { current_page: 2, last_page: 2 },
      })

    const wrapper = mount(RecordingDevicesPage, {
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await flushPromises()

    await wrapper.get('[data-test="sources-next-page"]').trigger('click')
    await flushPromises()

    expect(cameraRecordingSourcesService.list).toHaveBeenLastCalledWith(2)
    expect(wrapper.text()).toContain('Camera Pagina 2')
  })

  it('clamps to the last device page after deactivating the final item on a later page', async () => {
    vi.mocked(recordingDevicesService.list)
      .mockResolvedValueOnce({
        data: [{
          id: 1,
          uuid: 'nvr-page-one',
          name: 'NVR Pagina 1',
          vendor: 'intelbras',
          protocol: 'http',
          host: '10.0.8.150',
          port: 80,
          username: null,
          auth_type: 'digest',
          has_password: true,
          is_active: true,
        }],
        meta: { current_page: 1, last_page: 2 },
      })
      .mockResolvedValueOnce({
        data: [{
          id: 2,
          uuid: 'nvr-page-two',
          name: 'NVR Pagina 2',
          vendor: 'intelbras',
          protocol: 'http',
          host: '10.0.8.151',
          port: 80,
          username: null,
          auth_type: 'digest',
          has_password: true,
          is_active: true,
        }],
        meta: { current_page: 2, last_page: 2 },
      })

    const wrapper = mount(RecordingDevicesPage, {
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await flushPromises()
    await wrapper.get('[data-test="devices-next-page"]').trigger('click')
    await flushPromises()

    vi.mocked(recordingDevicesService.list)
      .mockResolvedValueOnce({ data: [], meta: { current_page: 2, last_page: 1 } })
      .mockResolvedValueOnce({
        data: [{
          id: 1,
          uuid: 'nvr-page-one',
          name: 'NVR Pagina 1',
          vendor: 'intelbras',
          protocol: 'http',
          host: '10.0.8.150',
          port: 80,
          username: null,
          auth_type: 'digest',
          has_password: true,
          is_active: true,
        }],
        meta: { current_page: 1, last_page: 1 },
      })

    await wrapper.findAll('button').find((button) => button.text().includes('Desativar'))?.trigger('click')
    await flushPromises()

    expect(recordingDevicesService.list).toHaveBeenLastCalledWith(1)
    expect(wrapper.text()).toContain('NVR Pagina 1')
  })

  it('loads all paginated NVRs for recording source selection', async () => {
    vi.mocked(recordingDevicesService.listAll).mockResolvedValueOnce([{
      id: 2,
      uuid: 'nvr-page-two',
      name: 'NVR Pagina 2',
      vendor: 'intelbras',
      protocol: 'http',
      host: '10.0.8.151',
      port: 80,
      username: null,
      auth_type: 'digest',
      has_password: true,
      is_active: true,
    }])

    const wrapper = mount(RecordingDevicesPage, {
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await flushPromises()

    await wrapper.get('[data-test="create-recording-source"]').trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(CameraRecordingSourceForm).props('recordingDevices')).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 2, name: 'NVR Pagina 2' }),
    ]))
  })

  it('omits camera_id from the mapping PATCH payload and keeps the camera immutable', async () => {
    const wrapper = mount(RecordingDevicesPage, {
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await flushPromises()

    await wrapper.get('[data-test="edit-recording-source"]').trigger('click')
    await flushPromises()
    const form = wrapper.findComponent(CameraRecordingSourceForm)
    expect(form.props('cameraImmutable')).toBe(true)

    form.vm.$emit('submit')
    await flushPromises()

    expect(cameraRecordingSourcesService.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      expect.not.objectContaining({ camera_id: expect.anything() }),
    )
  })

  it('uses complete selector collections and filters NVRs beyond the current page', async () => {
    vi.mocked(locationsService.listAll).mockResolvedValueOnce([
      { id: 1, uuid: 'loc-uuid', name: 'Portaria', description: null, is_active: true },
      { id: 2, uuid: 'loc-2', name: 'Unidade 2', description: null, is_active: true },
    ])
    vi.mocked(recordingDevicesService.listAll).mockResolvedValueOnce([{
      id: 2,
      uuid: 'nvr-other-location',
      name: 'NVR Outra Unidade',
      vendor: 'intelbras',
      protocol: 'http',
      host: '10.0.9.150',
      port: 80,
      username: null,
      auth_type: 'digest',
      has_password: true,
      is_active: true,
      location: { id: 2, uuid: 'loc-2', name: 'Unidade 2' },
    }])

    const wrapper = mount(RecordingDevicesPage, {
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await flushPromises()

    wrapper.findAllComponents({ name: 'VaSelect' })[0].vm.$emit('update:modelValue', 2)
    await flushPromises()

    expect(wrapper.text()).toContain('NVR Outra Unidade')
  })

  it('passes every loaded location, edge node, and camera to selector forms', async () => {
    vi.mocked(locationsService.listAll).mockResolvedValueOnce([
      { id: 1, uuid: 'loc-uuid', name: 'Portaria', description: null, is_active: true },
      { id: 2, uuid: 'loc-2', name: 'Unidade 2', description: null, is_active: true },
    ])
    vi.mocked(edgeNodesService.listAll).mockResolvedValueOnce([{
      id: 2,
      uuid: 'edge-2',
      name: 'Edge Pagina 2',
      description: null,
      status: 'online',
      last_seen_at: null,
      is_active: true,
    }])
    vi.mocked(camerasService.listAll).mockResolvedValueOnce([{
      id: 3,
      uuid: 'camera-3',
      name: 'Apoio Pagina 2',
      type: 'support',
      vendor: 'intelbras',
      host: '10.0.9.151',
      port: 80,
      channel: 2,
      username: null,
      is_active: true,
    }])

    const wrapper = mount(RecordingDevicesPage, {
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await flushPromises()

    await wrapper.get('[data-test="create-recording-device"]').trigger('click')
    await wrapper.get('[data-test="create-recording-source"]').trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(RecordingDeviceForm).props('locations')).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 2, name: 'Unidade 2' }),
    ]))
    expect(wrapper.findComponent(RecordingDeviceForm).props('edgeNodes')).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 2, name: 'Edge Pagina 2' }),
    ]))
    expect(wrapper.findComponent(CameraRecordingSourceForm).props('cameras')).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 3, name: 'Apoio Pagina 2' }),
    ]))
  })
})
