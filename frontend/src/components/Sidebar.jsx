import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutGrid, Pill, Package, Truck, ShoppingCart,
  Receipt, Users, Bell, BarChart2, X, Settings, TrendingUp,
  FileText, UserCheck, Stethoscope, Sparkles, History
} from 'lucide-react'

const navSections = [
  {
    title: 'CORE',
    items: [
      { to: '/dashboard',      label: 'Dashboard',       icon: LayoutGrid,    roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF','SUPPLIER'] },
      { to: '/medicines',      label: 'Medicines',       icon: Pill,          roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','SUPPLIER'] },
      { to: '/inventory',      label: 'Inventory',       icon: Package,       roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF','SUPPLIER'] },
      { to: '/stock-tracking', label: 'Stock Tracking',  icon: TrendingUp,    roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF','SUPPLIER'] },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { to: '/prescriptions',  label: 'Prescriptions',   icon: FileText,      roles: ['ADMIN','PHARMACIST','STAFF'] },
      { to: '/patients',       label: 'Patients',        icon: UserCheck,     roles: ['ADMIN','PHARMACIST','STAFF'] },
      { to: '/doctors',        label: 'Doctors',         icon: Stethoscope,   roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER'] },
      { to: '/suppliers',      label: 'Suppliers',       icon: Truck,         roles: ['ADMIN','INVENTORY_MANAGER','SUPPLIER'] },
      { to: '/purchases',      label: 'Orders',          icon: ShoppingCart,  roles: ['ADMIN','INVENTORY_MANAGER','SUPPLIER'] },
      { to: '/sales',          label: 'Sales & POS',     icon: Receipt,       roles: ['ADMIN','PHARMACIST'] },
      { to: '/employees',      label: 'Employees',       icon: Users,         roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'] },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { to: '/ai-insights',    label: 'AI Insights',     icon: Sparkles,      roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER'] },
      { to: '/alerts',         label: 'Alerts',          icon: Bell,          roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF','SUPPLIER'] },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { to: '/reports',        label: 'Reports',         icon: BarChart2,     roles: ['ADMIN','INVENTORY_MANAGER'] },
      { to: '/audit-logs',     label: 'Audit Logs',      icon: History,       roles: ['ADMIN'] },
      { to: '/settings',       label: 'Settings',        icon: Settings,      roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF','SUPPLIER'] },
    ]
  }
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const roleLabel = user?.role ? user.role.replace('_', ' ').toLowerCase() : 'Admin'

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          flex flex-col w-60 min-h-screen
          bg-white dark:bg-[#0A0F1A] border-r border-slate-200 dark:border-[#1A2233]
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${!open ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-60'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#1A2233]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF5500] flex items-center justify-center text-white shadow-md shadow-orange-500/25 shrink-0">
              <Pill className="w-4 h-4 text-white -rotate-45" />
            </div>
            <div className="flex items-center">
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                Med<span className="font-medium text-slate-600 dark:text-slate-100">Inventory</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-3.5 py-3 border-b border-slate-200 dark:border-[#1A2233]">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#1C2536]">
            <div className="w-7 h-7 rounded-lg bg-[#FF5500] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
              {user?.username?.[0]?.toUpperCase() || 'P'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-900 dark:text-white text-xs font-semibold truncate leading-tight">
                {user?.username || 'Pharmacy Manager'}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] truncate capitalize leading-tight">
                {roleLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto scrollbar-thin">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(i => !user?.role || i.roles.includes(user.role))
            if (visibleItems.length === 0) return null

            return (
              <div key={section.title} className="space-y-1">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-mono font-bold uppercase tracking-[0.14em] px-3 mb-1">
                  {section.title}
                </p>

                {visibleItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className="block"
                  >
                    {({ isActive: navActive }) => (
                      <span className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium
                        transition-all duration-200 cursor-pointer select-none
                        ${navActive
                          ? 'bg-[#FF5500] text-white shadow-md shadow-orange-500/20 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                        }
                      `}>
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${navActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span className="flex-1 truncate">{label}</span>
                        {navActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                        )}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
