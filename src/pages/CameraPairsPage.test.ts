import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createVuesticTestPlugin } from '@/test/vuestic'
import CameraPairsPage from './CameraPairsPage.vue'

vi.mock('@/services/cameraPairsService', () => ({
  cameraPairsService: {
    list: vi.fn().mockResolvedValue({
      data: [{
        id: 1,
        uuid: 'pair-1',
        name: 'Entrada Principal',
        direction: 'outbound',
        is_active: true,
        lpr_camera: {
          id: 1,
          uuid: 'cam-1',
          name: 'LPR Entrada',
          type: 'lpr',
          vendor: 'intelbras',
          host: '192.168.1.10',
          port: 80,
          channel: 1,
          username: 'admin',
          is_active: true,
        },
        support_camera: {
          id: 2,
          uuid: 'cam-2',
          name: 'Apoio Entrada',
          type: 'support',
          vendor: 'intelbras',
          host: '192.168.1.11',
          port: 80,
          channel: 1,
          username: 'admin',
          is_active: true,
        },
      }],
    }),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/services/locationsService', () => ({ locationsService: { list: vi.fn().mockResolvedValue({ data: [] }) } }))
vi.mock('@/services/edgeNodesService', () => ({ edgeNodesService: { list: vi.fn().mockResolvedValue({ data: [] }) } }))
vi.mock('@/services/camerasService', () => ({ camerasService: { list: vi.fn().mockResolvedValue({ data: [] }) } }))

describe('CameraPairsPage', () => {
  it('renders paired LPR and support cameras', async () => {
    const wrapper = mount(CameraPairsPage, {
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Entrada Principal')
    expect(wrapper.text()).toContain('LPR Entrada')
    expect(wrapper.text()).toContain('Apoio Entrada')
  })
})
