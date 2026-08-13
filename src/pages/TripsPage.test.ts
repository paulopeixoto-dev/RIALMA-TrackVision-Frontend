import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mediaAssetsService } from '@/services/mediaAssetsService'
import { useAuthStore } from '@/stores/authStore'
import { tripsService } from '@/services/tripsService'
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

function waitForPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe('TripsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(tripsService.list).mockReset().mockResolvedValue({ data: [trip] } as never)
    vi.mocked(tripsService.show).mockReset().mockResolvedValue(detailedTrip as never)
    vi.mocked(tripsService.updateLoadStatus).mockReset().mockResolvedValue({ ...detailedTrip.events[0], load_status: 'loaded' } as never)
    vi.mocked(mediaAssetsService.fetchObjectUrl).mockReset().mockResolvedValue('blob:image-url')
    vi.mocked(mediaAssetsService.revokeObjectUrl).mockReset()
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

  it('keeps the most recently selected trip when an earlier detail request resolves late', async () => {
    const nextTrip = {
      ...trip,
      id: 2,
      uuid: 'trip-uuid-2',
      vehicle: { ...trip.vehicle, id: 2, uuid: 'vehicle-uuid-2', plate: 'XYZ-9Z99' },
    }
    const olderDetail = deferred<typeof detailedTrip>()
    const newerDetail = deferred<typeof detailedTrip>()

    vi.mocked(tripsService.list).mockResolvedValue({ data: [trip, nextTrip] } as never)
    vi.mocked(tripsService.show)
      .mockImplementationOnce(() => olderDetail.promise as never)
      .mockImplementationOnce(() => newerDetail.promise as never)

    const wrapper = mount(TripsPage)
    await waitForPromises()

    const selectionButtons = wrapper.findAll('[data-test="select-trip"]')
    await selectionButtons[0].trigger('click')
    await selectionButtons[1].trigger('click')

    newerDetail.resolve({
      ...detailedTrip,
      ...nextTrip,
      events: [],
    })
    await waitForPromises()

    expect(wrapper.text()).toContain('XYZ-9Z99')

    olderDetail.resolve(detailedTrip)
    await waitForPromises()

    expect(wrapper.text()).toContain('XYZ-9Z99')
    expect(wrapper.text()).not.toContain('Entrada 01')
  })

  it('revokes image URLs that resolve after the page unmounts', async () => {
    const lateImageUrl = deferred<string>()
    vi.mocked(mediaAssetsService.fetchObjectUrl).mockImplementationOnce(() => lateImageUrl.promise)

    const wrapper = mount(TripsPage)
    await waitForPromises()
    await wrapper.get('[data-test="select-trip"]').trigger('click')
    await waitForPromises()

    wrapper.unmount()
    lateImageUrl.resolve('blob:late-image-url')
    await waitForPromises()

    expect(mediaAssetsService.revokeObjectUrl).toHaveBeenCalledWith('blob:late-image-url')
  })
})
