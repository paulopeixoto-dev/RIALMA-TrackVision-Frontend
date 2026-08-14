import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createVuesticTestPlugin } from '@/test/vuestic'
import EdgeNodesPage from './EdgeNodesPage.vue'

vi.mock('@/services/edgeNodesService', () => ({
  edgeNodesService: {
    list: vi.fn().mockResolvedValue({
      data: [{
        id: 1,
        uuid: 'edge-1',
        name: 'Edge Portaria 01',
        description: 'Servidor local',
        status: 'offline',
        last_seen_at: null,
        is_active: true,
        location: { id: 1, uuid: 'loc-1', name: 'Portaria', description: null, is_active: true },
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
      data: [{ id: 1, uuid: 'loc-1', name: 'Portaria', description: null, is_active: true }],
    }),
  },
}))

describe('EdgeNodesPage', () => {
  it('renders edge node status and location', async () => {
    const wrapper = mount(EdgeNodesPage, {
      global: {
        plugins: [createVuesticTestPlugin()],
      },
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Edge Portaria 01')
    expect(wrapper.text()).toContain('offline')
    expect(wrapper.text()).toContain('Portaria')
  })
})
