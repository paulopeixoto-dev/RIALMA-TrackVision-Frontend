import { getAppConfig } from '@/app/config'
import type { LaravelPaginated } from '@/types/api'
import type { User } from '@/types/auth'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

export const usersService = {
  list(): Promise<LaravelPaginated<User>> {
    return client.get<LaravelPaginated<User>>('/admin/users')
  },
}
