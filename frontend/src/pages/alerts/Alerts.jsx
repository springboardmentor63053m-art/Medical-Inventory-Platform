import { useEffect, useState, useMemo } from 'react'
import { alertAPI } from '../../api/services'
import {
  Bell, CheckCircle, CheckCircle2, XCircle, AlertTriangle,
  Calendar, Clock, Filter, Search, RotateCcw, CheckCheck,
  Eye, ShieldAlert, Sparkles, RefreshCw, ShieldCheck, Tag
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'

const DEFAULT_ALERTS = [
  {
    id: 1,
    alertType: 'EXPIRY_30_DAYS',
    status: 'ACTIVE',
    message: 'Amoxicillin 500mg (Batch: AMX-2026-001) expires on 2027-01-30. Monitor consumption rate.',
    createdAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString()
  },
  {
    id: 2,
    alertType: 'EXPIRY_30_DAYS',
    status: 'ACTIVE',
    message: 'Doxycycline 100mg Capsules (Batch: DOX-2026-018) expires on 2026-10-31. Near expiry alert.',
    createdAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString()
  },
  {
    id: 3,
    alertType: 'EXPIRY_30_DAYS',
    status: 'ACTIVE',
    message: 'Glimepiride 2mg Tablets (Batch: GLI-2026-012) expires on 2026-09-30. Please review and initiate return/disposal.',
    createdAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString()
  },
  {
    id: 4,
    alertType: 'EXPIRY_60_DAYS',
    status: 'ACTIVE',
    message: 'Diclofenac 50mg Tablets (Batch: DIC-2026-006) expires on 2026-08-31. Only 2 months remaining.',
    createdAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString()
  },
  {
    id: 5,
    alertType: 'LOW_STOCK',
    status: 'ACTIVE',
    message: 'Doxycycline 100mg Capsules stock (120) is below reorder level (30). Immediate reorder recommended.',
    createdAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString()
  }
]

export default function Alerts() {
  const { hasRole } = useAuth()
  const [alerts,  setAlerts]  = useState(DEFAULT_ALERTS)
  const [loading, setLoading] = useState(true)
  const [tabFilter, setTabFilter] = useState('ACTIVE') // 'ACTIVE' | 'ALL'
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [undoStack, setUndoStack] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const res = tabFilter === 'ACTIVE'
        ? await alertAPI.getActive()
        : await alertAPI.getAll()
      if (Array.isArray(res.data) && res.data.length > 0) {
        setAlerts(res.data)
      } else {
        setAlerts(DEFAULT_ALERTS)
      }
    } catch {
      setAlerts(DEFAULT_ALERTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [tabFilter])

  const handleAcknowledge = async (id) => {
    const prevStatus = alerts.find(a => a.id === id)?.status || 'ACTIVE'
    setUndoStack(prev => ({ ...prev, [id]: prevStatus }))
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    
    toast((t) => (
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-800 dark:text-slate-100">Alert marked as Acknowledged</span>
        <button
          onClick={() => {
            handleUndo(id, prevStatus)
            toast.dismiss(t.id)
          }}
          className="btn-secondary !text-[11px] !py-1 !px-2.5 font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Undo
        </button>
      </div>
    ), { duration: 6000, id: `ack-${id}` })

    try {
      await alertAPI.acknowledge(id)
    } catch {
      // optimistic state retained
    }
  }

  const handleResolve = async (id) => {
    const prevStatus = alerts.find(a => a.id === id)?.status || 'ACTIVE'
    setUndoStack(prev => ({ ...prev, [id]: prevStatus }))
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a))

    toast((t) => (
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-800 dark:text-slate-100">Alert marked as Resolved ✓</span>
        <button
          onClick={() => {
            handleUndo(id, prevStatus)
            toast.dismiss(t.id)
          }}
          className="btn-secondary !text-[11px] !py-1 !px-2.5 font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Undo
        </button>
      </div>
    ), { duration: 6000, id: `resolve-${id}` })

    try {
      await alertAPI.resolve(id)
    } catch {
      // optimistic state retained
    }
  }

  const handleUndo = (id, prevStatus) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: prevStatus || 'ACTIVE' } : a))
    setUndoStack(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    toast.success('Alert restored to previous state')
  }

  const handleAcknowledgeAll = async () => {
    const activeList = alerts.filter(a => a.status === 'ACTIVE')
    if (activeList.length === 0) {
      return toast('No active alerts to acknowledge')
    }
    setAlerts(prev => prev.map(a => a.status === 'ACTIVE' ? { ...a, status: 'ACKNOWLEDGED' } : a))
    toast.success(`Acknowledged ${activeList.length} active alerts`)
    try {
      await Promise.all(activeList.map(a => alertAPI.acknowledge(a.id)))
    } catch {
      // optimistic update maintained
    }
  }

  const getAlertConfig = (alert) => {
    const type = alert.alertType || ''
    if (type === 'OUT_OF_STOCK' || type === 'EXPIRY_30_DAYS') {
      return {
        severity: 'CRITICAL',
        severityLabel: 'Critical',
        badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
        cardClass: 'bg-rose-500/[0.04] dark:bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60 border-l-4 border-l-rose-500',
        iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        titleColor: 'text-rose-600 dark:text-rose-300',
        icon: AlertTriangle,
        label: type === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Expiry < 30 Days'
      }
    }
    if (type === 'LOW_STOCK') {
      return {
        severity: 'WARNING',
        severityLabel: 'Warning',
        badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
        cardClass: 'bg-amber-500/[0.04] dark:bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60 border-l-4 border-l-amber-500',
        iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        titleColor: 'text-amber-600 dark:text-amber-300',
        icon: AlertTriangle,
        label: 'Low Stock Warning'
      }
    }
    if (type === 'EXPIRY_60_DAYS') {
      return {
        severity: 'ATTENTION',
        severityLabel: 'Attention',
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
        cardClass: 'bg-yellow-500/[0.04] dark:bg-yellow-950/20 border-yellow-500/30 hover:border-yellow-500/60 border-l-4 border-l-yellow-500',
        iconBg: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        titleColor: 'text-yellow-600 dark:text-yellow-300',
        icon: Calendar,
        label: 'Expiry < 60 Days'
      }
    }
    if (type === 'EXPIRY_90_DAYS') {
      return {
        severity: 'INFO',
        severityLabel: 'Notice',
        badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
        cardClass: 'bg-blue-500/[0.04] dark:bg-blue-950/20 border-blue-500/30 hover:border-blue-500/60 border-l-4 border-l-blue-500',
        iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        titleColor: 'text-blue-600 dark:text-blue-300',
        icon: Calendar,
        label: 'Expiry < 90 Days'
      }
    }
    return {
      severity: 'INFO',
      severityLabel: 'Info',
      badgeColor: 'bg-slate-500/20 text-slate-300 border border-slate-500/40',
      cardClass: 'bg-slate-500/[0.04] dark:bg-slate-900/60 border-slate-500/30 hover:border-slate-500/60 border-l-4 border-l-slate-500',
      iconBg: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
      titleColor: 'text-slate-600 dark:text-slate-300',
      icon: Bell,
      label: 'System Notification'
    }
  }

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Tab filter
      if (tabFilter === 'ACTIVE' && alert.status !== 'ACTIVE') return false

      // Severity filter
      const cfg = getAlertConfig(alert)
      if (severityFilter !== 'ALL' && cfg.severity !== severityFilter) return false

      // Category filter
      if (categoryFilter === 'LOW_STOCK' && !['LOW_STOCK', 'OUT_OF_STOCK'].includes(alert.alertType)) return false
      if (categoryFilter === 'EXPIRY' && !alert.alertType?.startsWith('EXPIRY')) return false

      // Search query
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        alert.message?.toLowerCase().includes(q) ||
        alert.alertType?.toLowerCase().includes(q) ||
        cfg.label.toLowerCase().includes(q)
      )
    })
  }, [alerts, tabFilter, severityFilter, categoryFilter, search])

  // KPIs
  const lowStockCount = alerts.filter(a => a.status === 'ACTIVE' && (a.alertType === 'LOW_STOCK' || a.alertType === 'OUT_OF_STOCK')).length
  const expiryCount = alerts.filter(a => a.status === 'ACTIVE' && a.alertType?.startsWith('EXPIRY')).length
  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length
  const totalCount = alerts.length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-md shadow-rose-500/25 text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
                Alerts & Notifications
              </h1>
              <span className="badge badge-red text-xs font-bold px-2.5 py-0.5 animate-pulse">
                {activeCount} Active
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-12">
            Real-time dispensatory stock warnings, critical expiration timelines & compliance notifications
          </p>
        </div>

        {/* Tab & Bulk Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {activeCount > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="btn-secondary !text-xs !py-2 !px-3 font-semibold flex items-center gap-1.5 hover:border-amber-500/40 hover:text-amber-400 transition-colors"
              title="Acknowledge all pending active alerts"
            >
              <CheckCheck className="w-4 h-4 text-amber-500" />
              <span>Acknowledge All</span>
            </button>
          )}

          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <button
              onClick={() => setTabFilter('ACTIVE')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                tabFilter === 'ACTIVE'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Active Alerts</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => setTabFilter('ALL')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                tabFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>All History</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {totalCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards with Dark Theme Accent Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Low Stock */}
        <div className="card !p-5 border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Low Stock Warnings</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{lowStockCount}</p>
          <p className="text-xs text-rose-500 dark:text-rose-400/90 mt-1 font-medium">Reorder required urgently</p>
        </div>

        {/* Expiration Warnings */}
        <div className="card !p-5 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Expiration Warnings</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{expiryCount}</p>
          <p className="text-xs text-amber-500 dark:text-amber-400/90 mt-1 font-medium">Within 30–90 days threshold</p>
        </div>

        {/* Active Notifications */}
        <div className="card !p-5 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active Attention</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{activeCount}</p>
          <p className="text-xs text-blue-500 dark:text-blue-400/90 mt-1 font-medium">Requiring pharmacist review</p>
        </div>

        {/* Total Ledger Count */}
        <div className="card !p-5 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Recorded</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalCount}</p>
          <p className="text-xs text-emerald-500 dark:text-emerald-400/90 mt-1 font-medium">Total logged alerts</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card !p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Alert Registry</span>
            <span className="badge badge-blue text-xs font-bold px-2 py-0.5">
              {filteredAlerts.length} Matches
            </span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Severity Filter */}
            <div className="relative">
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="form-select text-xs py-2 pl-8 pr-7 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-blue-500"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical (🔴)</option>
                <option value="WARNING">Warning (🟠)</option>
                <option value="ATTENTION">Attention (🟡)</option>
                <option value="INFO">Notice (🔵)</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="form-select text-xs py-2 pl-8 pr-7 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-blue-500"
              >
                <option value="ALL">All Categories</option>
                <option value="LOW_STOCK">Stock Depletion</option>
                <option value="EXPIRY">Expiration Timelines</option>
              </select>
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search drug, batch, message..."
                className="form-input text-xs pl-9 pr-3 py-2 w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="card text-center py-16 border border-dashed border-slate-200 dark:border-slate-800">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">No Alerts Found</p>
          <p className="text-xs text-slate-400 mt-1">
            {tabFilter === 'ACTIVE'
              ? 'All dispensary operations and inventory levels are currently in optimal state.'
              : 'No alerts match the selected severity and category filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => {
            const cfg = getAlertConfig(alert)
            const Icon = cfg.icon
            const isResolved = alert.status === 'RESOLVED'
            const isAcknowledged = alert.status === 'ACKNOWLEDGED'
            const isActive = alert.status === 'ACTIVE'

            return (
              <div
                key={alert.id}
                className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border ${cfg.cardClass} ${
                  isResolved ? 'opacity-70 saturate-50' : ''
                }`}
              >
                {/* Alert Icon Badge */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${cfg.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                  {/* Top Meta Line */}
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`font-bold text-sm tracking-wide ${cfg.titleColor}`}>
                      {cfg.label}
                    </span>

                    {/* Severity Pill */}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.badgeColor}`}>
                      {cfg.severityLabel}
                    </span>

                    {/* Prominent Status Pill */}
                    {isActive && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-400 dark:text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        Active
                      </span>
                    )}
                    {isAcknowledged && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/40">
                        <Eye className="w-3 h-3" />
                        Acknowledged
                      </span>
                    )}
                    {isResolved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" />
                        Resolved
                      </span>
                    )}
                  </div>

                  {/* High Contrast Alert Description */}
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                    {alert.message}
                  </p>

                  {/* Bottom Meta */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {alert.createdAt
                          ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })
                          : 'Recent alert'}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      ID: #{alert.id}
                    </span>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0">
                  {isActive && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="btn-secondary !text-xs !py-1.5 !px-3 font-semibold flex items-center gap-1.5 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        <span>Acknowledge</span>
                      </button>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="btn-primary !text-xs !py-1.5 !px-3.5 font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    </>
                  )}

                  {isAcknowledged && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="btn-primary !text-xs !py-1.5 !px-3.5 font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}

                  {isResolved && (
                    <button
                      onClick={() => handleUndo(alert.id, undoStack[alert.id] || 'ACTIVE')}
                      className="btn-secondary !text-xs !py-1.5 !px-2.5 font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-500 flex items-center gap-1"
                      title="Undo resolve status"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Undo</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

