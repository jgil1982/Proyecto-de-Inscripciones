import { cn } from '@/utils/cn'
import { statusColors, statusLabels } from '@/utils/formatters'

interface BadgeProps {
  status: string
  label?: string
  className?: string
}

export function Badge({ status, label, className }: BadgeProps) {
  const cls = statusColors[status] ?? 'badge-inactive'
  const text = label ?? statusLabels[status] ?? status
  return <span className={cn(cls, className)}>{text}</span>
}
