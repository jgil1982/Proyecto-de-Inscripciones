import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Church, Users, Activity, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { KpiCard } from '@/components/ui/KpiCard'
import { PageLoader } from '@/components/ui/Spinner'
import { dashboardService } from '@/services/dashboardService'
import { useAuthStore } from '@/store/authStore'
import type { GlobalDashboard, ChurchDashboard } from '@/types'

export function DashboardPage() {
  const { isSuperAdmin } = useAuthStore()

  if (isSuperAdmin()) return <GlobalDashboardView />
  return <ChurchDashboardView />
}

function GlobalDashboardView() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'global'],
    queryFn: dashboardService.getGlobal,
  })

  if (isLoading) return <PageLoader />
  if (!data) return null

  const d = data as GlobalDashboard

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard Global</h1>
        <p className="text-sm text-slate-500 mt-0.5">Visión general de toda la plataforma</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Iglesias" value={d.totalChurches} subtitle={`${d.activeChurches} activas`} icon={Church} color="indigo" />
        <KpiCard title="Iglesias Pendientes" value={d.pendingChurches} subtitle="Por aprobar" icon={Clock} color="amber" />
        <KpiCard title="Total Niños" value={d.totalChildren} subtitle={`${d.activeChildren} activos`} icon={Users} color="emerald" />
        <KpiCard title="Participaciones" value={d.totalParticipations} subtitle={`${d.completedParticipations} completadas`} icon={CheckCircle} color="sky" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KpiCard title="Intervenciones" value={d.totalInterventions} subtitle={`${d.activeInterventions} activas`} icon={Activity} color="rose" />
        <KpiCard title="Tasa Finalización" value={`${d.totalParticipations > 0 ? Math.round((d.completedParticipations / d.totalParticipations) * 100) : 0}%`} subtitle="Participaciones completadas" icon={TrendingUp} color="emerald" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Bar Chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Actividad Mensual</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.monthlyStats} barSize={10} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="children" name="Niños" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="participations" name="Inscripciones" fill="#a5b4fc" radius={[3, 3, 0, 0]} />
              <Bar dataKey="completions" name="Completados" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Church Status Pie */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Estado Iglesias</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={d.churchStatusChart} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {d.churchStatusChart.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gender */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Distribución por Género</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={d.genderChart} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">
                {d.genderChart.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age groups */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Grupos de Edad</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.ageGroupChart} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              <Bar dataKey="count" name="Niños" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Churches Table */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Iglesias con más Niños</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <th className="pb-3">Iglesia</th>
                <th className="pb-3 text-right">Niños</th>
                <th className="pb-3 text-right">Participaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {d.topChurches.map((c) => (
                <tr key={c.churchId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium text-slate-700">{c.churchName}</td>
                  <td className="py-3 text-right text-slate-600">{c.childrenCount}</td>
                  <td className="py-3 text-right text-slate-600">{c.participationsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ChurchDashboardView() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'my'],
    queryFn: dashboardService.getMy,
  })

  if (isLoading) return <PageLoader />
  if (!data) return null

  const d = data as ChurchDashboard

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">{d.churchName}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Niños" value={d.totalChildren} subtitle={`${d.activeChildren} activos`} icon={Users} color="indigo" />
        <KpiCard title="Participaciones" value={d.totalParticipations} subtitle={`${d.activeParticipations} activas`} icon={Activity} color="emerald" />
        <KpiCard title="Completadas" value={d.completedParticipations} subtitle="Finalizadas" icon={CheckCircle} color="sky" />
        <KpiCard title="Intervenciones" value={d.availableInterventions} subtitle="Disponibles" icon={TrendingUp} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Registro Mensual de Niños</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.monthlyRegistrations} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              <Bar dataKey="children" name="Niños" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Géneros</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={d.genderChart} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">
                {d.genderChart.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
