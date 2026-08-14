import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mediaAssetsService } from '@/services/mediaAssetsService'
import { reportsService } from '@/services/reportsService'
import { useAuthStore } from '@/stores/authStore'
import { tripsService } from '@/services/tripsService'
import { createVuesticTestPlugin } from '@/test/vuestic'
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
      load_status_audits: [{
        id: 99,
        uuid: 'audit-uuid',
        old_load_status: 'unknown',
        new_load_status: 'loaded',
        changed_at: '2026-08-13T15:00:00Z',
        user: { id: 5, uuid: 'user-uuid', name: 'Paulo Peixoto', email: 'paulo@example.com' },
      }],
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

vi.mock('@/services/reportsService', () => ({
  reportsService: {
    downloadCsv: vi.fn().mockResolvedValue(undefined),
    downloadPdf: vi.fn().mockResolvedValue(undefined),
  },
}))

function waitForPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function mountTripsPage() {
  return mount(TripsPage, {
    global: { plugins: [createVuesticTestPlugin()] },
  })
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
    vi.mocked(reportsService.downloadCsv).mockReset().mockResolvedValue(undefined)
    vi.mocked(reportsService.downloadPdf).mockReset().mockResolvedValue(undefined)
  })

  it('renders trips returned by the API', async () => {
    const wrapper = mountTripsPage()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('ABC-1D23')
    expect(wrapper.text()).toContain('Portaria')
    expect(wrapper.text()).toContain('Aberta')
  })

  it('loads selected trip detail with LPR and support images', async () => {
    const wrapper = mountTripsPage()
    await new Promise((resolve) => setTimeout(resolve, 0))

    await wrapper.get('[data-test="select-trip"]').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Entrada 01')
    expect(wrapper.findAll('img')).toHaveLength(2)
  })

  it('clears the previous detail when a newly selected trip fails to load', async () => {
    const nextTrip = {
      ...trip,
      id: 2,
      uuid: 'trip-uuid-2',
      vehicle: { ...trip.vehicle, id: 2, uuid: 'vehicle-uuid-2', plate: 'XYZ-9Z99' },
    }
    vi.mocked(tripsService.list).mockResolvedValue({ data: [trip, nextTrip] } as never)

    const wrapper = mountTripsPage()
    await waitForPromises()

    const selectionButtons = wrapper.findAll('[data-test="select-trip"]')
    await selectionButtons[0].trigger('click')
    await waitForPromises()
    expect(wrapper.text()).toContain('Entrada 01')

    vi.mocked(tripsService.show).mockRejectedValueOnce(new Error('not found'))
    await selectionButtons[1].trigger('click')
    await waitForPromises()

    expect(wrapper.text()).toContain('Nao foi possivel carregar detalhes da viagem.')
    expect(wrapper.text()).not.toContain('Entrada 01')
  })

  it('loads support media when the LPR media request fails', async () => {
    vi.mocked(mediaAssetsService.fetchObjectUrl)
      .mockRejectedValueOnce(new Error('missing LPR'))
      .mockResolvedValueOnce('blob:support-image-url')

    const wrapper = mountTripsPage()
    await waitForPromises()
    await wrapper.get('[data-test="select-trip"]').trigger('click')
    await waitForPromises()

    expect(wrapper.findAll('img')).toHaveLength(1)
    expect(wrapper.find('img').attributes('src')).toBe('blob:support-image-url')
    expect(wrapper.text()).toContain('Sem imagem LPR')
  })

  it('moves between available trip pages', async () => {
    const nextTrip = {
      ...trip,
      id: 2,
      uuid: 'trip-uuid-2',
      vehicle: { ...trip.vehicle, id: 2, uuid: 'vehicle-uuid-2', plate: 'XYZ-9Z99' },
    }
    vi.mocked(tripsService.list)
      .mockResolvedValueOnce({ data: [trip], meta: { current_page: 1, last_page: 2 } } as never)
      .mockResolvedValueOnce({ data: [nextTrip], meta: { current_page: 2, last_page: 2 } } as never)
      .mockResolvedValueOnce({ data: [trip], meta: { current_page: 1, last_page: 2 } } as never)

    const wrapper = mountTripsPage()
    await waitForPromises()

    await wrapper.get('[data-test="next-page"]').trigger('click')
    await waitForPromises()
    expect(wrapper.text()).toContain('XYZ-9Z99')
    expect(tripsService.list).toHaveBeenLastCalledWith(expect.objectContaining({
      status: '',
      plate: '',
      load_status: '',
      direction: '',
      date_from: expect.any(String),
      date_to: expect.any(String),
    }), 2)

    await wrapper.get('[data-test="previous-page"]').trigger('click')
    await waitForPromises()
    expect(wrapper.text()).toContain('ABC-1D23')
    expect(tripsService.list).toHaveBeenLastCalledWith(expect.objectContaining({
      status: '',
      plate: '',
      load_status: '',
      direction: '',
      date_from: expect.any(String),
      date_to: expect.any(String),
    }), 1)
  })

  it('groups all filter controls in the responsive filter grid', async () => {
    const wrapper = mountTripsPage()
    await waitForPromises()

    const filters = wrapper.get('[data-test="trip-filters"]')
    expect(filters.findAllComponents({ name: 'BaseSelect' })).toHaveLength(3)
    expect(filters.findAllComponents({ name: 'BaseInput' })).toHaveLength(3)
    expect(filters.findAllComponents({ name: 'BaseButton' }).filter((button: { text: () => string }) => button.text() === 'Filtrar')).toHaveLength(1)
  })

  it('shows report buttons only when user can view reports', async () => {
    const authStore = useAuthStore()
    authStore.permissions = ['captures.view']
    const wrapper = mountTripsPage()
    await waitForPromises()

    expect(wrapper.findAll('button').map((button) => button.text())).not.toContain('CSV')
    expect(wrapper.findAll('button').map((button) => button.text())).not.toContain('PDF')

    authStore.permissions = ['captures.view', 'reports.view']
    const allowedWrapper = mountTripsPage()
    await waitForPromises()

    expect(allowedWrapper.findAll('button').map((button) => button.text())).toContain('CSV')
    expect(allowedWrapper.findAll('button').map((button) => button.text())).toContain('PDF')
  })

  it('downloads CSV and PDF with local and edited date and direction filters', async () => {
    const authStore = useAuthStore()
    authStore.permissions = ['captures.view', 'reports.view']
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-13T23:30:00-03:00'))

    try {
      const wrapper = mountTripsPage()
      await vi.runAllTimersAsync()

      await wrapper.get('[data-test="export-csv"]').trigger('click')
      expect(reportsService.downloadCsv).toHaveBeenCalledWith(expect.objectContaining({
        date_from: '2026-08-06',
        date_to: '2026-08-13',
        status: '',
        plate: '',
        load_status: '',
        direction: '',
      }))

      const dateInputs = wrapper.findAll('input[type="date"]')
      await dateInputs[0].setValue('2026-08-01')
      await dateInputs[1].setValue('2026-08-12')
      wrapper.findAllComponents({ name: 'BaseSelect' })[2].vm.$emit('update:modelValue', 'inbound')
      await wrapper.get('[data-test="export-pdf"]').trigger('click')

      expect(reportsService.downloadPdf).toHaveBeenCalledWith(expect.objectContaining({
        date_from: '2026-08-01',
        date_to: '2026-08-12',
        direction: 'inbound',
      }))
    } finally {
      vi.useRealTimers()
    }
  })

  it('renders load status audit timeline in selected trip detail', async () => {
    const wrapper = mountTripsPage()
    await waitForPromises()
    await wrapper.get('[data-test="select-trip"]').trigger('click')
    await waitForPromises()

    expect(wrapper.text()).toContain('Historico de carga')
    expect(wrapper.text()).toContain('Paulo Peixoto')
    expect(wrapper.text()).toContain('Nao revisada')
    expect(wrapper.text()).toContain('Carregado')
  })

  it('shows export error without clearing selected trip', async () => {
    const authStore = useAuthStore()
    authStore.permissions = ['captures.view', 'reports.view']
    vi.mocked(reportsService.downloadCsv).mockRejectedValueOnce(new Error('download failed'))
    const wrapper = mountTripsPage()
    await waitForPromises()
    await wrapper.get('[data-test="select-trip"]').trigger('click')
    await waitForPromises()

    await wrapper.get('[data-test="export-csv"]').trigger('click')
    await waitForPromises()

    expect(wrapper.text()).toContain('Nao foi possivel baixar o relatorio.')
    expect(wrapper.text()).toContain('Entrada 01')
  })

  it('shows load actions only when user can manage trips', async () => {
    const authStore = useAuthStore()
    authStore.permissions = ['captures.view']
    const wrapper = mountTripsPage()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.get('[data-test="select-trip"]').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.findAll('button').map((button) => button.text())).not.toContain('Carregado')

    authStore.permissions = ['captures.view', 'trips.manage']
    const allowedWrapper = mountTripsPage()
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

    const wrapper = mountTripsPage()
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

    const wrapper = mountTripsPage()
    await waitForPromises()
    await wrapper.get('[data-test="select-trip"]').trigger('click')
    await waitForPromises()

    wrapper.unmount()
    lateImageUrl.resolve('blob:late-image-url')
    await waitForPromises()

    expect(mediaAssetsService.revokeObjectUrl).toHaveBeenCalledWith('blob:late-image-url')
  })
})
