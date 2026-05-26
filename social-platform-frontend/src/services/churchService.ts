import api from './api'
import type { ApiResponse, PagedResult, Church, CreateChurchForm, QueryParams } from '@/types'

interface ChurchQuery extends QueryParams {
  status?: string
  city?: string
}

export const churchService = {
  getAll: async (query: ChurchQuery = {}): Promise<PagedResult<Church>> => {
    const { data } = await api.get<ApiResponse<PagedResult<Church>>>('/churches', { params: query })
    return data.data
  },

  getById: async (id: string): Promise<Church> => {
    const { data } = await api.get<ApiResponse<Church>>(`/churches/${id}`)
    return data.data
  },

  create: async (payload: CreateChurchForm): Promise<Church> => {
    const { data } = await api.post<ApiResponse<Church>>('/churches', payload)
    return data.data
  },

  update: async (id: string, payload: Partial<Church>): Promise<Church> => {
    const { data } = await api.put<ApiResponse<Church>>(`/churches/${id}`, payload)
    return data.data
  },

  approve: async (id: string): Promise<void> => {
    await api.post(`/churches/${id}/approve`)
  },

  reject: async (id: string, reason: string): Promise<void> => {
    await api.post(`/churches/${id}/reject`, { reason })
  },

  suspend: async (id: string): Promise<void> => {
    await api.post(`/churches/${id}/suspend`)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/churches/${id}`)
  },
}
