import { getAppConfig } from '@/app/config'
import type { LaravelPaginated, LaravelResource } from '@/types/api'
import type { CameraPair, CameraPairInput } from '@/types/admin'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

export const cameraPairsService = {
  list(): Promise<LaravelPaginated<CameraPair>> {
    return client.get<LaravelPaginated<CameraPair>>('/admin/camera-pairs')
  },

  async create(input: CameraPairInput): Promise<CameraPair> {
    const response = await client.post<LaravelResource<CameraPair>>('/admin/camera-pairs', input)
    return response.data
  },

  async update(cameraPair: CameraPair, input: CameraPairInput): Promise<CameraPair> {
    const response = await client.patch<LaravelResource<CameraPair>>(`/admin/camera-pairs/${cameraPair.id}`, input)
    return response.data
  },

  remove(cameraPair: CameraPair): Promise<void> {
    return client.delete<void>(`/admin/camera-pairs/${cameraPair.id}`)
  },
}
