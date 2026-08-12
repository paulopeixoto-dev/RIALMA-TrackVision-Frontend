import { getAppConfig } from '@/app/config'
import { ApiError, createApiClient } from './apiClient'

const probes = [
  { path: '/admin/users', permission: 'users.manage' },
  { path: '/admin/roles', permission: 'permissions.manage' },
  { path: '/admin/vehicles', permission: 'vehicles.manage' },
  { path: '/admin/locations', permission: 'cameras.manage' },
] as const

export const permissionProbeService = {
  async probeEffectivePermissions(token: string): Promise<string[]> {
    const client = createApiClient({
      apiBaseUrl: getAppConfig().apiBaseUrl,
      getToken: () => token,
    })

    const allowed: string[] = []

    for (const probe of probes) {
      try {
        await client.head(probe.path)
        allowed.push(probe.permission)
      } catch (error) {
        if (error instanceof ApiError && error.isForbidden) {
          continue
        }

        throw error
      }
    }

    return [...new Set(allowed)]
  },
}
