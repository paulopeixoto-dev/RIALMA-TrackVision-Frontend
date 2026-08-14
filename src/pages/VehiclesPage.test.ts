import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createVuesticTestPlugin } from '@/test/vuestic'
import VehiclesPage from './VehiclesPage.vue'

vi.mock('@/services/vehiclesService', () => ({
  vehiclesService: {
    list: vi.fn().mockResolvedValue({
      data: [{
        id: 1,
        uuid: 'uuid-1',
        plate: 'ABC-1D23',
        plate_normalized: 'ABC1D23',
        fleet_code: 'TRUCK-01',
        description: 'Caminhao',
        is_active: true,
      }],
    }),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('VehiclesPage', () => {
  it('renders paginated vehicle data', async () => {
    const wrapper = mount(VehiclesPage, {
      global: { plugins: [createVuesticTestPlugin()] },
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('ABC-1D23')
    expect(wrapper.text()).toContain('ABC1D23')
    expect(wrapper.text()).toContain('TRUCK-01')
  })
})
