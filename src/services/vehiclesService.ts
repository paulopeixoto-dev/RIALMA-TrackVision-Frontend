import { getAppConfig } from '@/app/config'
import type { LaravelPaginated, LaravelResource } from '@/types/api'
import type { Vehicle, VehicleInput } from '@/types/admin'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

export const vehiclesService = {
  list(): Promise<LaravelPaginated<Vehicle>> {
    return client.get<LaravelPaginated<Vehicle>>('/admin/vehicles')
  },

  async create(input: VehicleInput): Promise<Vehicle> {
    const response = await client.post<LaravelResource<Vehicle>>('/admin/vehicles', input)
    return response.data
  },

  async update(vehicle: Vehicle, input: VehicleInput): Promise<Vehicle> {
    const response = await client.patch<LaravelResource<Vehicle>>(`/admin/vehicles/${vehicle.id}`, input)
    return response.data
  },

  remove(vehicle: Vehicle): Promise<void> {
    return client.delete<void>(`/admin/vehicles/${vehicle.id}`)
  },
}
