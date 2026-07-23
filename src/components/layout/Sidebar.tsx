import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar() {
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/tickets', icon: Ticket, label: 'All Tickets', exact: false },
    { path: '/tickets/new', icon: PlusCircle, label: 'New Ticket', exact: true },
    ...(profile?.role === 'Admin' ? [{ path: '/staff', icon: Users, label: 'Staff Management', exact: true }] : [])
  ]

  function isActive(path: string, exact: boolean) {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path) && path !== '/'
  }

  return (
    <aside
      className={`relative flex flex-col h-screen bg-white border-r border-efm-bg-400 transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-efm-bg-200 border border-efm-bg-500 rounded-full flex items-center justify-center text-efm-text-500 hover:text-efm-primary-500 hover:border-efm-primary-500/50 transition-all duration-200 shadow-lg"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-efm-bg-400 overflow-hidden">
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src="/efm-logo.webp" alt="EFM Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
          <img src="/bme-logo.png" alt="BMEU Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <p className="text-[13px] font-bold text-[#064e3b] uppercase leading-none">
              EFM-BMEU
            </p>
            <p className="text-[11px] font-semibold text-[#0284c7] uppercase tracking-wide leading-tight mt-1 truncate">
              TICKETING APP
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-hidden">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-efm-text-400 uppercase tracking-widest px-3 mb-2">
            Menu
          </p>
        )}
        {navItems.map(({ path, icon: Icon, label, exact }) => {
          const active = isActive(path, exact)
          return (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-efm-primary-500/10 text-efm-primary-500 border border-efm-primary-500/20'
                  : 'text-efm-text-500 hover:bg-efm-bg-200 hover:text-efm-text-900 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${ active ? 'text-efm-primary-500' : '' }`} />
              {!collapsed && (
                <span className="text-sm font-medium flex-1 truncate">{label}</span>
              )}
              {!collapsed && active && (
                <span className="w-1.5 h-1.5 rounded-full bg-efm-primary-500 flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="p-3 border-t border-efm-bg-400 space-y-2">
        {!collapsed && profile && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-efm-bg-200 border border-efm-bg-500">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-efm-primary-500/20 to-blue-500/20 border border-efm-primary-500/30 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-efm-primary-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-efm-text-900 truncate leading-tight">
                {profile.full_name}
              </p>
              <p className="text-xs text-efm-primary-500 leading-tight">ID: {profile.work_id}</p>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-efm-text-500 hover:bg-red-50 hover:text-red-400 hover:border-red-200 border border-transparent transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
