import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/layouts/AppLayout'

export function ProtectedRoute({ requiredRoles }: { requiredRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (requiredRoles && !requiredRoles.some(r => user?.roles.includes(r)))
    return <Navigate to="/dashboard" replace />

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

export function PublicRoute() {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
