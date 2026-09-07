import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  dashboardAPI, medicineAPI, supplierAPI, aiAPI
} from '../../api/services'
import { useTheme } from '../../context/ThemeContext'
import {
  AlertTriangle, Calendar,
  ChevronDown, ChevronUp
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [stats,          setStats]          = useState(null)
  const [medicines,      setMedicines]      = useState([])
  const [suppliers,      setSuppliers]      = useState([])
  const [loading,        setLoading]        = useState(true)
  const [showFullTable,  setShowFullTable]  = useState(false)

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats().catch(() => ({ data: null })),
      medicineAPI.getAll().catch(() => ({ data: [] })),
      supplierAPI.getAll().catch(() => ({ data: [] })),
      aiAPI.getRecommendations().catch(() => ({ data: [] })),
    ])
      .then(([dRes, mRes, sRes]) => {
        setStats(dRes.data)
        setMedicines(Array.isArray(mRes.data) ? mRes.data : [])
        setSuppliers(Array.isArray(sRes.data) ? sRes.data : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleReorderAll = () => {
    toast.success('Generated purchase orders for depleted stock items ✓', {
      icon: '📦',
      style: {
        background: isDark ? '#101622' : '#FFFFFF',
        color: isDark ? '#fff' : '#0F172A',
        border: '1px solid #FF5500',
      }
    })
    navigate('/purchases')
  }

  // 6 months stream matching the dual-wave area chart from screenshot
  const flowData = [
    { month: 'Mar', dispensed: 7600,  received: 8600 },
    { month: 'Apr', dispensed: 8900,  received: 8800 },
    { month: 'May', dispensed: 8600,  received: 7300 },
    { month: 'Jun', dispensed: 9900,  received: 8300 },
    { month: 'Jul', dispensed: 10500, received: 9600 },
    { month: 'Aug', dispensed: 10100, received: 11000 },
  ]

  // Exact 4 batch expiry items from screenshot
  const batchExpiryList = [
    { name: 'Heparin 5000 IU',   lot: 'LOT: B-69844', expiry: '2026-09-14', units: '42 UNITS' },
    { name: 'Insulin Glargine',  lot: 'LOT: B-66831', expiry: '2026-09-29', units: '86 UNITS' },
    { name: 'Salbutamol Inhaler',lot: 'LOT: B-78212', expiry: '2026-10-21', units: '148 UNITS' },
    { name: 'Paracetamol 650mg', lot: 'LOT: B-77145', expiry: '2026-11-02', units: '320 UNITS' },
  ]

  // Exact inventory depletion progress meters from screenshot
  const depletionList = [
    { name: 'PARACETAMOL 650MG',  current: 320, total: 500, pct: 64 },
    { name: 'INSULIN GLARGINE',   current: 86,  total: 120, pct: 72 },
    { name: 'SALBUTAMOL INHALER', current: 148, total: 150, pct: 98 },
  ]

  // Net inventory value formatting
  const netInventoryDisplay = stats?.totalInventoryValue
    ? `₹${(stats.totalInventoryValue / 100000).toFixed(1)}L`
    : '₹42.8L'

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
          Inventory Command
        </h1>
      </div>

      {/* ── 4 KPI STAT CARDS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: TOTAL SKUS */}
        <Link
          to="/inventory"
          className="bg-white dark:bg-[#101622] border border-slate-200 dark:border-[#1C2536] hover:border-slate-300 dark:hover:border-[#2A374D] rounded-2xl p-5 flex flex-col justify-between shadow-sm dark:shadow-xl dark:shadow-black/20 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              TOTAL SKUS
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#17202E] border border-slate-200 dark:border-[#232F42] flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="7" r="3" />
                <circle cx="6" cy="17" r="3" />
                <circle cx="18" cy="17" r="3" />
                <line x1="10" y1="9" x2="8" y2="15" />
                <line x1="14" y1="9" x2="16" y2="15" />
              </svg>
            </div>
          </div>
          <div className="my-3">
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats?.totalMedicines ? stats.totalMedicines.toLocaleString() : '1,284'}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            +18 added this month
          </p>
        </Link>

        {/* Card 2: LOW STOCK ALERT */}
        <Link
          to="/inventory"
          className="bg-white dark:bg-[#101622] border border-slate-200 dark:border-[#1C2536] hover:border-orange-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-sm dark:shadow-xl dark:shadow-black/20 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold tracking-wider text-[#FF5500] uppercase">
              LOW STOCK ALERT
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-[#281614] border border-orange-200 dark:border-[#44211A] flex items-center justify-center text-[#FF5500]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <p className="text-4xl font-extrabold text-[#FF5500] tracking-tight">
              {stats?.lowStockCount ?? 4}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Below reorder level
          </p>
        </Link>

        {/* Card 3: EXPIRING (90D) */}
        <Link
          to="/alerts"
          className="bg-white dark:bg-[#101622] border border-slate-200 dark:border-[#1C2536] hover:border-orange-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-sm dark:shadow-xl dark:shadow-black/20 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold tracking-wider text-[#FF5500] uppercase">
              EXPIRING (90D)
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-[#281614] border border-orange-200 dark:border-[#44211A] flex items-center justify-center text-[#FF5500]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <p className="text-4xl font-extrabold text-[#FF5500] tracking-tight">
              {stats?.expiringIn30Days ?? 27}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Quarantine review pending
          </p>
        </Link>

        {/* Card 4: NET INVENTORY VALUE (Hero Solid Orange Card) */}
        <div className="bg-[#FF5500] rounded-2xl p-5 flex flex-col justify-between text-white shadow-xl shadow-orange-500/25 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-mono font-semibold tracking-wider text-white/95 uppercase">
              NET INVENTORY VALUE
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-base shadow-inner">
              ₹
            </div>
          </div>
          <div className="my-3 relative z-10">
            <p className="text-4xl font-black text-white tracking-tight">
              {netInventoryDisplay}
            </p>
          </div>
          <p className="text-xs font-medium text-white/95 relative z-10">
            +4.2% vs last month
          </p>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* ── LOWER SECTION: CHART & RIGHT PANELS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: FLOW: DISPENSED VS RECEIVED (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-[#101622] border border-slate-200 dark:border-[#1C2536] rounded-2xl p-6 shadow-sm dark:shadow-xl dark:shadow-black/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-black tracking-wider uppercase text-slate-900 dark:text-white font-mono">
                FLOW: DISPENSED VS RECEIVED
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Units, last 6 months
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]" />
                <span className="text-slate-700 dark:text-slate-200">DISPENSED</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-slate-700 dark:text-slate-200">RECEIVED</span>
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="w-full h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="dispensedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5500" stopOpacity={0.45} />
                    <stop offset="70%" stopColor="#FF5500" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#FF5500" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="70%" stopColor="#10B981" stopOpacity={0.10} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1A2333" : "#F1F5F9"} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: isDark ? '#64748B' : '#94A3B8', fontFamily: 'monospace', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 12000]}
                  ticks={[0, 3000, 6000, 9000, 12000]}
                  tick={{ fontSize: 11, fill: isDark ? '#64748B' : '#94A3B8', fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#101622' : '#FFFFFF',
                    border: isDark ? '1px solid #1C2536' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.6)' : '0 10px 25px -5px rgba(0,0,0,0.1)',
                  }}
                  itemStyle={{ color: isDark ? '#E2E8F0' : '#1E293B', padding: '2px 0' }}
                />
                <Area
                  type="monotone"
                  dataKey="dispensed"
                  stroke="#FF5500"
                  strokeWidth={2.5}
                  fill="url(#dispensedGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#FF5500', stroke: isDark ? '#101622' : '#FFFFFF', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="received"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#receivedGrad)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#10B981', stroke: isDark ? '#101622' : '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: BATCH EXPIRY & INVENTORY DEPLETION (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Card 1: BATCH EXPIRY */}
          <div className="bg-white dark:bg-[#101622] border border-slate-200 dark:border-[#1C2536] rounded-2xl p-5 shadow-sm dark:shadow-xl dark:shadow-black/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1C2536]">
              <h2 className="text-xs font-black tracking-wider uppercase text-[#FF5500] font-mono">
                BATCH EXPIRY
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#FF5500] text-white text-[10px] font-black font-mono uppercase tracking-wider">
                4 CRITICAL
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#1C2536]/60 pt-1">
              {batchExpiryList.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold text-sm leading-tight">{item.name}</p>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{item.lot}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 leading-tight">{item.expiry}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 leading-tight uppercase">{item.units}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: INVENTORY DEPLETION */}
          <div className="bg-white dark:bg-[#101622] border border-slate-200 dark:border-[#1C2536] rounded-2xl p-5 shadow-sm dark:shadow-xl dark:shadow-black/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1C2536]">
              <h2 className="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white font-mono">
                INVENTORY DEPLETION
              </h2>
              <button
                onClick={handleReorderAll}
                className="px-2 py-0.5 rounded border border-slate-200 dark:border-[#2B3B52] text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-white hover:bg-[#FF5500] hover:border-[#FF5500] transition-colors uppercase tracking-wider active:scale-95"
              >
                REORDER ALL
              </button>
            </div>

            <div className="space-y-4 pt-3.5">
              {depletionList.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                      <span className="font-mono font-bold text-slate-800 dark:text-white text-[11px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {item.current} / {item.total}
                    </span>
                  </div>
                  {/* Depletion Bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#17202E] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#FF5500]"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── EXPANDABLE: FULL CATALOGUE SPECIFICATIONS ── */}
      <div className="bg-white dark:bg-[#101622] border border-slate-200 dark:border-[#1C2536] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl dark:shadow-black/20">
        <button
          onClick={() => setShowFullTable(p => !p)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Full Medicine Inventory Catalogue ({medicines.length} Formulations)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click to {showFullTable ? 'collapse' : 'view full catalogue and pricing specifications'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#FF5500] font-semibold hidden sm:inline">
              {showFullTable ? 'Hide Table' : 'Expand Table'}
            </span>
            {showFullTable ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {showFullTable && (
          <div className="border-t border-slate-200 dark:border-[#1C2536] p-5 animate-slide-down">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1C2536]">
              <table className="table w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#141A26] border-b border-slate-200 dark:border-[#1C2536]">
                    <th className="py-3 px-4 text-left font-mono text-slate-600 dark:text-slate-400 font-bold">SKU ID</th>
                    <th className="py-3 px-4 text-left font-mono text-slate-600 dark:text-slate-400 font-bold">Medicine Name</th>
                    <th className="py-3 px-4 text-left font-mono text-slate-600 dark:text-slate-400 font-bold">Generic</th>
                    <th className="py-3 px-4 text-left font-mono text-slate-600 dark:text-slate-400 font-bold">Form</th>
                    <th className="py-3 px-4 text-left font-mono text-slate-600 dark:text-slate-400 font-bold">Supplier</th>
                    <th className="py-3 px-4 text-left font-mono text-slate-600 dark:text-slate-400 font-bold">Purchase (₹)</th>
                    <th className="py-3 px-4 text-left font-mono text-slate-600 dark:text-slate-400 font-bold">MRP (₹)</th>
                    <th className="py-3 px-4 text-left font-mono text-slate-600 dark:text-slate-400 font-bold">Reorder Level</th>
                    <th className="py-3 px-4 text-left font-mono text-slate-600 dark:text-slate-400 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1C2536] bg-white dark:bg-[#101622]">
                  {medicines.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#FF5500]">#{m.id}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{m.name}</td>
                      <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{m.genericName || '—'}</td>
                      <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{m.unit}</td>
                      <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{m.supplier?.name || '—'}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">₹{m.unitPrice}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">₹{m.mrp}</td>
                      <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{m.reorderLevel} units</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          m.status === 'ACTIVE'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
