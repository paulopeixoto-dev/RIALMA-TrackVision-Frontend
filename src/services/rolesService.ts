import { getAppConfig } from '@/app/config'
import type { LaravelPaginated } from '@/types/api'
import type { Role } from '@/types/admin'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

export const rolesService = {
  list(): Promise<LaravelPaginated<Role>> {
    return client.get<LaravelPaginated<Role>>('/admin/roles')
  },
}
