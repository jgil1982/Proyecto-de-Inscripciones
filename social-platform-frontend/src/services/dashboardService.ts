import api from './api'
import type { ApiResponse, GlobalDashboard, ChurchDashboard } from '@/types'

export const dashboardService = {
  getGlobal: async (): Promise<GlobalDashboard> => {
    const { data } = await api.get<ApiResponse<GlobalDashboard>>('/dashboard/global')
    return data.data
  },

  getMy: async (): Promise<ChurchDashboard> => {
    const { data } = await api.get<ApiResponse<ChurchDashboard>>('/dashboard/my')
    return data.data
  },

  getByChurch: async (churchId: string): Promise<ChurchDashboard> => {
    const { data } = await api.get<ApiResponse<ChurchDashboard>>(`/dashboard/church/${churchId}`)
    return data.data
  },
}
