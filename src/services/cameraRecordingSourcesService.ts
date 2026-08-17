import { getAppConfig } from '@/app/config'
import type { LaravelPaginated, LaravelResource } from '@/types/api'
import type { CameraRecordingSource, CameraRecordingSourceInput } from '@/types/admin'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

export const cameraRecordingSourcesService = {
  list(page = 1): Promise<LaravelPaginated<CameraRecordingSource>> {
    return client.get<LaravelPaginated<CameraRecordingSource>>(`/admin/camera-recording-sources?page=${page}`)
  },

  async create(input: CameraRecordingSourceInput): Promise<CameraRecordingSource> {
    const response = await client.post<LaravelResource<CameraRecordingSource>>('/admin/camera-recording-sources', input)
    return response.data
  },

  async update(source: CameraRecordingSource, input: CameraRecordingSourceInput): Promise<CameraRecordingSource> {
    const response = await client.patch<LaravelResource<CameraRecordingSource>>(`/admin/camera-recording-sources/${source.id}`, input)
    return response.data
  },

  remove(source: CameraRecordingSource): Promise<void> {
    return client.delete<void>(`/admin/camera-recording-sources/${source.id}`)
  },
}
