import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mediaAssetsService } from './mediaAssetsService'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

describe('mediaAssetsService', () => {
  beforeEach(() => {
    localStorage.setItem('trackvision.token', 'token-123')
    fetchMock.mockReset()
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:trackvision-image'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('fetches private media as an authenticated blob object url', async () => {
    fetchMock.mockResolvedValueOnce(new Response(new Blob(['jpeg-bytes'], { type: 'image/jpeg' }), { status: 200 }))

    const url = await mediaAssetsService.fetchObjectUrl('/api/v1/admin/media-assets/5/content')

    expect(url).toBe('blob:trackvision-image')
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/admin/media-assets/5/content')
    expect((fetchMock.mock.calls[0][1].headers as Headers).get('Authorization')).toBe('Bearer token-123')
  })

  it('revokes object urls', () => {
    mediaAssetsService.revokeObjectUrl('blob:trackvision-image')

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:trackvision-image')
  })
})
