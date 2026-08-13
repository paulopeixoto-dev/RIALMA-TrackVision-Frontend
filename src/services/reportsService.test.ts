import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reportsService } from './reportsService'

const fetchMock = vi.fn()
const clickMock = vi.fn()
const anchor = {
  href: '',
  download: '',
  click: clickMock,
} as unknown as HTMLAnchorElement
vi.stubGlobal('fetch', fetchMock)

describe('reportsService', () => {
  beforeEach(() => {
    localStorage.setItem('trackvision.token', 'token-123')
    fetchMock.mockReset()
    clickMock.mockReset()
    anchor.href = ''
    anchor.download = ''
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:report-url'),
      revokeObjectURL: vi.fn(),
    })
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)
  })

  it('downloads CSV with current filters and Authorization header', async () => {
    fetchMock.mockResolvedValueOnce(new Response(new Blob(['csv'], { type: 'text/csv' }), {
      status: 200,
      headers: { 'Content-Disposition': 'attachment; filename="trips-2026-08.csv"' },
    }))

    await reportsService.downloadCsv({
      date_from: '2026-08-01',
      date_to: '2026-08-31',
      status: 'closed',
      plate: 'ABC-1D23',
      load_status: 'loaded',
      direction: 'outbound',
      vehicle_id: 42,
      location_id: 7,
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/admin/reports/trips.csv?')
    expect(url).toContain('date_from=2026-08-01')
    expect(url).toContain('date_to=2026-08-31')
    expect(url).toContain('status=closed')
    expect(url).toContain('plate=ABC-1D23')
    expect(url).toContain('load_status=loaded')
    expect(url).toContain('direction=outbound')
    expect(url).toContain('vehicle_id=42')
    expect(url).toContain('location_id=7')
    expect(url).not.toContain('token-123')
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer token-123')
    expect(clickMock).toHaveBeenCalledOnce()
    expect(anchor.download).toBe('trips-2026-08.csv')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:report-url')
  })

  it('downloads PDF as an authenticated blob', async () => {
    fetchMock.mockResolvedValueOnce(new Response(new Blob(['pdf'], { type: 'application/pdf' }), { status: 200 }))

    await reportsService.downloadPdf({ date_from: '2026-08-01', date_to: '2026-08-31' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/admin/reports/trips.pdf?')
    expect((init.headers as Headers).get('Accept')).toBe('application/pdf')
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer token-123')
  })

  it('falls back to the default filename when the response omits Content-Disposition', async () => {
    fetchMock.mockResolvedValueOnce(new Response(new Blob(['pdf'], { type: 'application/pdf' }), { status: 200 }))

    await reportsService.downloadPdf({})

    expect(anchor.download).toBe('trackvision-trips.pdf')
  })
})
