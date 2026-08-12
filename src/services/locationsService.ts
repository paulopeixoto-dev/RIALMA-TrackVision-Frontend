import { getAppConfig } from '@/app/config'
import type { LaravelPaginated, LaravelResource } from '@/types/api'
import type { Location, LocationInput } from '@/types/admin'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

export const locationsService = {
  list(): Promise<LaravelPaginated<Location>> {
    return client.get<LaravelPaginated<Location>>('/admin/locations')
  },

  async create(input: LocationInput): Promise<Location> {
    const response = await client.post<LaravelResource<Location>>('/admin/locations', input)
    return response.data
  },

  async update(location: Location, input: LocationInput): Promise<Location> {
    const response = await client.patch<LaravelResource<Location>>(`/admin/locations/${location.id}`, input)
    return response.data
  },

  remove(location: Location): Promise<void> {
    return client.delete<void>(`/admin/locations/${location.id}`)
  },
}
