export interface User {
  id: string
  email: string
  fullName: string
  roles: string[]
  churchId?: string
  churchName?: string
  profilePictureUrl?: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface QueryParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDescending?: boolean
}

// Church
export type ChurchStatus = 'Pending' | 'Active' | 'Suspended' | 'Rejected'

export interface Church {
  id: string
  name: string
  legalName: string
  taxId?: string
  address: string
  city: string
  state: string
  country: string
  phone: string
  email: string
  website?: string
  pastorName?: string
  logoUrl?: string
  description?: string
  status: ChurchStatus
  statusLabel: string
  childrenCount: number
  usersCount?: number
  activeInterventions?: number
  approvedAt?: string
  approvedBy?: string
  rejectionReason?: string
  createdAt: string
}

export interface CreateChurchForm {
  name: string
  legalName: string
  taxId?: string
  address: string
  city: string
  state: string
  country: string
  phone: string
  email: string
  website?: string
  pastorName?: string
  description?: string
  adminFirstName: string
  adminLastName: string
  adminEmail: string
  adminPassword: string
}

// Child
export type Gender = 'Male' | 'Female' | 'Other'

export interface Child {
  id: string
  firstName: string
  lastName: string
  fullName: string
  documentNumber: string
  documentType: string
  birthDate: string
  age: number
  gender: Gender
  genderLabel: string
  photoUrl?: string
  address?: string
  phone?: string
  email?: string
  guardianName?: string
  guardianPhone?: string
  guardianRelationship?: string
  medicalNotes?: string
  notes?: string
  churchName: string
  churchId: string
  isActive: boolean
  activeInterventions: number
  createdAt: string
  participations?: ParticipationSummary[]
}

export interface ParticipationSummary {
  participationId: string
  interventionId: string
  interventionName: string
  status: string
  enrolledAt: string
}

// Intervention
export type InterventionStatus = 'Planning' | 'Active' | 'Completed' | 'Cancelled'

export interface Intervention {
  id: string
  name: string
  category?: string
  description?: string
  startDate: string
  endDate?: string
  status: InterventionStatus
  statusLabel: string
  enrolledCount: number
  maxParticipants?: number
  minAge: number
  maxAge: number
  location?: string
  imageUrl?: string
  isPublic: boolean
  objectives?: string
  requirements?: string
  createdAt: string
  participants?: Participation[]
}

export interface Participation {
  id: string
  childId: string
  childName: string
  childDocument: string
  churchName: string
  status: string
  statusLabel: string
  enrolledAt: string
  completedAt?: string
  notes?: string
  score?: number
}

// Dashboard
export interface GlobalDashboard {
  totalChurches: number
  activeChurches: number
  pendingChurches: number
  totalChildren: number
  activeChildren: number
  totalInterventions: number
  activeInterventions: number
  totalParticipations: number
  completedParticipations: number
  topChurches: ChurchKpi[]
  topInterventions: InterventionKpi[]
  monthlyStats: MonthlyStats[]
  churchStatusChart: ChartItem[]
  genderChart: ChartItem[]
  ageGroupChart: AgeGroup[]
}

export interface ChurchDashboard {
  churchName: string
  totalChildren: number
  activeChildren: number
  totalParticipations: number
  activeParticipations: number
  completedParticipations: number
  availableInterventions: number
  myInterventions: InterventionKpi[]
  genderChart: ChartItem[]
  ageGroupChart: AgeGroup[]
  monthlyRegistrations: MonthlyStats[]
}

export interface ChurchKpi {
  churchId: string
  churchName: string
  childrenCount: number
  participationsCount: number
}

export interface InterventionKpi {
  interventionId: string
  interventionName: string
  category?: string
  participantsCount: number
  status: string
}

export interface MonthlyStats {
  month: string
  children: number
  participations: number
  completions: number
}

export interface ChartItem {
  name: string
  value: number
  color: string
}

export interface AgeGroup {
  group: string
  count: number
}
