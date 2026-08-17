import { beforeEach, describe, expect, it, vi } from 'vitest'
import { tripsService } from './tripsService'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

describe('tripsService', () => {
  beforeEach(() => {
    localStorage.setItem('trackvision.token', 'token-123')
    fetchMock.mockReset()
  })

  it('lists trips with filters and page', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))

    await tripsService.list({
      status: 'open',
      plate: 'ABC-1D23',
      load_status: 'unknown',
      date_from: '2026-08-01',
      date_to: '2026-08-31',
      vehicle_id: 42,
      location_id: 7,
      direction: 'outbound',
    }, 2)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/admin/trips?')
    expect(url).toContain('status=open')
    expect(url).toContain('plate=ABC-1D23')
    expect(url).toContain('load_status=unknown')
    expect(url).toContain('date_from=2026-08-01')
    expect(url).toContain('date_to=2026-08-31')
    expect(url).toContain('vehicle_id=42')
    expect(url).toContain('location_id=7')
    expect(url).toContain('direction=outbound')
    expect(url).toContain('page=2')
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer token-123')
  })

  it('updates trip event load status', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      data: { id: 10, uuid: 'event-uuid', direction: 'outbound', load_status: 'loaded', occurred_at: '2026-08-13T10:00:00Z', capture: {}, media: {} },
    }), { status: 200 }))

    const event = await tripsService.updateLoadStatus({ id: 10 } as never, 'loaded')

    expect(event.load_status).toBe('loaded')
    expect(fetchMock.mock.calls[0][0]).toContain('/admin/trip-events/10/load-status')
    expect(fetchMock.mock.calls[0][1].method).toBe('PATCH')
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ load_status: 'loaded' }))
  })

  it('requests support image recovery for the capture event', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      data: {
        id: 12,
        uuid: 'recovery-uuid',
        status: 'pending',
        attempts: 1,
        last_error: null,
        next_attempt_at: null,
        updated_at: '2026-08-17T10:30:15Z',
      },
    }), { status: 202 }))

    const attempt = await tripsService.requestSupportImageRecovery({ capture: { id: 99 } } as never)

    expect(attempt).toMatchObject({ id: 12, status: 'pending', attempts: 1 })
    expect(fetchMock.mock.calls[0][0]).toContain('/admin/captures/99/support-image-recovery')
    expect(fetchMock.mock.calls[0][1].method).toBe('POST')
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({}))
  })
})
