import { getAppConfig } from '@/app/config'
import { ApiError } from './apiClient'
import type { LaravelPaginated, LaravelResource } from '@/types/api'
import type { LoadStatus, SupportImageRecoveryAttempt, Trip, TripEvent, TripFilters } from '@/types/admin'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

function queryFrom(filters: TripFilters = {}, page = 1): string {
  const params = new URLSearchParams()

  if (filters.status) params.set('status', filters.status)
  if (filters.plate?.trim()) params.set('plate', filters.plate.trim())
  if (filters.load_status) params.set('load_status', filters.load_status)
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.vehicle_id) params.set('vehicle_id', String(filters.vehicle_id))
  if (filters.location_id) params.set('location_id', String(filters.location_id))
  if (filters.direction) params.set('direction', filters.direction)
  params.set('page', String(page))

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const tripsService = {
  list(filters: TripFilters = {}, page = 1): Promise<LaravelPaginated<Trip>> {
    return client.get<LaravelPaginated<Trip>>(`/admin/trips${queryFrom(filters, page)}`)
  },

  async show(trip: Trip): Promise<Trip> {
    const response = await client.get<LaravelResource<Trip>>(`/admin/trips/${trip.id}`)
    return response.data
  },

  async updateLoadStatus(tripEvent: TripEvent, loadStatus: LoadStatus): Promise<TripEvent> {
    const response = await client.patch<LaravelResource<TripEvent>>(
      `/admin/trip-events/${tripEvent.id}/load-status`,
      { load_status: loadStatus },
    )
    return response.data
  },

  async requestSupportImageRecovery(tripEvent: TripEvent): Promise<SupportImageRecoveryAttempt> {
    const response = await client.post<LaravelResource<SupportImageRecoveryAttempt | null>>(
      `/admin/captures/${tripEvent.capture.id}/support-image-recovery`,
      {},
    )

    if (!response.data) {
      throw new ApiError(502, 'Resposta invalida ao solicitar recuperacao.')
    }

    return response.data
  },
}
