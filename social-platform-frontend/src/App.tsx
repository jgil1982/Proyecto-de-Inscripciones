import { lazy, Suspense, Component, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute'
import { PageLoader } from './components/ui/Spinner'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace' }}>
          <h2 style={{ color: 'red' }}>Error en la aplicación</h2>
          <pre style={{ background: '#fee', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
            {(this.state.error as Error).message}
            {'\n\n'}
            {(this.state.error as Error).stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ChurchesPage = lazy(() => import('./pages/churches/ChurchesPage').then(m => ({ default: m.ChurchesPage })))
const ChildrenPage = lazy(() => import('./pages/children/ChildrenPage').then(m => ({ default: m.ChildrenPage })))
const InterventionsPage = lazy(() => import('./pages/interventions/InterventionsPage').then(m => ({ default: m.InterventionsPage })))

export default function App() {
  return (
    <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/children" element={<ChildrenPage />} />
          <Route path="/interventions" element={<InterventionsPage />} />
        </Route>

        {/* SuperAdmin only */}
        <Route element={<ProtectedRoute requiredRoles={['SuperAdmin']} />}>
          <Route path="/churches" element={<ChurchesPage />} />
        </Route>

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  )
}
