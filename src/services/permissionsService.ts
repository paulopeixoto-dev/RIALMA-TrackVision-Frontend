import { getAppConfig } from '@/app/config'
import type { LaravelPaginated } from '@/types/api'
import type { Permission } from '@/types/admin'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

export const permissionsService = {
  list(): Promise<LaravelPaginated<Permission>> {
    return client.get<LaravelPaginated<Permission>>('/admin/permissions')
  },
}
