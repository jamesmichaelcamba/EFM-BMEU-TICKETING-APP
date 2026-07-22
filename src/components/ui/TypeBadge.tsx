import { TicketType } from '../../lib/types'
import { Wrench, Calendar, FileText } from 'lucide-react'

const config: Record<TicketType, { className: string; icon: React.ElementType; label: string }> = {
  'CM': { className: 'bg-red-50 text-red-400 border-red-500/30', icon: Wrench, label: 'CM' },
  'PM': { className: 'bg-teal-500/10 text-teal-400 border-teal-500/30', icon: Calendar, label: 'PM' },
  'Other': { className: 'bg-efm-text-400/10 text-efm-text-500 border-efm-text-400/30', icon: FileText, label: 'Other' },
}

export default function TypeBadge({ type }: { type: TicketType }) {
  const { className, icon: Icon, label } = config[type] ?? config['Other']
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}
