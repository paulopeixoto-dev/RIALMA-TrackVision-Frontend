import { getAppConfig } from '@/app/config'
import { ApiError } from './apiClient'

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function normalizeApiEndpoint(endpoint: string): string {
  return endpoint.replace(/^\/api\/v1(?=\/)/, '')
}

export const mediaAssetsService = {
  async fetchObjectUrl(endpoint: string): Promise<string> {
    const headers = new Headers()
    headers.set('Accept', 'image/jpeg')

    const token = localStorage.getItem('trackvision.token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(joinUrl(getAppConfig().apiBaseUrl, normalizeApiEndpoint(endpoint)), { headers })

    if (!response.ok) {
      throw new ApiError(response.status, 'Nao foi possivel carregar a imagem privada.')
    }

    return URL.createObjectURL(await response.blob())
  },

  revokeObjectUrl(url: string): void {
    URL.revokeObjectURL(url)
  },
}
