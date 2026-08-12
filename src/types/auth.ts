export interface User {
  id: number
  name: string
  email: string
  roles?: string[]
  permissions?: string[]
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
