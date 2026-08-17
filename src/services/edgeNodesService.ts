import { getAppConfig } from '@/app/config'
import type { LaravelPaginated, LaravelResource } from '@/types/api'
import type { EdgeNode, EdgeNodeInput } from '@/types/admin'
import { listAllPages } from './listAllPages'
import { createApiClient } from './apiClient'

const client = createApiClient({
  apiBaseUrl: getAppConfig().apiBaseUrl,
  getToken: () => localStorage.getItem('trackvision.token'),
})

export const edgeNodesService = {
  list(page = 1): Promise<LaravelPaginated<EdgeNode>> {
    return client.get<LaravelPaginated<EdgeNode>>(`/admin/edge-nodes?page=${page}`)
  },

  listAll(): Promise<EdgeNode[]> {
    return listAllPages((page) => this.list(page))
  },

  async create(input: EdgeNodeInput): Promise<EdgeNode> {
    const response = await client.post<LaravelResource<EdgeNode>>('/admin/edge-nodes', input)
    return response.data
  },

  async update(edgeNode: EdgeNode, input: EdgeNodeInput): Promise<EdgeNode> {
    const response = await client.patch<LaravelResource<EdgeNode>>(`/admin/edge-nodes/${edgeNode.id}`, input)
    return response.data
  },

  remove(edgeNode: EdgeNode): Promise<void> {
    return client.delete<void>(`/admin/edge-nodes/${edgeNode.id}`)
  },
}
