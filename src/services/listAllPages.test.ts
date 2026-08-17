import { describe, expect, it, vi } from 'vitest'
import { listAllPages } from './listAllPages'

describe('listAllPages', () => {
  it('loads every page reported by the first response', async () => {
    const loadPage = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: 1 }], meta: { current_page: 1, last_page: 3 } })
      .mockResolvedValueOnce({ data: [{ id: 2 }], meta: { current_page: 2, last_page: 3 } })
      .mockResolvedValueOnce({ data: [{ id: 3 }], meta: { current_page: 3, last_page: 3 } })

    await expect(listAllPages(loadPage)).resolves.toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(loadPage).toHaveBeenCalledTimes(3)
    expect(loadPage).toHaveBeenNthCalledWith(1, 1)
    expect(loadPage).toHaveBeenNthCalledWith(2, 2)
    expect(loadPage).toHaveBeenNthCalledWith(3, 3)
  })
})
