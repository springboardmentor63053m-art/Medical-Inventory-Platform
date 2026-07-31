import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Pill, Package, Truck, ShoppingCart,
  Receipt, Users, Bell, BarChart2, X, Activity,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard, roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'] },
  { to: '/medicines',  label: 'Medicines',    icon: Pill,            roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER'] },
  { to: '/inventory',  label: 'Inventory',    icon: Package,         roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'] },
  { to: '/suppliers',  label: 'Suppliers',    icon: Truck,           roles: ['ADMIN','INVENTORY_MANAGER'] },
  { to: '/purchases',  label: 'Purchases',    icon: ShoppingCart,    roles: ['ADMIN','INVENTORY_MANAGER'] },
  { to: '/sales',      label: 'Sales',        icon: Receipt,         roles: ['ADMIN','PHARMACIST'] },
  { to: '/employees',  label: 'Employees',    icon: Users,           roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'] },
  { to: '/alerts',     label: 'Alerts',       icon: Bell,            roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'] },
  { to: '/reports',    label: 'Reports',      icon: BarChart2,       roles: ['ADMIN','INVENTORY_MANAGER'] },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()

  const visible = navItems.filter(item =>
    item.roles.includes(user?.role)
  )

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        flex flex-col
        w-64 min-h-screen
        bg-gradient-to-b from-dark-900 to-dark-800
        border-r border-white/5
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${!open ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-64'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">MedInventory</p>
              <p className="text-slate-400 text-xs">Pro Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-medical-teal
                            flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.username}</p>
              <p className="text-slate-400 text-xs truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
          {visible.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-slate-500 text-xs text-center">v1.0.0 · B.Tech Project</p>
        </div>
      </aside>
    </>
  )
}
