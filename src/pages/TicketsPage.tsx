import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Ticket as TicketIcon,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Ticket, TicketFilters } from '../lib/types'
import { TICKET_STATUSES, PRIORITY_LEVELS, TICKET_TYPES, ZCMC_DEPARTMENTS } from '../lib/constants'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import TypeBadge from '../components/ui/TypeBadge'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'

const PAGE_SIZE = 15

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function exportCSV(tickets: Ticket[]) {
  const headers = [
    'Ticket #', 'Type', 'Title', 'Category', 'Priority', 'Status',
    'Department', 'Equipments', 'Due Date', 'Created At', 'Resolved At',
  ]
  const rows = tickets.map((t) => {
    const eqStr = (t.equipments || []).map(e => [e.name, e.brand, e.model, e.serial].filter(Boolean).join(' ')).join(' | ')
    return [
      t.ticket_number,
      t.type,
      `"${(t.title ?? '').replace(/"/g, '""')}"`,
      `"${(t.category?.name ?? '').replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      t.department ?? '',
      `"${eqStr.replace(/"/g, '""')}"`,
      t.due_date ?? '',
      t.created_at,
      t.resolved_at ?? '',
    ]
  })
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bmeu-tickets-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function TicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<TicketFilters>({
    search: '',
    status: '',
    priority: '',
    type: '',
    department: '',
    category_id: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const loadTickets = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('tickets')
      .select('*, category:categories(id,name,is_custom,created_at)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.priority) query = query.eq('priority', filters.priority)
    if (filters.type) query = query.eq('type', filters.type)
    if (filters.department) query = query.eq('department', filters.department)
    if (filters.category_id) query = query.eq('category_id', filters.category_id)

    const { data, count } = await query
    setTickets((data as Ticket[]) ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [page, filters])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  function updateFilter<K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ search: '', status: '', priority: '', type: '', department: '', category_id: '' })
    setPage(0)
  }

  const hasActiveFilters =
    filters.status || filters.priority || filters.type || filters.department || filters.category_id

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <PageHeader
        title="All Tickets"
        subtitle={`${total} ticket${total !== 1 ? 's' : ''} total`}
        actions={
          <>
            <button
              id="export-csv-btn"
              onClick={() => exportCSV(tickets)}
              className="btn-secondary"
              title="Export current view to CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <Link id="new-ticket-btn" to="/tickets/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              New Ticket
            </Link>
          </>
        }
      />

      {/* Search + Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-efm-text-500" />
          <input
            id="ticket-search"
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search by ticket #, title, description..."
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary ${hasActiveFilters ? 'border-efm-primary-500/40 text-efm-primary-500' : ''}`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-efm-primary-500" />
          )}
        </button>
        <button onClick={loadTickets} className="btn-ghost" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white border border-efm-bg-400 rounded-xl animate-slide-up">
          <div>
            <label className="label-field">Status</label>
            <select
              className="select-field"
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value as TicketFilters['status'])}
            >
              <option value="">All statuses</option>
              {TICKET_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Priority</label>
            <select
              className="select-field"
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value as TicketFilters['priority'])}
            >
              <option value="">All priorities</option>
              {PRIORITY_LEVELS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Type</label>
            <select
              className="select-field"
              value={filters.type}
              onChange={(e) => updateFilter('type', e.target.value as TicketFilters['type'])}
            >
              <option value="">All types</option>
              {TICKET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Department</label>
            <select
              className="select-field"
              value={filters.department}
              onChange={(e) => updateFilter('department', e.target.value)}
            >
              <option value="">All departments</option>
              {ZCMC_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <div className="col-span-full flex justify-end">
              <button onClick={clearFilters} className="btn-ghost text-xs">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-efm-bg-400 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-efm-text-400 uppercase tracking-wider border-b border-efm-bg-400 bg-efm-bg-100/50">
                <th className="text-left px-5 py-3.5 font-medium">Ticket #</th>
                <th className="text-left px-5 py-3.5 font-medium">Title</th>
                <th className="text-left px-5 py-3.5 font-medium">Type</th>
                <th className="text-left px-5 py-3.5 font-medium">Priority</th>
                <th className="text-left px-5 py-3.5 font-medium">Status</th>
                <th className="text-left px-5 py-3.5 font-medium">Department</th>
                <th className="text-left px-5 py-3.5 font-medium">Due Date</th>
                <th className="text-left px-5 py-3.5 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-efm-bg-200">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-efm-bg-200 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="hover:bg-efm-bg-200/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-efm-primary-500 group-hover:text-efm-primary-400 whitespace-nowrap">
                        {ticket.ticket_number}
                      </td>
                      <td className="px-5 py-3.5 text-efm-text-800 max-w-[220px] truncate">
                        {ticket.title}
                      </td>
                      <td className="px-5 py-3.5">
                        <TypeBadge type={ticket.type} />
                      </td>
                      <td className="px-5 py-3.5">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-5 py-3.5 text-efm-text-500 text-xs whitespace-nowrap">
                        {ticket.department ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-efm-text-500 text-xs whitespace-nowrap">
                        {ticket.due_date ? formatDate(ticket.due_date) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-efm-text-400 text-xs whitespace-nowrap">
                        {formatDate(ticket.created_at)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && tickets.length === 0 && (
          <EmptyState
            icon={TicketIcon}
            title="No tickets found"
            description="Try adjusting your search or filter criteria, or create a new ticket."
            action={
              <Link to="/tickets/new" className="btn-primary">
                <Plus className="w-4 h-4" /> New Ticket
              </Link>
            }
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-efm-bg-400">
            <p className="text-xs text-efm-text-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-ghost py-1.5 px-2 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-efm-text-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-ghost py-1.5 px-2 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
