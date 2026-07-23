// ============================================================
// TypeScript Types for BMEU JMC Ticketing App
// ============================================================

export type TicketType = 'CM' | 'PM' | 'Other'
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'
export type TicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Pending Parts'
  | 'For Monitoring'
  | 'Resolved'
  | 'Closed'
export type UserRole = 'Technician' | 'Admin'
export type AccountStatus = 'Pending' | 'Approved' | 'Rejected'

export interface Profile {
  id: string
  work_id: string
  full_name: string
  role: UserRole
  status: AccountStatus
  created_at: string
}

export interface Category {
  id: string
  name: string
  is_custom: boolean
  created_at: string
}

export interface Equipment {
  name: string
  brand: string
  model: string
  serial: string
}

export interface Ticket {
  id: string
  ticket_number: string
  type: TicketType
  title: string
  description: string | null
  category_id: string | null
  category?: Category
  priority: Priority
  status: TicketStatus
  department: string | null
  equipments: Equipment[]
  reported_by: string | null
  reporter?: Profile
  assigned_to: string | null
  assignee?: Profile
  due_date: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  resolved_by: string | null
  resolver?: Profile
  duplicate_of: string | null
  duplicate_ticket?: { ticket_number: string }
}

export interface Comment {
  id: string
  ticket_id: string
  author_id: string
  author?: Profile
  content: string
  created_at: string
}

export interface DashboardStats {
  total: number
  open: number
  inProgress: number
  pendingParts: number
  forMonitoring: number
  resolved: number
  closed: number
  critical: number
  resolvedToday: number
}

export interface TicketFilters {
  search: string
  status: TicketStatus | ''
  priority: Priority | ''
  type: TicketType | ''
  department: string
  category_id: string
}
