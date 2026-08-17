import { getAppConfig } from '@/app/config'
import type { LaravelPaginated, LaravelResource } from '@/types/api'
import type { Camera, CameraInput } from '@/types/admin'
import { listAllPages } from './listAllPages'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

export const camerasService = {
  list(page = 1): Promise<LaravelPaginated<Camera>> {
    return client.get<LaravelPaginated<Camera>>(`/admin/cameras?page=${page}`)
  },

  listAll(): Promise<Camera[]> {
    return listAllPages((page) => this.list(page))
  },

  async create(input: CameraInput): Promise<Camera> {
    const response = await client.post<LaravelResource<Camera>>('/admin/cameras', input)
    return response.data
  },

  async update(camera: Camera, input: CameraInput): Promise<Camera> {
    const response = await client.patch<LaravelResource<Camera>>(`/admin/cameras/${camera.id}`, input)
    return response.data
  },

  remove(camera: Camera): Promise<void> {
    return client.delete<void>(`/admin/cameras/${camera.id}`)
  },
}
