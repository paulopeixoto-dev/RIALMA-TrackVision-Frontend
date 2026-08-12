import { getAppConfig } from '@/app/config'
import type { LaravelResource } from '@/types/api'
import type { LoginCredentials, LoginResponse, User } from '@/types/auth'
import { createApiClient, type ApiClientOptions } from './apiClient'

interface LoginPayload {
  token_type: 'Bearer'
  access_token: string
  expires_at: string
  user: User
}

function mapLogin(payload: LoginPayload): LoginResponse {
  return {
    tokenType: payload.token_type,
    accessToken: payload.access_token,
    expiresAt: payload.expires_at,
    user: payload.user,
  }
}

export function createAuthService(options: ApiClientOptions) {
  const client = createApiClient(options)

  return {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      const payload = await client.post<LoginPayload>('/auth/login', credentials)
      return mapLogin(payload)
    },

    logout(): Promise<void> {
      return client.post<void>('/auth/logout')
    },

    async me(): Promise<User> {
      const response = await client.get<LaravelResource<User>>('/me')
      return response.data
    },
  }
}

export const authService = createAuthService({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})
