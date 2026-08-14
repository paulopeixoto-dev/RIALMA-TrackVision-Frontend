import { getAppConfig } from '@/app/config'
import type { LaravelPaginated, LaravelResource } from '@/types/api'
import type { CreateUserInput, UpdateUserInput, UserPasswordInput } from '@/types/admin'
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

  async create(input: CreateUserInput): Promise<User> {
    const response = await client.post<LaravelResource<User>>('/admin/users', input)
    return response.data
  },

  async update(user: User, input: UpdateUserInput): Promise<User> {
    const response = await client.patch<LaravelResource<User>>(`/admin/users/${user.id}`, input)
    return response.data
  },

  async resetPassword(user: User, input: UserPasswordInput): Promise<User> {
    const response = await client.patch<LaravelResource<User>>(`/admin/users/${user.id}/password`, input)
    return response.data
  },

  deactivate(user: User): Promise<void> {
    return client.delete<void>(`/admin/users/${user.id}`)
  },
}
