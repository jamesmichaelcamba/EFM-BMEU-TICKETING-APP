import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Save, Loader2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Category, TicketType, Priority, TicketStatus } from '../lib/types'
import {
  ZCMC_DEPARTMENTS,
  TICKET_TYPES,
  PRIORITY_LEVELS,
  TICKET_STATUSES,
} from '../lib/constants'
import { useAuth } from '../hooks/useAuth'
import PageHeader from '../components/ui/PageHeader'

export default function NewTicketPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  // Form state
  const [form, setForm] = useState({
    type: 'CM' as TicketType,
    title: '',
    description: '',
    category_id: '',
    priority: 'Medium' as Priority,
    status: 'Open' as TicketStatus,
    department: '',
    equipments: [{ name: '', brand: '', model: '', serial: '' }],
    due_date: '',
  })

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories((data as Category[]) ?? [])
    })
  }, [])

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const addEquipment = () => {
    setForm((prev) => ({
      ...prev,
      equipments: [...prev.equipments, { name: '', brand: '', model: '', serial: '' }]
    }))
  }

  const removeEquipment = (index: number) => {
    setForm((prev) => ({
      ...prev,
      equipments: prev.equipments.filter((_, i) => i !== index)
    }))
  }

  const updateEquipment = (index: keyof typeof form.equipments & number, field: keyof typeof form.equipments[0], value: string) => {
    setForm((prev) => {
      const newEquipments = [...prev.equipments]
      newEquipments[index] = { ...newEquipments[index], [field]: value }
      return { ...prev, equipments: newEquipments }
    })
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    setAddingCategory(true)
    const { data } = await supabase
      .from('categories')
      .insert({ name: newCategoryName.trim(), is_custom: true })
      .select()
      .single()
    if (data) {
      setCategories((prev) => [...prev, data as Category])
      set('category_id', (data as Category).id)
      setNewCategoryName('')
    }
    setAddingCategory(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    setLoading(true)
    setError(null)

    const validEquipments = form.equipments.filter(
      (eq) => eq.name.trim() || eq.brand.trim() || eq.model.trim() || eq.serial.trim()
    )

    const payload = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id || null,
      priority: form.priority,
      status: form.status,
      department: form.department || null,
      equipments: validEquipments.length > 0 ? validEquipments : [],
      due_date: form.due_date || null,
      reported_by: profile?.id ?? null,
    }

    const { data, error: insertError } = await supabase
      .from('tickets')
      .insert(payload)
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    navigate(`/tickets/${(data as { id: string }).id}`)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="New Ticket"
        subtitle="Log a new concern or maintenance request"
        actions={
          <Link to="/tickets" className="btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
          </Link>
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT: Main details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Ticket type */}
            <div className="bg-white border border-efm-bg-400 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-efm-text-800 mb-4">Ticket Type</h2>
              <div className="grid grid-cols-3 gap-3">
                {TICKET_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('type', t.value)}
                    className={`flex flex-col items-start p-3 rounded-xl border transition-all duration-200 text-left ${
                      form.type === t.value
                        ? 'bg-efm-primary-500/10 border-efm-primary-500/40 text-efm-primary-500'
                        : 'bg-efm-bg-200 border-efm-bg-400 text-efm-text-500 hover:border-efm-bg-600 hover:text-efm-text-800'
                    }`}
                  >
                    <span className="font-bold text-sm">{t.value}</span>
                    <span className="text-xs mt-0.5 leading-tight opacity-75">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Core info */}
            <div className="bg-white border border-efm-bg-400 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-efm-text-800">Ticket Details</h2>

              <div>
                <label className="label-field">Title <span className="text-red-400">*</span></label>
                <input
                  id="ticket-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Brief summary of the concern or issue"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label-field">Description</label>
                <textarea
                  id="ticket-description"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Provide detailed information about the concern, steps observed, error messages, etc."
                  className="textarea-field"
                  rows={5}
                />
              </div>

              {/* Category */}
              <div>
                <label className="label-field">Category</label>
                <select
                  id="ticket-category"
                  className="select-field"
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.is_custom ? ' (Custom)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add custom category */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Add new category..."
                  className="input-field"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim() || addingCategory}
                  className="btn-secondary flex-shrink-0 px-3"
                >
                  {addingCategory ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Equipment */}
            <div className="bg-white border border-efm-bg-400 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-efm-text-800">Equipment Info</h2>
              </div>
              
              <div className="space-y-4">
                {form.equipments.map((eq, index) => (
                  <div key={index} className="p-4 pt-8 sm:pt-4 border border-efm-bg-400/50 rounded-lg relative">
                    {form.equipments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEquipment(index)}
                        className="absolute top-2 right-2 p-1 text-efm-text-500 hover:text-red-400 hover:bg-red-100 rounded-md transition-colors"
                        title="Remove equipment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 sm:mt-0 sm:pr-8">
                      <div>
                        <label className="label-field">Equipment Name</label>
                        <input
                          type="text"
                          value={eq.name}
                          onChange={(e) => updateEquipment(index, 'name', e.target.value)}
                          placeholder="e.g. Patient Monitor"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-field">Brand</label>
                        <input
                          type="text"
                          value={eq.brand}
                          onChange={(e) => updateEquipment(index, 'brand', e.target.value)}
                          placeholder="e.g. Mindray"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-field">Model</label>
                        <input
                          type="text"
                          value={eq.model}
                          onChange={(e) => updateEquipment(index, 'model', e.target.value)}
                          placeholder="e.g. BeneVision N12"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-field">Serial Number</label>
                        <input
                          type="text"
                          value={eq.serial}
                          onChange={(e) => updateEquipment(index, 'serial', e.target.value)}
                          placeholder="e.g. MN-2024-001"
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addEquipment}
                className="w-full flex items-center justify-center gap-2 py-2 mt-2 border border-dashed border-efm-bg-500 rounded-lg text-efm-text-500 hover:text-efm-primary-500 hover:border-efm-primary-500/50 hover:bg-efm-primary-500/10 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add another equipment
              </button>
            </div>
          </div>

          {/* RIGHT: Meta */}
          <div className="space-y-5">
            {/* Priority + Status */}
            <div className="bg-white border border-efm-bg-400 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-efm-text-800">Classification</h2>
              <div>
                <label className="label-field">Priority</label>
                <select
                  id="ticket-priority"
                  className="select-field"
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value as Priority)}
                >
                  {PRIORITY_LEVELS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Initial Status</label>
                <select
                  id="ticket-status"
                  className="select-field"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as TicketStatus)}
                >
                  {TICKET_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Department / Ward</label>
                <select
                  id="ticket-department"
                  className="select-field"
                  value={form.department}
                  onChange={(e) => set('department', e.target.value)}
                >
                  <option value="">Select department</option>
                  {ZCMC_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Due Date</label>
                <input
                  id="ticket-due-date"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => set('due_date', e.target.value)}
                  className="input-field"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>



            {/* Submit */}
            <button
              id="submit-ticket-btn"
              type="submit"
              disabled={loading || !form.title.trim()}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
