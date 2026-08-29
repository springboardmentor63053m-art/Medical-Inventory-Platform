import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import { openCommandPalette } from './CommandPalette'
import {
  Menu, Bell, User, LogOut, ChevronDown, AlertTriangle, Calendar,
  CheckCircle2, ArrowRight, Search, Settings, Shield, Cpu, Activity, X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { alertAPI } from '../api/services'
import { formatDistanceToNow } from 'date-fns'

export default function Navbar({ onMenuClick, onOpenArch }) {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [alerts,       setAlerts]       = useState([])
  const [loadingAlerts,setLoadingAlerts]= useState(false)

  const fetchActiveAlerts = async () => {
    try {
      setLoadingAlerts(true)
      const res = await alertAPI.getActive()
      setAlerts(res.data || [])
    } catch { /* silent */ }
    finally  { setLoadingAlerts(false) }
  }

  useEffect(() => {
    fetchActiveAlerts()
    const id = setInterval(fetchActiveAlerts, 30000)
    return () => clearInterval(id)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Signed out of MediStock Platform 👋')
    navigate('/login')
  }

  const handleAcknowledge = async (id, e) => {
    e.stopPropagation()
    try   { await alertAPI.acknowledge(id); toast.success('Alert acknowledged'); fetchActiveAlerts() }
    catch { toast.error('Failed to acknowledge') }
  }
  const handleResolve = async (id, e) => {
    e.stopPropagation()
    try   { await alertAPI.resolve(id); toast.success('Alert resolved ✓'); fetchActiveAlerts() }
    catch { toast.error('Failed to resolve') }
  }

  const openSearch = () => openCommandPalette()

  const canAct = hasRole(['ADMIN','PHARMACIST','INVENTORY_MANAGER'])

  const roleColor = {
    ADMIN:             'from-blue-500 to-indigo-600',
    PHARMACIST:        'from-emerald-500 to-teal-600',
    INVENTORY_MANAGER: 'from-orange-500 to-amber-600',
    STAFF:             'from-slate-500 to-slate-600',
  }[user?.role] || 'from-blue-500 to-indigo-600'

  return (
    <header className="
      h-16 flex-shrink-0 z-30 relative
      bg-white dark:bg-[#12241b]
      border-b border-[#e2ddcf] dark:border-[#32513f]
      flex items-center justify-between px-5
      transition-colors duration-300
    ">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-[4px] text-[#1c3829] dark:text-[#f8f5f0]
                     hover:text-[#c2674a] dark:hover:text-[#c2674a]
                     hover:bg-[#f8f5f0] dark:hover:bg-[#1c3829]
                     transition-all duration-200 active:scale-95"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Welcome Text */}
        <div className="hidden sm:block">
          <p className="text-[11px] text-[#5a5f57] dark:text-[#a8b4a5] font-medium leading-none">
            MediStock Platform
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#ecd4cc]/50 dark:bg-[#c2674a]/20 text-[#c2674a] dark:text-[#f8f5f0] border border-[#c2674a]/30">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Center section: Search */}
      <button
        onClick={openSearch}
        className="
          hidden md:flex items-center gap-3 px-4 py-2 rounded-[4px]
          bg-[#f8f5f0] dark:bg-[#1c3829]
          border border-[#e2ddcf] dark:border-[#32513f]
          text-[#5a5f57] dark:text-[#a8b4a5]
          hover:text-[#1c3829] dark:hover:text-white
          hover:border-[#c2674a] dark:hover:border-[#c2674a]
          hover:bg-white dark:hover:bg-[#1c3829]
          transition-all duration-200 text-sm min-w-[240px]
          group
        "
      >
        <Search className="w-4 h-4 group-hover:text-[#c2674a] transition-colors" />
        <span className="flex-1 text-left text-sm">Search medicines, SKUs...</span>
        <kbd className="kbd text-[10px]">Ctrl K</kbd>
      </button>

      {/* Right section */}
      <div className="flex items-center gap-2">



        {/* Theme Pill Toggle */}
        <ThemeToggle variant="pill" />

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(p => !p); setDropdownOpen(false); if (!notifOpen) fetchActiveAlerts() }}
            className={`
              relative p-2.5 rounded-xl transition-all duration-200 active:scale-95
              ${notifOpen
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }
            `}
            title="MediStock Alert Center"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="
                absolute -top-0.5 -right-0.5
                min-w-[16px] h-[16px]
                bg-[#c2674a]
                text-white text-[9px] font-bold rounded-full
                flex items-center justify-center px-1
                animate-pulse
              ">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)} />
              <div className="
                absolute right-0 top-full mt-2.5
                w-80 sm:w-96
                bg-white dark:bg-[#1c3829]
                rounded-[4px]
                border border-[#e2ddcf] dark:border-[#32513f]
                z-30 overflow-hidden animate-slide-up
              ">
                <div className="
                  px-4 py-3.5
                  bg-[#1c3829] dark:bg-[#12241b]
                  flex items-center justify-between
                  border-b border-white/[0.08]
                ">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-white/10 rounded-[2px] flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-white text-sm">MediStock Alerts</span>
                    {alerts.length > 0 && (
                      <span className="bg-[#c2674a] text-white text-[9px] font-bold px-2 py-0.5 rounded-[2px]">
                        {alerts.length} Active
                      </span>
                    )}
                  </div>
                  <Link
                    to="/alerts"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-white/70 hover:text-white flex items-center gap-1 font-semibold
                               hover:bg-white/10 px-2.5 py-1.5 rounded-[4px] transition-all"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-slate-50 dark:divide-slate-800/60">
                  {loadingAlerts ? (
                    <div className="p-6 text-center space-y-2">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No active alerts</p>
                      <p className="text-xs text-slate-400 mt-1">All stock levels and expiry schedules are optimal.</p>
                    </div>
                  ) : (
                    alerts.slice(0, 5).map(alert => {
                      const isLowStock = alert.alertType === 'LOW_STOCK' || alert.alertType === 'OUT_OF_STOCK'
                      const Icon = isLowStock ? AlertTriangle : Calendar
                      return (
                        <div
                          key={alert.id}
                          className="px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40
                                     transition-colors flex items-start gap-3"
                        >
                          <div className={`
                            w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                            ${isLowStock
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            }
                          `}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`text-xs font-bold ${isLowStock ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                {isLowStock ? '⚠ Low Stock' : '📅 Expiry Warning'}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {alert.createdAt
                                  ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })
                                  : ''}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {alert.message}
                            </p>
                            {canAct && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <button
                                  onClick={(e) => handleAcknowledge(alert.id, e)}
                                  className="text-[11px] font-bold text-slate-600 dark:text-slate-300
                                             bg-slate-100 dark:bg-slate-800
                                             hover:bg-slate-200 dark:hover:bg-slate-700
                                             px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  Ack
                                </button>
                                <button
                                  onClick={(e) => handleResolve(alert.id, e)}
                                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400
                                             bg-emerald-50 dark:bg-emerald-950/40
                                             hover:bg-emerald-100 dark:hover:bg-emerald-900/50
                                             px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  ✓ Resolve
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    to="/alerts"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                  >
                    Open Alert Management ({alerts.length} active) →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDropdownOpen(p => !p); setNotifOpen(false) }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-[4px] hover:bg-[#f8f5f0] dark:hover:bg-[#1c3829] transition-all duration-200 active:scale-95"
          >
            <div className="w-8 h-8 rounded-[4px] bg-[#c2674a] flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-[#1c3829] dark:text-[#f8f5f0] leading-none">{user?.username}</p>
              <p className="text-[11px] text-[#5a5f57] dark:text-[#a8b4a5] leading-tight mt-0.5 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#5a5f57] dark:text-[#a8b4a5] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2.5 w-56 bg-white dark:bg-[#1c3829] rounded-[4px] border border-[#e2ddcf] dark:border-[#32513f] z-30 py-1.5 animate-slide-up overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e2ddcf] dark:border-[#32513f]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[4px] bg-[#c2674a] flex items-center justify-center text-white font-bold text-sm">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1c3829] dark:text-[#f8f5f0]">{user?.username}</p>
                      <p className="text-xs text-[#5a5f57] dark:text-[#a8b4a5] capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1c3829] dark:text-[#f8f5f0] hover:bg-[#f8f5f0] dark:hover:bg-[#12241b] transition-colors">
                    <User className="w-4 h-4 text-[#5a5f57]" /> My Profile
                  </Link>
                  <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1c3829] dark:text-[#f8f5f0] hover:bg-[#f8f5f0] dark:hover:bg-[#12241b] transition-colors">
                    <Settings className="w-4 h-4 text-[#5a5f57]" /> Settings
                  </Link>
                </div>

                <div className="border-t border-[#e2ddcf] dark:border-[#32513f] py-1">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
