import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  MessageSquarePlus,
  Send,
  Loader2,
  Trash2,
  Calendar,
  MapPin,
  Cpu,
  Tag,
  AlertTriangle,
  User,
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Ticket, Comment, Category, TicketStatus, Priority, TicketType } from '../lib/types'
import {
  ZCMC_DEPARTMENTS,
  TICKET_TYPES,
  PRIORITY_LEVELS,
  TICKET_STATUSES,
  STATUS_TRANSITIONS,
} from '../lib/constants'
import { useAuth } from '../hooks/useAuth'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import TypeBadge from '../components/ui/TypeBadge'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const TRANSITION_STYLES: Record<string, { className: string, icon: any }> = {
  'Open': { className: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200', icon: AlertCircle },
  'In Progress': { className: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200', icon: PlayCircle },
  'Pending Parts': { className: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200', icon: Clock },
  'For Monitoring': { className: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-cyan-200', icon: CheckCircle },
  'Resolved': { className: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200', icon: CheckCircle },
  'Closed': { className: 'bg-efm-bg-200 text-efm-text-600 hover:bg-efm-bg-300 border-efm-bg-400', icon: XCircle },
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [staff, setStaff] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Edit form mirrors ticket fields
  const [editForm, setEditForm] = useState<Partial<Ticket>>({})

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [{ data: t }, { data: c }, { data: cats }, { data: staffData }] = await Promise.all([
      supabase
        .from('tickets')
        .select('*, category:categories(id,name,is_custom,created_at), reporter:profiles!tickets_reported_by_fkey(id,work_id,full_name,role,created_at), assignee:profiles!tickets_assigned_to_fkey(id,work_id,full_name,role,created_at)')
        .eq('id', id)
        .single(),
      supabase
        .from('comments')
        .select('*, author:profiles(id,work_id,full_name,role,created_at)')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('profiles').select('*').eq('status', 'Approved').order('full_name'),
    ])
    setTicket(t as Ticket)
    setComments((c as Comment[]) ?? [])
    setCategories((cats as Category[]) ?? [])
    setStaff((staffData as Profile[]) ?? [])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  function startEdit() {
    if (!ticket) return
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      category_id: ticket.category_id,
      priority: ticket.priority,
      status: ticket.status,
      department: ticket.department,
      equipments: ticket.equipments || [],
      due_date: ticket.due_date,
      assigned_to: ticket.assigned_to,
    })
    setEditing(true)
  }

  async function saveEdit() {
    if (!ticket) return
    setSaving(true)
    const validEquipments = (editForm.equipments || []).filter(e => e.name || e.brand || e.model || e.serial)
    const { data } = await supabase
      .from('tickets')
      .update({ ...editForm, equipments: validEquipments })
      .eq('id', ticket.id)
      .select('*, category:categories(id,name,is_custom,created_at)')
      .single()
    if (data) setTicket(data as Ticket)
    setSaving(false)
    setEditing(false)
  }

  async function updateStatus(newStatus: TicketStatus) {
    if (!ticket) return
    const { data, error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', ticket.id)
      .select('*, category:categories(id,name,is_custom,created_at), reporter:profiles!tickets_reported_by_fkey(id,work_id,full_name,role,created_at), assignee:profiles!tickets_assigned_to_fkey(id,work_id,full_name,role,created_at)')
      .single()
    if (error) {
      alert(`Error updating status: ${error.message}`)
      console.error(error)
    }
    if (data) setTicket(data as Ticket)
  }

  async function sendComment() {
    if (!commentText.trim() || !ticket || !profile) return
    setSendingComment(true)
    const { data } = await supabase
      .from('comments')
      .insert({ ticket_id: ticket.id, author_id: profile.id, content: commentText.trim() })
      .select('*, author:profiles(id,work_id,full_name,role,created_at)')
      .single()
    if (data) setComments((prev) => [...prev, data as Comment])
    setCommentText('')
    setSendingComment(false)
  }

  async function handleDelete() {
    if (!ticket) return
    if (!confirm(`Delete ticket ${ticket.ticket_number}? This cannot be undone.`)) return
    setDeleting(true)
    await supabase.from('tickets').delete().eq('id', ticket.id)
    navigate('/tickets')
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        <div className="h-8 w-48 bg-white rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-64 bg-white rounded-xl animate-pulse" />
          <div className="h-64 bg-white rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-lg font-semibold text-efm-text-800 mb-1">Ticket not found</h2>
        <p className="text-efm-text-500 text-sm mb-4">This ticket may have been deleted or you don't have access.</p>
        <Link to="/tickets" className="btn-secondary">Back to Tickets</Link>
      </div>
    )
  }

  const nextStatuses = STATUS_TRANSITIONS[ticket.status] ?? []

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/tickets" className="btn-ghost py-2 px-2">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-sm text-efm-primary-500">{ticket.ticket_number}</span>
              <TypeBadge type={ticket.type} />
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-lg font-bold text-efm-text-900">
              {editing ? (
                <input
                  type="text"
                  value={editForm.title ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="input-field text-lg font-bold"
                />
              ) : ticket.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="btn-ghost">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </>
          ) : (
            <>
              <button onClick={startEdit} className="btn-secondary">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={handleDelete} disabled={deleting} className="btn-danger">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status transitions */}
      {nextStatuses.length > 0 && !editing && (
        <div className="flex items-center gap-2 flex-wrap bg-white border border-efm-bg-400 p-3 rounded-xl shadow-sm mb-5">
          <span className="text-xs font-semibold text-efm-text-500 uppercase tracking-wider mr-2 ml-1">Move to:</span>
          {nextStatuses.map((s) => {
            const style = TRANSITION_STYLES[s] || { className: 'bg-efm-bg-200 text-efm-text-600 hover:bg-efm-bg-300 border-efm-bg-400', icon: PlayCircle }
            const Icon = style.icon
            return (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 shadow-sm ${style.className}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {s}
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: Main details + Comments */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-white border border-efm-bg-400 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-efm-text-600 mb-3">Description</h2>
            {editing ? (
              <textarea
                value={editForm.description ?? ''}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                className="textarea-field"
                rows={6}
                placeholder="Describe the concern..."
              />
            ) : (
              <p className="text-sm text-efm-text-600 whitespace-pre-wrap leading-relaxed">
                {ticket.description || <span className="text-efm-text-400 italic">No description provided.</span>}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white border border-efm-bg-400 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-efm-bg-400">
              <MessageSquarePlus className="w-4 h-4 text-efm-primary-500" />
              <h2 className="text-sm font-semibold text-efm-text-800">Notes & Comments</h2>
              <span className="text-xs text-efm-text-400 ml-auto">{comments.length} note{comments.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="divide-y divide-efm-bg-200 max-h-80 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="px-5 py-8 text-center text-efm-text-400 text-sm">
                  No notes yet. Add the first one below.
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-efm-primary-500/10 border border-efm-primary-500/20 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-efm-primary-500" />
                      </div>
                      <span className="text-xs font-semibold text-efm-text-600">
                        {c.author?.full_name ?? 'Unknown'}
                      </span>
                      <span className="text-xs text-efm-text-400 ml-auto">
                        {formatDateTime(c.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-efm-text-600 pl-9 whitespace-pre-wrap leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-efm-bg-400">
              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a note or update..."
                  className="textarea-field flex-1"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      sendComment()
                    }
                  }}
                />
                <button
                  onClick={sendComment}
                  disabled={!commentText.trim() || sendingComment}
                  className="btn-primary flex-shrink-0 px-3 self-end"
                >
                  {sendingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-efm-text-400 mt-1">Ctrl+Enter to send</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Metadata panel */}
        <div className="space-y-5">
          {/* Classification */}
          <div className="bg-white border border-efm-bg-400 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-efm-text-600">Classification</h2>

            {editing ? (
              <>
                <div>
                  <label className="label-field">Type</label>
                  <select className="select-field" value={editForm.type ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value as TicketType }))}>
                    {TICKET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Priority</label>
                  <select className="select-field" value={editForm.priority ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value as Priority }))}>
                    {PRIORITY_LEVELS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Status</label>
                  <select className="select-field" value={editForm.status ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as TicketStatus }))}>
                    {TICKET_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Category</label>
                  <select className="select-field" value={editForm.category_id ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, category_id: e.target.value }))}>
                    <option value="">No category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-efm-text-400 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Category</dt>
                  <dd className="text-xs text-efm-text-600">{ticket.category?.name ?? <span className="text-efm-text-400 italic">None</span>}</dd>
                </div>
              </dl>
            )}
          </div>

          {/* Location + Equipment */}
          <div className="bg-white border border-efm-bg-400 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-efm-text-600">Location & Equipment</h2>
            {editing ? (
              <>
                <div>
                  <label className="label-field">Department</label>
                  <select className="select-field" value={editForm.department ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}>
                    <option value="">Not specified</option>
                    {ZCMC_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-efm-bg-200">
                  <div className="flex items-center justify-between">
                    <label className="label-field !mb-0">Equipment</label>
                    <button
                      type="button"
                      onClick={() => setEditForm(f => ({ ...f, equipments: [...(f.equipments || []), { name: '', brand: '', model: '', serial: '' }] }))}
                      className="text-xs text-efm-primary-500 hover:text-efm-primary-400 font-medium"
                    >
                      + Add equipment
                    </button>
                  </div>
                  {(editForm.equipments || []).map((eq, i) => (
                    <div key={i} className="p-3 bg-efm-bg-100 border border-efm-bg-200 rounded-lg relative space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newEqs = [...(editForm.equipments || [])]
                          newEqs.splice(i, 1)
                          setEditForm(f => ({ ...f, equipments: newEqs }))
                        }}
                        className="absolute top-2 right-2 text-efm-text-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div>
                        <input
                          type="text"
                          placeholder="Equipment Name"
                          className="input-field"
                          value={eq.name}
                          onChange={(e) => {
                            const newEqs = [...(editForm.equipments || [])]
                            newEqs[i] = { ...newEqs[i], name: e.target.value }
                            setEditForm(f => ({ ...f, equipments: newEqs }))
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Brand"
                          className="input-field"
                          value={eq.brand}
                          onChange={(e) => {
                            const newEqs = [...(editForm.equipments || [])]
                            newEqs[i] = { ...newEqs[i], brand: e.target.value }
                            setEditForm(f => ({ ...f, equipments: newEqs }))
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Model"
                          className="input-field"
                          value={eq.model}
                          onChange={(e) => {
                            const newEqs = [...(editForm.equipments || [])]
                            newEqs[i] = { ...newEqs[i], model: e.target.value }
                            setEditForm(f => ({ ...f, equipments: newEqs }))
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Serial Number"
                          className="input-field"
                          value={eq.serial}
                          onChange={(e) => {
                            const newEqs = [...(editForm.equipments || [])]
                            newEqs[i] = { ...newEqs[i], serial: e.target.value }
                            setEditForm(f => ({ ...f, equipments: newEqs }))
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <dl className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-xs text-efm-text-400 flex items-center gap-1.5 flex-shrink-0"><MapPin className="w-3.5 h-3.5" />Ward</dt>
                    <dd className="text-xs text-efm-text-600 text-right">{ticket.department ?? <span className="text-efm-text-400 italic">Not specified</span>}</dd>
                  </div>
                </dl>
                
                {ticket.equipments && ticket.equipments.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs text-efm-text-400 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />Equipment</h3>
                    <div className="space-y-2">
                      {ticket.equipments.map((eq, i) => (
                        <div key={i} className="p-3 bg-efm-bg-100/50 border border-efm-bg-200/50 rounded-lg text-sm text-efm-text-600 space-y-1">
                          {eq.name && <div className="font-medium text-efm-text-800">{eq.name}</div>}
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
                            {eq.brand && <div><span className="text-efm-text-400">Brand:</span> {eq.brand}</div>}
                            {eq.model && <div><span className="text-efm-text-400">Model:</span> {eq.model}</div>}
                            {eq.serial && <div className="col-span-2"><span className="text-efm-text-400">SN:</span> <span className="font-mono">{eq.serial}</span></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white border border-efm-bg-400 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-efm-text-600">Dates</h2>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="label-field">Due Date</label>
                  <input type="date" className="input-field" value={editForm.due_date ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, due_date: e.target.value }))} style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="label-field">Assign To</label>
                  <select className="select-field" value={editForm.assigned_to ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, assigned_to: e.target.value || null }))}>
                    <option value="">Unassigned</option>
                    {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-efm-text-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Created</dt>
                  <dd className="text-xs text-efm-text-600">{formatDate(ticket.created_at)}</dd>
                </div>
                {ticket.due_date && (
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-efm-text-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Due Date</dt>
                    <dd className="text-xs text-efm-text-600">{formatDate(ticket.due_date)}</dd>
                  </div>
                )}
                {ticket.resolved_at && (
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-efm-text-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Resolved</dt>
                    <dd className="text-xs text-emerald-400">{formatDate(ticket.resolved_at)}</dd>
                  </div>
                )}
                {ticket.reporter && (
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-efm-text-400 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Created By</dt>
                    <dd className="text-xs text-efm-text-600">{ticket.reporter.full_name}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-efm-bg-200">
                  <dt className="text-xs text-efm-text-400 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Assignee</dt>
                  <dd className="text-xs font-semibold text-efm-primary-600">{ticket.assignee?.full_name ?? <span className="text-efm-text-400 font-normal italic">Unassigned</span>}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
