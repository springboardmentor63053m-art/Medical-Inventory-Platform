import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { openCommandPalette } from './CommandPalette'
import {
  Menu, Bell, Search, User, LogOut, Settings, CheckCircle2,
  AlertTriangle, Calendar, ArrowRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { alertAPI } from '../api/services'
import { formatDistanceToNow } from 'date-fns'

import ThemeToggle from './ThemeToggle'

export default function Navbar({ onMenuClick }) {
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
    toast.success('Signed out 👋')
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
  const canAct = hasRole ? hasRole(['ADMIN','PHARMACIST','INVENTORY_MANAGER']) : true

  const userInitials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'PM'

  return (
    <header className="
      h-14 flex-shrink-0 z-30 relative
      bg-white dark:bg-[#0A0F1A]
      border-b border-slate-200 dark:border-[#1A2233]
      flex items-center justify-between px-5
      transition-all duration-300
    ">
      {/* Left / Search Section */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Search matching screenshot */}
        <button
          onClick={openSearch}
          className="
            flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-lg
            bg-slate-100 dark:bg-[#111622]
            border border-slate-200 dark:border-[#1E2838]
            text-xs text-slate-500 dark:text-slate-400
            hover:border-slate-400 dark:hover:border-slate-500
            hover:text-slate-800 dark:hover:text-slate-300
            transition-all text-left shadow-inner
          "
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="flex-1 truncate text-xs">
            Search medicines, batches, suppliers
          </span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 ml-4">
        {/* Light / Dark Mode Toggle */}
        <ThemeToggle variant="pill" />

        {/* Notification Bell Box with Live Feature */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(p => !p); setDropdownOpen(false); if (!notifOpen) fetchActiveAlerts() }}
            className="
              w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#141A26]
              border border-slate-200 dark:border-[#202B3C]
              flex items-center justify-center
              text-slate-600 dark:text-slate-400
              hover:text-slate-900 dark:hover:text-white
              transition-colors relative active:scale-95
            "
            title="Alert Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="
              absolute top-1.5 right-1.5 w-2 h-2
              bg-red-500 rounded-full
              ring-2 ring-white dark:ring-[#0A0F1A]
            " />
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)} />
              <div className="
                absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#101622] rounded-xl
                shadow-2xl border border-[#1C2536] z-30 p-3 text-xs animate-slide-up overflow-hidden
              ">
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#1C2536]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white uppercase text-[11px]">System Alerts</span>
                    <span className="bg-[#FF5500] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {alerts.length} Active
                    </span>
                  </div>
                  <Link
                    to="/alerts"
                    onClick={() => setNotifOpen(false)}
                    className="text-[#FF5500] hover:underline text-[11px] font-medium"
                  >
                    View all →
                  </Link>
                </div>

                <div className="max-h-72 overflow-y-auto scrollbar-thin divide-y divide-[#1C2536]">
                  {loadingAlerts ? (
                    <div className="p-4 text-center text-slate-400">Loading alerts...</div>
                  ) : alerts.length === 0 ? (
                    <div className="p-6 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="text-slate-300 font-semibold">No active alerts</p>
                      <p className="text-slate-500 text-[11px]">Stock levels and batches are normal</p>
                    </div>
                  ) : (
                    alerts.slice(0, 5).map(alert => {
                      const isLowStock = alert.alertType === 'LOW_STOCK' || alert.alertType === 'OUT_OF_STOCK'
                      return (
                        <div key={alert.id} className="py-2.5 hover:bg-white/[0.02] px-1 rounded transition-colors">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`font-mono font-bold text-[10px] uppercase ${isLowStock ? 'text-red-400' : 'text-amber-400'}`}>
                              {isLowStock ? '⚠ Low Stock' : '📅 Expiry Warning'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : ''}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">{alert.message}</p>
                          {canAct && (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={(e) => handleAcknowledge(alert.id, e)}
                                className="text-[10px] font-mono font-bold text-slate-300 bg-[#17202E] hover:bg-[#202D40] px-2 py-0.5 rounded border border-[#233145] transition-colors"
                              >
                                Ack
                              </button>
                              <button
                                onClick={(e) => handleResolve(alert.id, e)}
                                className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-500/30 transition-colors"
                              >
                                ✓ Resolve
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Box: PM */}
        <div className="relative">
          <button
            onClick={() => { setDropdownOpen(p => !p); setNotifOpen(false) }}
            className="
              h-8 px-2.5 rounded-lg bg-[#141A26] border border-[#202B3C]
              flex items-center justify-center text-slate-200 font-bold text-xs font-mono
              hover:bg-[#1C2436] transition-colors active:scale-95
            "
            title="User Profile Menu"
          >
            {userInitials}
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
              <div className="
                absolute right-0 top-full mt-2 w-48 bg-[#101622] rounded-xl
                shadow-2xl border border-[#1C2536] z-30 py-1 text-xs animate-slide-up
              ">
                <div className="px-3 py-2 border-b border-[#1C2536]">
                  <p className="font-bold text-white truncate">{user?.username || 'Pharmacy Manager'}</p>
                  <p className="text-slate-400 text-[10px] truncate capitalize">{user?.role?.replace('_', ' ').toLowerCase() || 'Admin'}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-white/[0.05] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" /> My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-white/[0.05] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings
                </Link>
                <div className="border-t border-[#1C2536] mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
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
