import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  iconColor: string
  bgColor: string
  borderColor: string
  glowClass: string
  subtitle?: string
  trend?: { value: number; positive: boolean }
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
  glowClass,
  subtitle,
}: StatsCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${borderColor} bg-white p-5 transition-all duration-200 hover:scale-[1.02] ${glowClass}`}
    >
      {/* Background decoration */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 ${bgColor} rounded-full blur-2xl opacity-40`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-efm-text-500 uppercase tracking-wider mb-2">{title}</p>
            <p className="text-3xl font-bold text-efm-text-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-efm-text-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${bgColor} border ${borderColor}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
