import { cn } from '@/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: LucideIcon
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky'
  trend?: { value: number; label: string }
}

const colorMap = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'bg-indigo-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'bg-emerald-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'bg-amber-100' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600', ring: 'bg-rose-100' },
  sky: { bg: 'bg-sky-50', icon: 'text-sky-600', ring: 'bg-sky-100' },
}

export function KpiCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }: KpiCardProps) {
  const c = colorMap[color]
  return (
    <div className="card p-5 flex gap-4 items-start hover:shadow-card-hover transition-shadow">
      <div className={cn('p-2.5 rounded-xl', c.ring)}>
        <Icon size={20} className={c.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value.toLocaleString()}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={cn('text-xs mt-1 font-medium', trend.value >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </p>
        )}
      </div>
    </div>
  )
}
