export type StatusBadgeVariant = 'online' | 'offline' | 'busy' | 'away'

export interface StatusBadgeProps {
  variant?: StatusBadgeVariant
  label?: string
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  online: 'bg-green-100 text-green-800',
  offline: 'bg-gray-100 text-gray-600',
  busy: 'bg-red-100 text-red-800',
  away: 'bg-yellow-100 text-yellow-800',
}

const defaultLabels: Record<StatusBadgeVariant, string> = {
  online: '在线',
  offline: '离线',
  busy: '忙碌',
  away: '离开',
}

export function StatusBadge({ variant = 'offline', label }: StatusBadgeProps) {
  const text = label ?? defaultLabels[variant]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {text}
    </span>
  )
}
