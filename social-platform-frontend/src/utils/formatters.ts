import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDate = (date: string | Date, fmt = 'dd/MM/yyyy') =>
  format(typeof date === 'string' ? parseISO(date) : date, fmt, { locale: es })

export const formatDateTime = (date: string | Date) =>
  formatDate(date, "dd/MM/yyyy 'a las' HH:mm")

export const formatRelative = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return formatDate(d)
}

export const statusColors: Record<string, string> = {
  Active: 'badge-active',
  Pending: 'badge-pending',
  Suspended: 'badge-inactive',
  Rejected: 'badge-danger',
  Planning: 'badge-pending',
  Completed: 'badge-active',
  Cancelled: 'badge-danger',
  Enrolled: 'badge-pending',
  Withdrawn: 'badge-inactive',
}

export const statusLabels: Record<string, string> = {
  Active: 'Activo',
  Pending: 'Pendiente',
  Suspended: 'Suspendido',
  Rejected: 'Rechazado',
  Planning: 'Planificación',
  Completed: 'Completado',
  Cancelled: 'Cancelado',
  Enrolled: 'Inscrito',
  Withdrawn: 'Retirado',
  Male: 'Masculino',
  Female: 'Femenino',
  Other: 'Otro',
}

export const genderLabels: Record<string, string> = {
  Male: 'Masculino',
  Female: 'Femenino',
  Other: 'Otro',
}
