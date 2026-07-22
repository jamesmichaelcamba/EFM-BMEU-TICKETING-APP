// ============================================================
// App-wide constants — wards, categories, enums
// ============================================================

import { Priority, TicketStatus, TicketType } from './types'

// ----------------------------------------------------------
// ZCMC Hospital Wards / Departments (74 entries)
// ----------------------------------------------------------
export const ZCMC_DEPARTMENTS: string[] = [
  'ANESTHESIA DEPT',
  'BEMONC',
  'BRAIN AND SPINE',
  'BUCAS CENTER LAB',
  'BUCAS CENTER OPD',
  'CATHLAB',
  'CSS',
  'CVCU',
  'DELIVERY ROOM',
  'DENTAL CLINIC',
  'EMERGENCY ROOM',
  'ENT HNS',
  'ER POCT',
  'EREID',
  'FAMED',
  'FAMILY PLANNING',
  'GERIATRIC CARE',
  'GOCU',
  'HEALTH AND WELLNESS CENTER',
  'HEMS',
  'HUMAN MILK BANK',
  'IHOMP',
  'IPCC',
  'LAB. BLOOD BANK',
  'LAB. CLINICAL BACTERIOLOGY',
  'LAB. CLINICAL CHEMISTRY',
  'LAB. CLINICAL MICROSCOPY',
  'LAB. DRUG TESTING',
  'LAB. HEMATOLOGY',
  'LAB. HISTOPATHOLOGY',
  'LAB. RECEPTION AREA',
  'LAB. SEROLOGY',
  'LAB. STOCK ROOM',
  'LAB. TB CULTURE',
  'LAB. WATER ANALYSIS',
  'LAB. WATER BACTERIOLOGY',
  'LABORATORY',
  'MICU',
  'MMS',
  'MOLECULAR LABORATORY',
  'NDS',
  'NICU',
  'NSO',
  'NUCLEAR MEDICINE',
  'OB OR',
  'OMCC',
  'OPD CHEMOTHERAPY',
  'OPD MAIN',
  'OPD PHARMACY',
  'OPERATING ROOM',
  'PACU',
  'PHARMACY MAIN',
  'PHU',
  'PICU',
  'PULMONARY UNIT',
  'RADIATION ONCOLOGY',
  'RADIOLOGY',
  'RCWM',
  'REHAB',
  'RENAL WARD',
  'SICU',
  'TB DOTS',
  'TCIM',
  'TOXICOLOGY',
  'TREATMENT HUB',
  'TZU CHI EYE CENTER',
  'VPDRL',
  'WARD 1',
  'WARD 2&3',
  'WARD 4',
  'WARD 5',
  'WARD 6',
  'WARD 7',
  'WARD 8',
  'WARD 9',
  'WCPU',
]

// ----------------------------------------------------------
// Ticket types
// ----------------------------------------------------------
export const TICKET_TYPES: { value: TicketType; label: string; description: string }[] = [
  { value: 'CM', label: 'CM — Corrective Maintenance', description: 'Equipment failure or malfunction requiring repair' },
  { value: 'PM', label: 'PM — Preventive Maintenance', description: 'Scheduled servicing and inspection' },
  { value: 'Other', label: 'Other', description: 'General concerns, notes, or requests' },
]

// ----------------------------------------------------------
// Priority levels
// ----------------------------------------------------------
export const PRIORITY_LEVELS: { value: Priority; label: string; color: string }[] = [
  { value: 'Low', label: 'Low', color: 'text-emerald-400' },
  { value: 'Medium', label: 'Medium', color: 'text-blue-400' },
  { value: 'High', label: 'High', color: 'text-amber-400' },
  { value: 'Critical', label: 'Critical', color: 'text-red-400' },
]

// ----------------------------------------------------------
// Ticket statuses
// ----------------------------------------------------------
export const TICKET_STATUSES: { value: TicketStatus; label: string }[] = [
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Pending Parts', label: 'Pending Parts' },
  { value: 'For Monitoring', label: 'For Monitoring' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
]

// ----------------------------------------------------------
// Default (seed) categories — matches Supabase seed data
// ----------------------------------------------------------
export const DEFAULT_CATEGORIES: string[] = [
  'Equipment Failure / Malfunction',
  'Missing / Unavailable Spare Parts',
  'Equipment Sent for External Repair',
  'Calibration Issues',
  'Safety / Hazard Concerns',
  'Administrative / Paperwork Delays',
  'Intern / Staff-Related Concerns',
  'Ward / Department Requests',
  'Personal Work Notes / Reminders',
]

// ----------------------------------------------------------
// Status transition map (what statuses can follow each status)
// ----------------------------------------------------------
export const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  'Open': ['In Progress', 'Closed'],
  'In Progress': ['Pending Parts', 'For Monitoring', 'Resolved'],
  'Pending Parts': ['In Progress', 'Resolved', 'Closed'],
  'For Monitoring': ['In Progress', 'Resolved', 'Closed'],
  'Resolved': ['Closed', 'Open'],
  'Closed': ['Open'],
}
