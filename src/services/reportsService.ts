import { getAppConfig } from '@/app/config'
import type { TripFilters } from '@/types/admin'
import { ApiError } from './apiClient'

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function queryFrom(filters: TripFilters): string {
  const params = new URLSearchParams()

  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.status) params.set('status', filters.status)
  if (filters.plate?.trim()) params.set('plate', filters.plate.trim())
  if (filters.vehicle_id) params.set('vehicle_id', String(filters.vehicle_id))
  if (filters.location_id) params.set('location_id', String(filters.location_id))
  if (filters.load_status) params.set('load_status', filters.load_status)
  if (filters.direction) params.set('direction', filters.direction)

  const query = params.toString()
  return query ? `?${query}` : ''
}

function filenameFrom(response: Response, fallback: string): string {
  const contentDisposition = response.headers.get('Content-Disposition')
  if (!contentDisposition) return fallback

  const encodedFilename = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1]
  if (encodedFilename) {
    try {
      return decodeURIComponent(encodedFilename)
    } catch {
      return fallback
    }
  }

  const filename = contentDisposition.match(/filename\s*=\s*(?:"([^"]+)"|([^;\s]+))/i)
  return filename?.[1] ?? filename?.[2] ?? fallback
}

async function downloadReport(path: string, filters: TripFilters, accept: string, filename: string): Promise<void> {
  const headers = new Headers()
  headers.set('Accept', accept)

  const token = localStorage.getItem('trackvision.token')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(joinUrl(getAppConfig().apiBaseUrl, `${path}${queryFrom(filters)}`), { headers })

  if (!response.ok) {
    throw new ApiError(response.status, 'Nao foi possivel baixar o relatorio.')
  }

  const url = URL.createObjectURL(await response.blob())
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filenameFrom(response, filename)
  anchor.click()
  URL.revokeObjectURL(url)
}

export const reportsService = {
  downloadCsv(filters: TripFilters): Promise<void> {
    return downloadReport('/admin/reports/trips.csv', filters, 'text/csv', 'trackvision-trips.csv')
  },

  downloadPdf(filters: TripFilters): Promise<void> {
    return downloadReport('/admin/reports/trips.pdf', filters, 'application/pdf', 'trackvision-trips.pdf')
  },
}
