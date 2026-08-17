import type { LaravelPaginated } from '@/types/api'

function lastPageFrom(meta: Record<string, unknown> | undefined): number {
  const lastPage = meta?.last_page
  return typeof lastPage === 'number' && Number.isInteger(lastPage) && lastPage > 0 ? lastPage : 1
}

export async function listAllPages<T>(loadPage: (page: number) => Promise<LaravelPaginated<T>>): Promise<T[]> {
  const firstPage = await loadPage(1)
  const lastPage = lastPageFrom(firstPage.meta)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(lastPage - 1, 0) }, (_, index) => loadPage(index + 2)),
  )

  return [firstPage, ...remainingPages].flatMap((page) => page.data)
}
