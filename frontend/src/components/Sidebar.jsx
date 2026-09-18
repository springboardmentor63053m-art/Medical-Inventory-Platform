import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, Pill, Package, Truck, ShoppingCart,
  Receipt, Users, Bell, BarChart2, X, Activity, Settings, Zap, Shield, Cpu, TrendingUp,
  FileText, UserCheck, Stethoscope, Sparkles, History, Bot
} from 'lucide-react'

const navSections = [
  {
    title: 'Core',
    items: [
      { to: '/dashboard',      label: 'Dashboard',       icon: LayoutDashboard, roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF','SUPPLIER'], color: 'from-blue-500 to-indigo-500' },
      { to: '/medicines',      label: 'Medicines',       icon: Pill,            roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','SUPPLIER'],          color: 'from-emerald-500 to-teal-500' },
      { to: '/inventory',      label: 'Inventory',       icon: Package,         roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF','SUPPLIER'], color: 'from-violet-500 to-purple-500' },
      { to: '/stock-tracking', label: 'Stock Tracking',  icon: TrendingUp,      roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF','SUPPLIER'], color: 'from-cyan-500 to-blue-500' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/prescriptions',  label: 'Prescriptions',   icon: FileText,        roles: ['ADMIN','PHARMACIST','STAFF'],                                 color: 'from-rose-500 to-red-500' },
      { to: '/patients',       label: 'Patients',        icon: UserCheck,       roles: ['ADMIN','PHARMACIST','STAFF'],                                 color: 'from-teal-500 to-emerald-500' },
      { to: '/doctors',        label: 'Doctors',         icon: Stethoscope,     roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER'],                     color: 'from-sky-500 to-indigo-500' },
      { to: '/suppliers',      label: 'Suppliers',       icon: Truck,           roles: ['ADMIN','INVENTORY_MANAGER','SUPPLIER'],                      color: 'from-orange-500 to-amber-500' },
      { to: '/purchases',      label: 'Purchases',       icon: ShoppingCart,    roles: ['ADMIN','INVENTORY_MANAGER','SUPPLIER'],                      color: 'from-pink-500 to-rose-500' },
      { to: '/sales',          label: 'Sales & POS',     icon: Receipt,         roles: ['ADMIN','PHARMACIST'],                                         color: 'from-teal-500 to-cyan-500' },
      { to: '/employees',      label: 'Employees',       icon: Users,           roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'],             color: 'from-indigo-500 to-blue-500' },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { to: '/ai-insights',    label: 'AI Insights',     icon: Sparkles,        roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER'],                     color: 'from-amber-500 to-orange-500' },
      { to: '/alerts',         label: 'Alerts',          icon: Bell,            roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF','SUPPLIER'], color: 'from-red-500 to-rose-500' },
    ]
  },
  {
    title: 'Reporting',
    items: [
      { to: '/reports',        label: 'Reports',         icon: BarChart2,       roles: ['ADMIN','INVENTORY_MANAGER'],                                  color: 'from-purple-500 to-pink-500' },
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/audit-logs',     label: 'Audit Logs',      icon: History,         roles: ['ADMIN'],                                                      color: 'from-slate-400 to-slate-600' },
      { to: '/settings',       label: 'Settings',        icon: Settings,        roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF','SUPPLIER'], color: 'from-slate-500 to-slate-600' },
    ]
  }
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const location = useLocation()

  const roleColor = {
    ADMIN:              'from-blue-400 to-indigo-500',
    PHARMACIST:         'from-emerald-400 to-teal-500',
    INVENTORY_MANAGER:  'from-orange-400 to-amber-500',
    STAFF:              'from-slate-400 to-slate-500',
    SUPPLIER:           'from-purple-400 to-pink-500',
  }[user?.role] || 'from-purple-400 to-pink-500'

  const roleLabel = user?.role?.replace('_', ' ').toLowerCase()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          flex flex-col w-64 min-h-screen
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${!open ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-64'}
        `}
        style={isDark ? {
          background: 'linear-gradient(170deg, #0b1329 0%, #0f2042 45%, #081226 100%)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.5)',
        } : {
          background: 'linear-gradient(170deg, #ffffff 0%, #f8fafc 45%, #f1f5f9 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
          borderRight: '1px solid #e2e8f0',
        }}
      >
        {/* Decorative orb blurs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 right-4 w-32 h-32 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo Header */}
        <div className={`relative flex items-center justify-between px-5 py-5 border-b ${isDark ? 'border-white/[0.07]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-500 rounded-2xl
                              flex items-center justify-center shadow-lg shadow-blue-500/30
                              ring-1 ring-white/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/40 to-teal-500/20
                              rounded-2xl blur-md -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className={`font-extrabold text-base leading-tight tracking-wide font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  MedStock
                </p>
                <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-[9px] tracking-wider uppercase shadow-xs ring-1 ring-white/20">
                  AI
                </span>
              </div>
              <p className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-blue-400/80' : 'text-blue-600'}`}>Pharmacy Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-500 hover:text-white p-1.5 rounded-xl hover:bg-white/10
                       transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Badge Card */}
        <div className={`px-4 py-3.5 border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`}>
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl backdrop-blur-sm ${
            isDark
              ? 'bg-white/[0.05] border border-white/[0.08]'
              : 'bg-slate-100 border border-slate-200'
          }`}>
            <div className="relative flex-shrink-0">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleColor}
                              flex items-center justify-center text-white font-bold text-xs
                              shadow-md`}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 ${isDark ? 'border-[#0b1329]' : 'border-white'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.username}</p>
              <p className="text-slate-400 text-[10px] truncate capitalize font-medium">{roleLabel}</p>
            </div>
            <Zap className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          </div>
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-thin">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(i => i.roles.includes(user?.role))
            if (visibleItems.length === 0) return null

            return (
              <div key={section.title} className="space-y-1">
                <p className={`text-[10px] font-bold uppercase tracking-[0.14em] px-3 mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {section.title}
                </p>

                {visibleItems.map(({ to, label, icon: Icon, color }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className="block"
                  >
                    {({ isActive: navActive }) => (
                      <span className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium
                        transition-all duration-200 cursor-pointer relative overflow-hidden
                        ${navActive
                          ? isDark
                            ? 'text-white bg-white/10 border border-white/[0.1] shadow-inner'
                            : 'text-blue-700 bg-blue-50 border border-blue-200 shadow-sm'
                          : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }
                      `}>
                        {navActive && (
                          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5
                                            rounded-r-full bg-gradient-to-b ${color}`} />
                        )}

                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
                                          transition-all duration-200
                                          ${navActive
                                            ? `bg-gradient-to-br ${color} shadow-md text-white`
                                            : isDark ? 'bg-white/5' : 'bg-slate-200/60'
                                          }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="flex-1 truncate">{label}</span>
                        {navActive && (
                          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${color}`} />
                        )}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        {/* Footer Branding */}
        <div className={`px-4 py-3.5 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>MedStock AI v3.0</p>
            </div>
            <span className="text-[10px] text-blue-400 font-mono font-black tracking-wider">AI Active</span>
          </div>
        </div>
      </aside>
    </>
  )
}
