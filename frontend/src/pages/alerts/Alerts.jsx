import { useEffect, useState } from 'react'
import { alertAPI } from '../../api/services'
import { Bell, CheckCircle, XCircle, AlertTriangle, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'

const TYPE_CONFIG = {
  LOW_STOCK:     { color: 'bg-red-50 border-red-200 text-red-700',    icon: AlertTriangle, label: 'Low Stock'   },
  OUT_OF_STOCK:  { color: 'bg-red-100 border-red-300 text-red-800',   icon: XCircle,       label: 'Out of Stock'},
  EXPIRY_30_DAYS:{ color: 'bg-red-50 border-red-200 text-red-700',    icon: Calendar,      label: 'Expiry 30d'  },
  EXPIRY_60_DAYS:{ color: 'bg-amber-50 border-amber-200 text-amber-700', icon: Calendar,   label: 'Expiry 60d'  },
  EXPIRY_90_DAYS:{ color: 'bg-yellow-50 border-yellow-200 text-yellow-700', icon: Calendar, label: 'Expiry 90d' },
}

export default function Alerts() {
  const { hasRole } = useAuth()
  const [alerts,  setAlerts]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('ACTIVE')

  const load = async () => {
    setLoading(true)
    try {
      const res = filter === 'ACTIVE'
        ? await alertAPI.getActive()
        : await alertAPI.getAll()
      setAlerts(res.data)
    } catch { toast.error('Failed to load alerts') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleAcknowledge = async (id) => {
    try {
      await alertAPI.acknowledge(id)
      toast.success('Alert acknowledged')
      load()
    } catch { toast.error('Failed') }
  }

  const handleResolve = async (id) => {
    try {
      await alertAPI.resolve(id)
      toast.success('Alert resolved')
      load()
    } catch { toast.error('Failed') }
  }

  const canAct = true

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary-600" />
            Alerts & Notifications
          </h1>
          <p className="page-subtitle">Real-time system notifications and stock warning alerts</p>
        </div>
        <div className="flex gap-2">
          {['ACTIVE','ALL'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
              {f} ALERTS
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
          <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700">
              {alerts.filter(a => a.alertType === 'LOW_STOCK' || a.alertType === 'OUT_OF_STOCK').length}
            </p>
            <p className="text-xs font-medium text-red-600">Low Stock Warnings</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">
              {alerts.filter(a => a.alertType?.startsWith('EXPIRY')).length}
            </p>
            <p className="text-xs font-medium text-amber-600">Expiration Warnings</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-md">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{alerts.length}</p>
            <p className="text-xs font-medium text-slate-500">Total {filter} Notifications</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-slate-700">All Clear!</p>
          <p className="text-slate-400 text-sm mt-1">No {filter.toLowerCase()} alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const cfg = TYPE_CONFIG[alert.alertType] || TYPE_CONFIG.LOW_STOCK
            const Icon = cfg.icon
            return (
              <div key={alert.id} className={`border rounded-2xl p-4 flex items-start gap-4 ${cfg.color}`}>
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{cfg.label}</span>
                    <span className={`badge text-xs px-2 ${
                      alert.status === 'ACTIVE'       ? 'bg-current/10 text-current' :
                      alert.status === 'ACKNOWLEDGED' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-emerald-100 text-emerald-700'
                    }`}>{alert.status}</span>
                  </div>
                  <p className="text-sm opacity-90">{alert.message}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>
                {canAct && alert.status === 'ACTIVE' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleAcknowledge(alert.id)}
                      className="btn-sm bg-white/60 hover:bg-white text-current border-0 backdrop-blur-sm">
                      Acknowledge
                    </button>
                    <button onClick={() => handleResolve(alert.id)}
                      className="btn-sm bg-white/80 hover:bg-white text-emerald-700 border-0">
                      Resolve
                    </button>
                  </div>
                )}
                {canAct && alert.status === 'ACKNOWLEDGED' && (
                  <button onClick={() => handleResolve(alert.id)}
                    className="btn-sm bg-white/80 hover:bg-white text-emerald-700 border-0 flex-shrink-0">
                    Resolve
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
