import api from './api'
import type { ApiResponse, PagedResult, Intervention, Participation, QueryParams } from '@/types'

interface InterventionQuery extends QueryParams {
  status?: string
  category?: string
  startDateFrom?: string
  startDateTo?: string
}

interface CreateInterventionPayload {
  name: string
  description?: string
  category?: string
  startDate: string
  endDate?: string
  maxParticipants?: number
  minAge: number
  maxAge: number
  location?: string
  objectives?: string
  requirements?: string
  isPublic: boolean
  status?: number
}

interface EnrollPayload {
  childId: string
  interventionId: string
  notes?: string
}

export const interventionService = {
  getAll: async (query: InterventionQuery = {}): Promise<PagedResult<Intervention>> => {
    const { data } = await api.get<ApiResponse<PagedResult<Intervention>>>('/interventions', { params: query })
    return data.data
  },

  getById: async (id: string): Promise<Intervention> => {
    const { data } = await api.get<ApiResponse<Intervention>>(`/interventions/${id}`)
    return data.data
  },

  create: async (payload: CreateInterventionPayload): Promise<Intervention> => {
    const { data } = await api.post<ApiResponse<Intervention>>('/interventions', payload)
    return data.data
  },

  update: async (id: string, payload: Partial<CreateInterventionPayload>): Promise<Intervention> => {
    const { data } = await api.put<ApiResponse<Intervention>>(`/interventions/${id}`, payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/interventions/${id}`)
  },

  enroll: async (payload: EnrollPayload): Promise<Participation> => {
    const { data } = await api.post<ApiResponse<Participation>>('/interventions/enroll', payload)
    return data.data
  },

  withdraw: async (participationId: string): Promise<void> => {
    await api.post(`/interventions/withdraw/${participationId}`)
  },

  getParticipants: async (id: string): Promise<Participation[]> => {
    const { data } = await api.get<ApiResponse<Participation[]>>(`/interventions/${id}/participants`)
    return data.data
  },
}
