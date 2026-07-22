import { Priority } from '../../lib/types'
import { Minus, ArrowUp, AlertTriangle, Zap } from 'lucide-react'

const config: Record<Priority, { className: string; icon: React.ElementType }> = {
  'Low': { className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: Minus },
  'Medium': { className: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: ArrowUp },
  'High': { className: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: AlertTriangle },
  'Critical': { className: 'bg-red-50 text-red-400 border-red-500/30', icon: Zap },
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { className, icon: Icon } = config[priority] ?? config['Medium']
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      <Icon className="w-3 h-3" />
      {priority}
    </span>
  )
}
