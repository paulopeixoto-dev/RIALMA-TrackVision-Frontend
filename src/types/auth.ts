export interface User {
  id: number
  name: string
  email: string
  is_active: boolean
  roles?: string[]
  permissions?: string[]
  created_at?: string
  updated_at?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  tokenType: 'Bearer'
  accessToken: string
  expiresAt: string
  user: User
}
