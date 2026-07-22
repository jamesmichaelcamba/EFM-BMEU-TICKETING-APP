import { TicketStatus } from '../../lib/types'

const config: Record<TicketStatus, { className: string }> = {
  'Open': { className: 'bg-efm-primary-500/10 text-efm-primary-500 border-efm-primary-500/30' },
  'In Progress': { className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  'Pending Parts': { className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  'For Monitoring': { className: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  'Resolved': { className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  'Closed': { className: 'bg-efm-text-400/10 text-efm-text-500 border-efm-text-400/30' },
}

export default function StatusBadge({ status }: { status: TicketStatus }) {
  const { className } = config[status] ?? config['Open']
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  )
}
