import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import TripsPage from './TripsPage.vue'

const { trip, detailedTrip } = vi.hoisted(() => {
  const trip = {
    id: 1,
    uuid: 'trip-uuid',
    status: 'open',
    opened_at: '2026-08-13T10:00:00Z',
    closed_at: null,
    review_required_reason: null,
    current_load_status: 'unknown',
    events_count: 1,
    vehicle: { id: 1, uuid: 'vehicle-uuid', plate: 'ABC-1D23', plate_normalized: 'ABC1D23', fleet_code: 'TRUCK-01' },
    location: { id: 1, uuid: 'location-uuid', name: 'Portaria' },
  }

  const detailedTrip = {
    ...trip,
    events: [{
      id: 7,
      uuid: 'event-uuid',
      direction: 'outbound',
      load_status: 'unknown',
      occurred_at: '2026-08-13T10:00:00Z',
      capture: {
        id: 3,
        uuid: 'capture-uuid',
        plate: 'ABC-1D23',
        plate_normalized: 'ABC1D23',
        event_time: '2026-08-13T10:00:00Z',
        camera_pair: { id: 1, uuid: 'pair-uuid', name: 'Entrada 01' },
      },
      media: {
        lpr_image: { id: 11, uuid: 'lpr-media', kind: 'lpr_image', content_type: 'image/jpeg', byte_size: 10, content_endpoint: '/api/v1/admin/media-assets/11/content' },
        support_image: { id: 12, uuid: 'support-media', kind: 'support_image', content_type: 'image/jpeg', byte_size: 10, content_endpoint: '/api/v1/admin/media-assets/12/content' },
      },
    }],
  }

  return { trip, detailedTrip }
})

vi.mock('@/services/tripsService', () => ({
  tripsService: {
    list: vi.fn().mockResolvedValue({ data: [trip] }),
    show: vi.fn().mockResolvedValue(detailedTrip),
    updateLoadStatus: vi.fn().mockResolvedValue({ ...detailedTrip.events[0], load_status: 'loaded' }),
  },
}))

vi.mock('@/services/mediaAssetsService', () => ({
  mediaAssetsService: {
    fetchObjectUrl: vi.fn().mockResolvedValue('blob:image-url'),
    revokeObjectUrl: vi.fn(),
  },
}))

describe('TripsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders trips returned by the API', async () => {
    const wrapper = mount(TripsPage)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('ABC-1D23')
    expect(wrapper.text()).toContain('Portaria')
    expect(wrapper.text()).toContain('Aberta')
  })

  it('loads selected trip detail with LPR and support images', async () => {
    const wrapper = mount(TripsPage)
    await new Promise((resolve) => setTimeout(resolve, 0))

    await wrapper.get('[data-test="select-trip"]').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Entrada 01')
    expect(wrapper.findAll('img')).toHaveLength(2)
  })

  it('shows load actions only when user can manage trips', async () => {
    const authStore = useAuthStore()
    authStore.permissions = ['captures.view']
    const wrapper = mount(TripsPage)
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.get('[data-test="select-trip"]').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.findAll('button').map((button) => button.text())).not.toContain('Carregado')

    authStore.permissions = ['captures.view', 'trips.manage']
    const allowedWrapper = mount(TripsPage)
    await new Promise((resolve) => setTimeout(resolve, 0))
    await allowedWrapper.get('[data-test="select-trip"]').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(allowedWrapper.findAll('button').map((button) => button.text())).toContain('Carregado')
    expect(allowedWrapper.findAll('button').map((button) => button.text())).toContain('Vazio')
  })
})
