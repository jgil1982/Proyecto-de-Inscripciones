import api from './api'
import type { ApiResponse, PagedResult, Child, QueryParams } from '@/types'

interface ChildQuery extends QueryParams {
  churchId?: string
  gender?: string
  isActive?: boolean
  minAge?: number
  maxAge?: number
}

interface CreateChildPayload {
  firstName: string
  lastName: string
  documentNumber: string
  documentType: string
  birthDate: string
  gender: number
  churchId: string
  address?: string
  phone?: string
  email?: string
  guardianName?: string
  guardianPhone?: string
  guardianRelationship?: string
  medicalNotes?: string
  notes?: string
}

export const childService = {
  getAll: async (query: ChildQuery = {}): Promise<PagedResult<Child>> => {
    const { data } = await api.get<ApiResponse<PagedResult<Child>>>('/children', { params: query })
    return data.data
  },

  getByChurch: async (churchId: string, query: ChildQuery = {}): Promise<PagedResult<Child>> => {
    const { data } = await api.get<ApiResponse<PagedResult<Child>>>(`/children/church/${churchId}`, { params: query })
    return data.data
  },

  getById: async (id: string): Promise<Child> => {
    const { data } = await api.get<ApiResponse<Child>>(`/children/${id}`)
    return data.data
  },

  create: async (payload: CreateChildPayload): Promise<Child> => {
    const { data } = await api.post<ApiResponse<Child>>('/children', payload)
    return data.data
  },

  update: async (id: string, payload: Partial<CreateChildPayload> & { isActive?: boolean }): Promise<Child> => {
    const { data } = await api.put<ApiResponse<Child>>(`/children/${id}`, payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/children/${id}`)
  },
}
