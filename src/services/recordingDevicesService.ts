import { getAppConfig } from '@/app/config'
import type { LaravelPaginated, LaravelResource } from '@/types/api'
import type { RecordingDevice, RecordingDeviceInput } from '@/types/admin'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

export const recordingDevicesService = {
  list(): Promise<LaravelPaginated<RecordingDevice>> {
    return client.get<LaravelPaginated<RecordingDevice>>('/admin/recording-devices')
  },

  async create(input: RecordingDeviceInput): Promise<RecordingDevice> {
    const response = await client.post<LaravelResource<RecordingDevice>>('/admin/recording-devices', input)
    return response.data
  },

  async update(device: RecordingDevice, input: RecordingDeviceInput): Promise<RecordingDevice> {
    const response = await client.patch<LaravelResource<RecordingDevice>>(`/admin/recording-devices/${device.id}`, input)
    return response.data
  },

  remove(device: RecordingDevice): Promise<void> {
    return client.delete<void>(`/admin/recording-devices/${device.id}`)
  },
}
