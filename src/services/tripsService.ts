import { getAppConfig } from '@/app/config'
import type { LaravelPaginated, LaravelResource } from '@/types/api'
import type { LoadStatus, Trip, TripEvent, TripFilters } from '@/types/admin'
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
}
