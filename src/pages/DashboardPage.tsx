import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Ticket,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  Package,
  Activity,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { Ticket as TicketType, DashboardStats } from '../lib/types'
import { useAuth } from '../hooks/useAuth'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import TypeBadge from '../components/ui/TypeBadge'
import StatsCard from '../components/ui/StatsCard'

const STATUS_CHART_COLORS: Record<string, string> = {
  Open: '#22d3ee',
  'In Progress': '#3b82f6',
  'Pending Parts': '#f59e0b',
  'For Monitoring': '#a78bfa',
  Resolved: '#10b981',
  Closed: '#6b7280',
}

const TYPE_COLORS = ['#ef4444', '#14b8a6', '#94a3b8']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: tickets } = await supabase
        .from('tickets')
        .select('status, priority, type, resolved_at')

      const { data: recent } = await supabase
        .from('tickets')
        .select('id, ticket_number, title, status, priority, type, department, created_at')
        .order('created_at', { ascending: false })
        .limit(8)

      if (tickets) {
        const today = new Date().toDateString()
        setStats({
          total: tickets.length,
          open: tickets.filter((t) => t.status === 'Open').length,
          inProgress: tickets.filter((t) => t.status === 'In Progress').length,
          pendingParts: tickets.filter((t) => t.status === 'Pending Parts').length,
          forMonitoring: tickets.filter((t) => t.status === 'For Monitoring').length,
          resolved: tickets.filter((t) => t.status === 'Resolved').length,
          closed: tickets.filter((t) => t.status === 'Closed').length,
          critical: tickets.filter((t) => t.priority === 'Critical').length,
          resolvedToday: tickets.filter(
            (t) =>
              t.resolved_at && new Date(t.resolved_at as string).toDateString() === today
          ).length,
        })
      }

      setRecentTickets((recent as TicketType[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const statusChartData = stats
    ? [
        { name: 'Open', value: stats.open },
        { name: 'In Progress', value: stats.inProgress },
        { name: 'Pending Parts', value: stats.pendingParts },
        { name: 'For Monitoring', value: stats.forMonitoring },
        { name: 'Resolved', value: stats.resolved },
        { name: 'Closed', value: stats.closed },
      ]
    : []

  const typeChartData = recentTickets.length
    ? [
        { name: 'CM', value: recentTickets.filter((t) => t.type === 'CM').length },
        { name: 'PM', value: recentTickets.filter((t) => t.type === 'PM').length },
        { name: 'Other', value: recentTickets.filter((t) => t.type === 'Other').length },
      ].filter((d) => d.value > 0)
    : []

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-efm-text-900">
            {greeting()},{' '}
            <span className="text-gradient">
              {profile?.full_name?.split(' ')[0] ?? 'there'}
            </span>
            !
          </h1>
          <p className="text-sm text-efm-text-500 mt-0.5">
            {new Date().toLocaleDateString('en-PH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Ticket
        </Link>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white border border-efm-bg-400 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard
            title="Total Tickets"
            value={stats.total}
            icon={Ticket}
            iconColor="text-efm-primary-500"
            bgColor="bg-efm-primary-500/10"
            borderColor="border-efm-primary-500/20"
            glowClass="stat-glow-cyan"
          />
          <StatsCard
            title="Open"
            value={stats.open}
            icon={Activity}
            iconColor="text-blue-400"
            bgColor="bg-blue-500/10"
            borderColor="border-blue-500/20"
            glowClass="stat-glow-blue"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            iconColor="text-amber-400"
            bgColor="bg-amber-500/10"
            borderColor="border-amber-500/20"
            glowClass="stat-glow-amber"
          />
          <StatsCard
            title="Critical"
            value={stats.critical}
            icon={AlertTriangle}
            iconColor="text-red-400"
            bgColor="bg-red-50"
            borderColor="border-red-200"
            glowClass="stat-glow-red"
          />
          <StatsCard
            title="Resolved Today"
            value={stats.resolvedToday}
            icon={CheckCircle2}
            iconColor="text-emerald-400"
            bgColor="bg-emerald-500/10"
            borderColor="border-emerald-500/20"
            glowClass="stat-glow-emerald"
          />
          <StatsCard
            title="Pending Parts"
            value={stats.pendingParts}
            icon={Package}
            iconColor="text-purple-400"
            bgColor="bg-purple-500/10"
            borderColor="border-purple-500/20"
            glowClass="stat-glow-purple"
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-efm-bg-400 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-efm-primary-500" />
            <h2 className="text-sm font-semibold text-efm-text-800">Tickets by Status</h2>
          </div>
          {loading ? (
            <div className="h-48 animate-pulse bg-efm-bg-200 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={{ stroke: '#1E3A5F' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0D1B2A',
                    border: '1px solid #1E3A5F',
                    borderRadius: '8px',
                    color: '#F0F9FF',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(6,182,212,0.05)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_CHART_COLORS[entry.name] ?? '#22d3ee'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Type Pie Chart */}
        <div className="bg-white border border-efm-bg-400 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-efm-primary-500" />
            <h2 className="text-sm font-semibold text-efm-text-800">Ticket Types</h2>
          </div>
          {loading ? (
            <div className="h-48 animate-pulse bg-efm-bg-200 rounded-lg" />
          ) : typeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {typeChartData.map((_, index) => (
                    <Cell key={index} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0D1B2A',
                    border: '1px solid #1E3A5F',
                    borderRadius: '8px',
                    color: '#F0F9FF',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-efm-text-400 text-sm">
              No ticket data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white border border-efm-bg-400 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-efm-bg-400">
          <h2 className="text-sm font-semibold text-efm-text-800">Recent Tickets</h2>
          <Link to="/tickets" className="text-xs text-efm-primary-500 hover:text-efm-primary-400 transition-colors">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-efm-bg-200 animate-pulse" />
            ))}
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="px-5 py-10 text-center text-efm-text-400 text-sm">
            No tickets yet. <Link to="/tickets/new" className="text-efm-primary-500 hover:underline">Create your first ticket →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-efm-text-400 uppercase tracking-wider border-b border-efm-bg-400">
                  <th className="text-left px-5 py-3 font-medium">Ticket #</th>
                  <th className="text-left px-5 py-3 font-medium">Title</th>
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                  <th className="text-left px-5 py-3 font-medium">Priority</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Department</th>
                  <th className="text-left px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-efm-bg-200">
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-efm-bg-200/50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/tickets/${ticket.id}`)}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-efm-primary-500">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-5 py-3 text-efm-text-800 max-w-[200px] truncate">
                      {ticket.title}
                    </td>
                    <td className="px-5 py-3">
                      <TypeBadge type={ticket.type} />
                    </td>
                    <td className="px-5 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-5 py-3 text-efm-text-500 text-xs">
                      {ticket.department ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-efm-text-400 text-xs">
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
