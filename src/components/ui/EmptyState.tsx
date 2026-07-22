import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 bg-efm-bg-200 rounded-2xl flex items-center justify-center mb-4 border border-efm-bg-500">
        <Icon className="w-8 h-8 text-efm-text-400" />
      </div>
      <h3 className="text-base font-semibold text-efm-text-600 mb-1">{title}</h3>
      <p className="text-sm text-efm-text-400 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  )
}
