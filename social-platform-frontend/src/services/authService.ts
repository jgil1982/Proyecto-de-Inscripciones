import api from './api'
import type { ApiResponse, User } from '@/types'

interface LoginPayload { email: string; password: string }
interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: User
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload)
    return data.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me')
    return data.data
  },
}
