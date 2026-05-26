import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Church, Users, Activity, LogOut,
  Menu, X, ChevronDown, Bell
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Iglesias', path: '/churches', icon: Church, roles: ['SuperAdmin'] },
  { label: 'Niños', path: '/children', icon: Users },
  { label: 'Intervenciones', path: '/interventions', icon: Activity },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isSuperAdmin } = useAuthStore()

  const filteredNav = navItems.filter(item =>
    !item.roles || item.roles.some(r => user?.roles.includes(r))
  )

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="min-h-screen flex bg-surface-subtle">
      {/* Sidebar Overlay Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200',
        'lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">SPI</p>
            <p className="text-xs text-slate-400">Plataforma Social</p>
          </div>
          <button
            className="ml-auto lg:hidden p-1 hover:bg-slate-100 rounded-lg text-slate-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {filteredNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Church info */}
        {!isSuperAdmin() && user?.churchName && (
          <div className="px-3 py-3 border-t border-slate-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 rounded-lg">
              <Church size={14} className="text-brand-500 shrink-0" />
              <p className="text-xs text-brand-700 font-medium truncate">{user.churchName}</p>
            </div>
          </div>
        )}

        {/* User area */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center gap-4">
          <button
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-slate-700 hidden sm:block">
              {isSuperAdmin() ? 'Super Administrador ONG' : user?.churchName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-400">
              <Bell size={18} />
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold">
                  {user?.fullName?.[0] ?? 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
                  {user?.fullName}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-800 truncate">{user?.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={14} />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
