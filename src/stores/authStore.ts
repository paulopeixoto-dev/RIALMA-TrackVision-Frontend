import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/services/authService'
import { permissionProbeService } from '@/services/permissionProbeService'
import type { LoginCredentials, User } from '@/types/auth'

const tokenKey = 'trackvision.token'
const userKey = 'trackvision.user'
const permissionsKey = 'trackvision.permissions'

function readJson<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key)

  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const permissions = ref<string[]>([])
  const isRestored = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  function can(permission?: string): boolean {
    return !permission || permissions.value.includes(permission)
  }

  function persistSession(nextToken: string, nextUser: User, nextPermissions: string[]): void {
    token.value = nextToken
    user.value = nextUser
    permissions.value = nextPermissions

    localStorage.setItem(tokenKey, nextToken)
    localStorage.setItem(userKey, JSON.stringify(nextUser))
    localStorage.setItem(permissionsKey, JSON.stringify(nextPermissions))
  }

  function clearSession(): void {
    token.value = null
    user.value = null
    permissions.value = []

    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userKey)
    localStorage.removeItem(permissionsKey)
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await authService.login(credentials)
    const probedPermissions = await permissionProbeService.probeEffectivePermissions(response.accessToken)
    const effectivePermissions = response.user.permissions?.length ? response.user.permissions : probedPermissions

    persistSession(response.accessToken, response.user, effectivePermissions)
    isRestored.value = true
  }

  async function logout(): Promise<void> {
    try {
      if (token.value) {
        await authService.logout()
      }
    } finally {
      clearSession()
      isRestored.value = true
    }
  }

  function restoreSession(): void {
    if (isRestored.value || token.value) {
      isRestored.value = true
      return
    }

    token.value = localStorage.getItem(tokenKey)
    user.value = readJson<User | null>(userKey, null)
    permissions.value = readJson<string[]>(permissionsKey, [])
    isRestored.value = true
  }

  async function refreshUser(): Promise<void> {
    if (!token.value) {
      return
    }

    user.value = await authService.me()
    localStorage.setItem(userKey, JSON.stringify(user.value))
  }

  return {
    token,
    user,
    permissions,
    isAuthenticated,
    isRestored,
    can,
    clearSession,
    login,
    logout,
    restoreSession,
    refreshUser,
  }
})
