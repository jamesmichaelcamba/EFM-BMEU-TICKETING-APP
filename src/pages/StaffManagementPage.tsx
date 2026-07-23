import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Profile, AccountStatus } from '../lib/types'
import { useAuth } from '../hooks/useAuth'
import PageHeader from '../components/ui/PageHeader'
import { CheckCircle, XCircle, Clock, ShieldAlert, UserCheck } from 'lucide-react'

export default function StaffManagementPage() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  // Only admins can view this page
  if (profile?.role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data as Profile[])
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function updateStatus(userId: string, newStatus: AccountStatus) {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId)

    if (error) {
      alert(`Error updating status: ${error.message}`)
    } else {
      loadUsers()
    }
  }

  async function updateRole(userId: string, newRole: 'Admin' | 'Technician') {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      alert(`Error updating role: ${error.message}`)
    } else {
      loadUsers()
    }
  }

  const pendingUsers = users.filter(u => u.status === 'Pending')
  const approvedUsers = users.filter(u => u.status === 'Approved')
  const rejectedUsers = users.filter(u => u.status === 'Rejected')

  function renderUserCard(u: Profile) {
    return (
      <div key={u.id} className="bg-white border border-efm-bg-400 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <h3 className="font-semibold text-efm-text-900">{u.full_name}</h3>
          <div className="flex items-center gap-3 text-sm text-efm-text-500 mt-1">
            <span className="font-mono bg-efm-bg-200 px-2 py-0.5 rounded text-efm-text-700">{u.work_id}</span>
            <span className="flex items-center gap-1 bg-efm-bg-100 px-2 py-0.5 rounded-lg border border-efm-bg-300">
              {u.role === 'Admin' ? <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> : <UserCheck className="w-3.5 h-3.5 text-blue-500" />}
              <select
                value={u.role}
                onChange={(e) => updateRole(u.id, e.target.value as 'Admin' | 'Technician')}
                className="bg-transparent border-none text-xs font-semibold focus:ring-0 cursor-pointer p-0 pr-4 text-efm-text-700 disabled:opacity-50"
                disabled={u.id === profile?.id}
                title={u.id === profile?.id ? "You cannot change your own role" : "Change role"}
              >
                <option value="Technician">Technician</option>
                <option value="Admin">Admin</option>
              </select>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {u.status !== 'Approved' && (
            <button
              onClick={() => updateStatus(u.id, 'Approved')}
              className="btn-secondary text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
            >
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
          )}
          {u.status !== 'Rejected' && (
            <button
              onClick={() => updateStatus(u.id, 'Rejected')}
              className="btn-ghost text-red-500 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          )}
          {u.status !== 'Pending' && (
            <button
              onClick={() => updateStatus(u.id, 'Pending')}
              className="btn-ghost text-amber-500 hover:bg-amber-50"
            >
              <Clock className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <PageHeader
        title="Staff Management"
        subtitle="Approve or reject BMEU staff accounts"
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-efm-bg-400 border-t-efm-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          
          <section>
            <h2 className="text-lg font-bold text-efm-text-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Pending Approvals ({pendingUsers.length})
            </h2>
            {pendingUsers.length === 0 ? (
              <p className="text-efm-text-500 text-sm italic bg-efm-bg-200 p-4 rounded-xl border border-efm-bg-300">No pending accounts.</p>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map(renderUserCard)}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-efm-text-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Approved Staff ({approvedUsers.length})
            </h2>
            {approvedUsers.length === 0 ? (
              <p className="text-efm-text-500 text-sm italic bg-efm-bg-200 p-4 rounded-xl border border-efm-bg-300">No approved staff.</p>
            ) : (
              <div className="space-y-3">
                {approvedUsers.map(renderUserCard)}
              </div>
            )}
          </section>

          {rejectedUsers.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-efm-text-900 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" /> Rejected Accounts ({rejectedUsers.length})
              </h2>
              <div className="space-y-3 opacity-70">
                {rejectedUsers.map(renderUserCard)}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}
