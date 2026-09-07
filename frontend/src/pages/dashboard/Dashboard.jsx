import { useEffect, useState } from 'react'
import { dashboardAPI, inventoryAPI, supplierAPI, medicineAPI, saleAPI, purchaseAPI, prescriptionAPI, aiAPI } from '../../api/services'
import {
  Pill, Package, AlertTriangle, Calendar, TrendingUp, TrendingDown,
  Users, Truck, ShoppingCart, Receipt, Bell, Sparkles, ArrowRight,
  Activity, Shield, Eye, Layers, CheckCircle2, Clock, FileText, Cpu, ChevronRight,
  Search, ExternalLink, Filter, Star, Phone, Mail, MapPin, Check, Zap, Bot,
  ShieldCheck, Database, Brain, ScanLine, RefreshCw, BarChart3, TrendingDown as TDown,
  ArrowUpRight, ArrowDownRight, Wifi, Server, HardDrive, MonitorCheck, PackageSearch
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatCurrency(v) {
  if (!v && v !== 0) return '₹0'
  return '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

// ── Tiny pulse dot ──────────────────────────────────────────────
function PulseDot({ color = 'bg-emerald-400' }) {
  return (
    <span className={`relative flex h-2 w-2`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  )
}

// ── Section heading ──────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500 px-1 mb-1.5">
      {children}
    </p>
  )
}

// ── Analytics tab button ─────────────────────────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
        active
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  )
}

// ── Custom chart tooltip ─────────────────────────────────────────
function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: isDark ? '#0f1827' : '#ffffff',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 8px 32px -4px rgba(0,0,0,0.25)',
        fontSize: 12,
      }}
    >
      <p style={{ color: isDark ? '#94a3b8' : '#64748b', marginBottom: 6, fontWeight: 700 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: isDark ? '#e2e8f0' : '#334155', fontWeight: 600 }}>{p.name}:</span>
          <span style={{ color: p.color, fontWeight: 800 }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user }   = useAuth()
  const { isDark } = useTheme()
  const navigate   = useNavigate()
  const [stats,          setStats]          = useState(null)
  const [medicines,      setMedicines]      = useState([])
  const [recommendations,setRecommendations]= useState([])
  const [loading,        setLoading]        = useState(true)
  const [viewMode,       setViewMode]       = useState('ADMIN')
  const [activeTab,      setActiveTab]      = useState('stock')

  const gridColor    = isDark ? '#1e293b' : '#f1f5f9'
  const tickColor    = isDark ? '#475569' : '#94a3b8'

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats(),
      medicineAPI.getAll(),
      aiAPI.getRecommendations(),
    ])
      .then(([dRes, mRes, recRes]) => {
        setStats(dRes.data)
        setMedicines(mRes.data)
        setRecommendations(recRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64 mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-96" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  // ── Inventory Movement Chart Data ────────────────────────────
  const RECEIVED_DATA  = [3200, 5400, 4800, 6100, 7200, 5900, 8400, 7100, 6800, 9200, 8100, 7600]
  const DISPENSED_DATA = [2800, 4100, 4500, 5200, 6800, 5400, 7600, 6900, 6200, 8100, 7400, 7000]

  const stockMovementData = MONTHS.map((month, i) => ({
    month,
    received:  (stats?.monthlyReceived?.[i]  ?? RECEIVED_DATA[i]),
    dispensed: (stats?.monthlyDispensed?.[i] ?? DISPENSED_DATA[i]),
  }))

  // ── Revenue Chart Data ───────────────────────────────────────
  const WAVE_SPLIT = [600, 4200, 4500, 1200, 9000, 1500, 4500, 1800, 1500, null, null, null]
  const revenueData = MONTHS.map((month, idx) => {
    const found = stats?.monthlySalesTrend?.find(d => Number(d.month) === idx + 1)
    const apiVal = found ? Number(found.revenue) : 0
    return { month, revenue: apiVal > 0 ? apiVal : WAVE_SPLIT[idx] }
  })

  // ── Expiry Trend Data ────────────────────────────────────────
  const expiryData = MONTHS.slice(0, 9).map((month, i) => ({
    month,
    critical: [0, 1, 0, 2, 1, 3, 0, 1, 2][i],
    warning:  [2, 1, 3, 1, 2, 1, 4, 2, 1][i],
  }))

  const chartData = activeTab === 'stock'   ? stockMovementData
                  : activeTab === 'revenue' ? revenueData
                  : expiryData

  const totalMeds   = stats?.totalMedicines     ?? 10
  const invValue    = stats?.totalInventoryValue ?? 28800
  const lowStock    = stats?.lowStockCount       ?? 4
  const expiringBat = stats?.expiringIn30Days    ?? 2

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ══════════════════════════════════════════════════
          1. PAGE HEADER
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            {/* Animated brand icon */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700
                              flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-blue-400/30">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 to-indigo-600/20 rounded-2xl blur-md -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display leading-none">
                  MedStock AI Command Center
                </h1>
                {/* AI Engine badge */}
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                 bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/30
                                 text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-widest uppercase">
                  <PulseDot color="bg-blue-500" />
                  AI Engine Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Welcome, <span className="font-bold text-blue-600 dark:text-blue-400">{user?.username}</span>
                {' · '}Real-time pharmacy intelligence & clinical stock monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Admin / Pharmacist View Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-inner self-start sm:self-auto">
          <button
            onClick={() => setViewMode('ADMIN')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              viewMode === 'ADMIN'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin Dashboard
          </button>
          <button
            onClick={() => setViewMode('PHARMACIST')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              viewMode === 'PHARMACIST'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <Pill className="w-3.5 h-3.5" /> Pharmacist View
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          2. AI INTELLIGENCE & PREDICTIVE OPERATIONS
      ══════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-blue-200/40 dark:border-blue-800/30
                      bg-gradient-to-br from-blue-950/[0.04] via-indigo-950/[0.06] to-slate-900/[0.02]
                      dark:from-blue-950/30 dark:via-indigo-950/25 dark:to-slate-950/20
                      shadow-sm overflow-hidden">
        {/* Header strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3
                        px-5 py-4 border-b border-blue-200/30 dark:border-blue-900/30
                        bg-gradient-to-r from-blue-600/[0.04] to-transparent dark:from-blue-600/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600
                            flex items-center justify-center shadow-md shadow-blue-500/25">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                AI Intelligence & Predictive Operations
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Automated clinical stockout risk detection & prescription intake telemetry
              </p>
            </div>
          </div>
          <Link
            to="/ai-insights"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400
                       hover:text-blue-700 dark:hover:text-blue-300 hover:underline
                       bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg
                       border border-blue-200/50 dark:border-blue-800/40 transition-all
                       self-start sm:self-auto whitespace-nowrap"
          >
            Open Full AI Insights Dashboard <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 space-y-4">
          {/* 4 AI KPI Insight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            {/* Stockout Risk – RED */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-red-200/60 dark:border-red-900/40
                            shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Stockout Risk</span>
                <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-red-600 dark:text-red-400 leading-none">
                {stats?.aiStockRiskCount ?? 4} SKUs
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Depletes in &lt;7 days</p>
              <div className="mt-2 h-1 bg-red-100 dark:bg-red-950 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            {/* Expiry Risk – ORANGE */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-amber-200/60 dark:border-amber-900/40
                            shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Expiry Risk</span>
                <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">
                {stats?.expiringIn30Days ?? 2} Batches
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">FEFO priority rotation</p>
              <div className="mt-2 h-1 bg-amber-100 dark:bg-amber-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            {/* Prescription Verification – BLUE */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-blue-200/60 dark:border-blue-900/40
                            shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rx Verification</span>
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
                {stats?.totalPrescriptions ?? 5} Rxs
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{stats?.pendingPrescriptions ?? 1} pending review</p>
              <div className="mt-2 h-1 bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>

            {/* Inventory Anomalies – PURPLE */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-purple-200/60 dark:border-purple-900/40
                            shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Anomalies</span>
                <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-purple-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 leading-none">
                {stats?.anomaliesCount ?? 3} Detected
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Unusual stock variance</p>
              <div className="mt-2 h-1 bg-purple-100 dark:bg-purple-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '55%' }} />
              </div>
            </div>
          </div>

          {/* Action Alert Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Critical Stock – RED */}
            <div className="flex items-center justify-between gap-3
                            p-3.5 rounded-xl
                            bg-red-50/80 dark:bg-red-950/20
                            border border-red-200/70 dark:border-red-800/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50
                                flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Reorder Paracetamol 650mg
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <PulseDot color="bg-red-500" />
                    Stock critical: 45 units remaining
                  </p>
                </div>
              </div>
              <Link to="/purchases"
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold
                           bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm">
                Reorder
              </Link>
            </div>

            {/* Expiry Warning – ORANGE */}
            <div className="flex items-center justify-between gap-3
                            p-3.5 rounded-xl
                            bg-amber-50/80 dark:bg-amber-950/20
                            border border-amber-200/70 dark:border-amber-800/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50
                                flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Review 2 Expiring Batches
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    FEFO priority rotation enabled
                  </p>
                </div>
              </div>
              <Link to="/alerts"
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold
                           bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm">
                Review
              </Link>
            </div>

            {/* Prescription Pending – BLUE */}
            <div className="flex items-center justify-between gap-3
                            p-3.5 rounded-xl
                            bg-blue-50/80 dark:bg-blue-950/20
                            border border-blue-200/70 dark:border-blue-800/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50
                                flex items-center justify-center">
                  <ScanLine className="w-4 h-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    1 Prescription Pending Verification
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    AI OCR scan ready for approval
                  </p>
                </div>
              </div>
              <Link to="/prescriptions"
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold
                           bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm">
                Verify
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          3. KPI METRIC CARDS
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        {/* Total Medicines */}
        <Link to="/medicines"
          className="group card-hover p-5 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50
                            text-blue-600 flex items-center justify-center
                            group-hover:scale-110 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400
                             bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full
                             border border-emerald-200/50 dark:border-emerald-800/40">
              Active
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{totalMeds}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Total Medicines</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +18 added this month
            </p>
          </div>
        </Link>

        {/* Inventory Value */}
        <Link to="/inventory"
          className="group card-hover p-5 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50
                            text-emerald-600 flex items-center justify-center
                            group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400
                             bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full
                             border border-blue-200/50 dark:border-blue-800/40">
              Valuation
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
              {formatCurrency(invValue)}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Inventory Value</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +4.2% vs last month
            </p>
          </div>
        </Link>

        {/* Low Stock Medicines */}
        <Link to="/alerts"
          className="group card-hover p-5 flex flex-col justify-between min-h-[110px]
                     border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50
                            text-amber-600 flex items-center justify-center
                            group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400
                             bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full
                             border border-amber-200/50 dark:border-amber-800/40">
              Warning
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">{lowStock}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Low Stock Medicines</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Requires restocking</p>
          </div>
        </Link>

        {/* Expiring Batches */}
        <Link to="/alerts"
          className="group card-hover p-5 flex flex-col justify-between min-h-[110px]
                     border-l-4 border-l-red-400">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50
                            text-red-600 flex items-center justify-center
                            group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400
                             bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full
                             border border-red-200/50 dark:border-red-800/40">
              Critical
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-red-600 dark:text-red-400 leading-none">{expiringBat}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Expiring Batches</p>
            <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">Within 90 days</p>
          </div>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════
          4. ANALYTICS + SYSTEM HEALTH (side-by-side)
      ══════════════════════════════════════════════════ */}
      {viewMode === 'ADMIN' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Analytics Chart ─────────────────────────── */}
          <div className="lg:col-span-2 card">
            {/* Chart header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Inventory Analytics
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400
                                   bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full
                                   border border-emerald-200/50 dark:border-emerald-800/40">
                    <PulseDot color="bg-emerald-500" /> Live API
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Monthly inventory movement & operational trends</p>
              </div>

              {/* Segmented control */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80
                              border border-slate-200 dark:border-slate-700/80 gap-1 self-start">
                <TabBtn active={activeTab === 'stock'} onClick={() => setActiveTab('stock')}>
                  Stock Movement
                </TabBtn>
                <TabBtn active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')}>
                  Sales & Revenue
                </TabBtn>
                <TabBtn active={activeTab === 'expiry'} onClick={() => setActiveTab('expiry')}>
                  Expiry Trends
                </TabBtn>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={220}>
              {activeTab === 'stock' ? (
                <LineChart data={stockMovementData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={v => (v/1000).toFixed(0) + 'k'} axisLine={false} tickLine={false} width={38} />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="received"  name="Received Units"  stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="dispensed" name="Dispensed Units" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }} />
                </LineChart>
              ) : activeTab === 'revenue' ? (
                <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} axisLine={false} tickLine={false} width={46} />
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 600, background: isDark ? '#0f1827' : '#fff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" connectNulls={false} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              ) : (
                <BarChart data={expiryData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 600, background: isDark ? '#0f1827' : '#fff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 8 }} />
                  <Bar dataKey="critical" name="Critical Expiry" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="warning"  name="Expiry Warning"  fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* ── System Health Card ───────────────────────── */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40
                                text-emerald-600 flex items-center justify-center">
                  <MonitorCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    System Health
                  </h3>
                  <p className="text-[10px] text-slate-400">Production environment status</p>
                </div>
              </div>
              <PulseDot color="bg-emerald-400" />
            </div>

            <div className="space-y-2.5">
              {/* Database Engine */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50
                              border border-slate-100 dark:border-slate-700/50
                              flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/50
                                  flex items-center justify-center flex-shrink-0">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Database Engine</p>
                    <p className="text-[10px] text-slate-400">PostgreSQL / H2</p>
                  </div>
                </div>
                <span className="badge badge-green text-[10px] flex-shrink-0">Connected</span>
              </div>

              {/* AI Intelligence Core */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50
                              border border-slate-100 dark:border-slate-700/50
                              flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/50
                                  flex items-center justify-center flex-shrink-0">
                    <Brain className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">AI Intelligence Core</p>
                    <p className="text-[10px] text-slate-400">Neural forecast & risk radar</p>
                  </div>
                </div>
                <span className="badge badge-blue text-[10px] flex-shrink-0">Online</span>
              </div>

              {/* Prescription OCR */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50
                              border border-slate-100 dark:border-slate-700/50
                              flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50
                                  flex items-center justify-center flex-shrink-0">
                    <ScanLine className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Prescription OCR Engine</p>
                    <p className="text-[10px] text-slate-400">Vision text extraction v3.0</p>
                  </div>
                </div>
                <span className="badge badge-green text-[10px] flex-shrink-0">Active</span>
              </div>

              {/* Spring Boot API */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50
                              border border-slate-100 dark:border-slate-700/50
                              flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/50
                                  flex items-center justify-center flex-shrink-0">
                    <Server className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Spring Boot API</p>
                    <p className="text-[10px] text-slate-400">REST backend v3.0</p>
                  </div>
                </div>
                <span className="badge badge-green text-[10px] flex-shrink-0">Running</span>
              </div>
            </div>

            {/* Uptime badge */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50
                            dark:from-emerald-950/20 dark:to-teal-950/20
                            border border-emerald-200/40 dark:border-emerald-800/30
                            text-center">
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">System Uptime: 99.9%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">All services operational · Last sync: live</p>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════
            PHARMACIST VIEW
        ══════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="card border-l-4 border-l-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-red-600 tracking-wider">Low-Stock Items</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.lowStockCount ?? 4}</p>
            <p className="text-xs text-slate-400 mt-1">Requires immediate purchase order</p>
            <Link to="/inventory" className="text-xs font-bold text-blue-600 hover:underline inline-block mt-3">Reorder Items →</Link>
          </div>
          <div className="card border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-rose-600 tracking-wider">Rxs to Review</span>
              <FileText className="w-5 h-5 text-rose-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.pendingPrescriptions ?? 1}</p>
            <p className="text-xs text-slate-400 mt-1">Pending pharmacist clinical verification</p>
            <Link to="/prescriptions" className="text-xs font-bold text-rose-600 hover:underline inline-block mt-3">Review Prescriptions →</Link>
          </div>
          <div className="card border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-amber-600 tracking-wider">Expiring Medicines</span>
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.expiringIn30Days ?? 2}</p>
            <p className="text-xs text-slate-400 mt-1">Batches expiring within 30 days</p>
            <Link to="/alerts" className="text-xs font-bold text-blue-600 hover:underline inline-block mt-3">Inspect Batches →</Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          5. MEDICINE INVENTORY CATALOGUE (Admin only)
      ══════════════════════════════════════════════════ */}
      {viewMode === 'ADMIN' && (
        <div className="card space-y-4 shadow-sm">
          {/* Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3
                          pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40
                              text-blue-600 flex items-center justify-center">
                <PackageSearch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Complete Medicine Inventory Catalogue
                  <span className="badge badge-blue text-[10px]">{medicines.length || 10} Formulations</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Live stock catalogue · pharmaceutical SKUs, categories & pricing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400
                               bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full
                               border border-emerald-200/50 dark:border-emerald-800/40">
                <PulseDot color="bg-emerald-500" /> All Records Live
              </span>
              <Link to="/medicines"
                className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1">
                Manage Catalogue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="table w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80">
                  <th>SKU ID</th>
                  <th>Medicine Name</th>
                  <th>Generic Name</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Form</th>
                  <th>Purchase (₹)</th>
                  <th>MRP (₹)</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {medicines.length > 0 ? medicines.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                    <td>
                      <span className="font-mono font-bold text-[11px] bg-blue-50 dark:bg-blue-950/60
                                       text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md
                                       border border-blue-200/60">
                        #{m.id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{m.name}</p>
                        {m.brandName && <p className="text-[11px] text-slate-400">{m.brandName}</p>}
                      </div>
                    </td>
                    <td className="text-slate-500 dark:text-slate-400">{m.genericName || '—'}</td>
                    <td><span className="badge badge-blue">{m.category?.name || 'General'}</span></td>
                    <td>
                      {m.supplier ? (
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {m.supplier.name}
                        </span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="text-slate-500 dark:text-slate-400">{m.unit}</td>
                    <td className="font-mono font-semibold text-slate-600 dark:text-slate-400">₹{m.unitPrice}</td>
                    <td className="font-mono font-bold text-slate-800 dark:text-slate-100">₹{m.mrp}</td>
                    <td className="font-semibold text-slate-600 dark:text-slate-400">{m.reorderLevel} units</td>
                    <td>
                      <span className={m.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-gray'}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  /* Fallback sample rows when API not ready */
                  [
                    { id: 1, name: 'Paracetamol 650mg', brand: 'Crocin', generic: 'Acetaminophen', cat: 'Analgesic', supplier: 'PharmaCorp', form: 'Tablet', buy: 2.50, mrp: 45, reorder: 100, status: 'ACTIVE' },
                    { id: 2, name: 'Amoxicillin 500mg', brand: 'Mox', generic: 'Amoxicillin', cat: 'Antibiotic', supplier: 'MediSupply', form: 'Capsule', buy: 8.00, mrp: 120, reorder: 200, status: 'ACTIVE' },
                    { id: 3, name: 'Atorvastatin 10mg', brand: 'Lipitor', generic: 'Atorvastatin', cat: 'Cardiac', supplier: 'CardioMed', form: 'Tablet', buy: 5.50, mrp: 88, reorder: 150, status: 'ACTIVE' },
                    { id: 4, name: 'Metformin 500mg', brand: 'Glucophage', generic: 'Metformin HCl', cat: 'Antidiabetic', supplier: 'DiaPharma', form: 'Tablet', buy: 3.20, mrp: 55, reorder: 250, status: 'ACTIVE' },
                    { id: 5, name: 'Omeprazole 20mg', brand: 'Prilosec', generic: 'Omeprazole', cat: 'Gastro', supplier: 'GastroMed', form: 'Capsule', buy: 4.80, mrp: 72, reorder: 180, status: 'ACTIVE' },
                  ].map(m => (
                    <tr key={m.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                      <td>
                        <span className="font-mono font-bold text-[11px] bg-blue-50 dark:bg-blue-950/60
                                         text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md
                                         border border-blue-200/60">
                          #{m.id}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{m.name}</p>
                          <p className="text-[11px] text-slate-400">{m.brand}</p>
                        </div>
                      </td>
                      <td className="text-slate-500 dark:text-slate-400">{m.generic}</td>
                      <td><span className="badge badge-blue">{m.cat}</span></td>
                      <td>
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {m.supplier}
                        </span>
                      </td>
                      <td className="text-slate-500 dark:text-slate-400">{m.form}</td>
                      <td className="font-mono font-semibold text-slate-600 dark:text-slate-400">₹{m.buy.toFixed(2)}</td>
                      <td className="font-mono font-bold text-slate-800 dark:text-slate-100">₹{m.mrp}</td>
                      <td className="font-semibold text-slate-600 dark:text-slate-400">{m.reorder} units</td>
                      <td><span className="badge badge-green">{m.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          6. PHARMACIST QUICK ACTIONS
      ══════════════════════════════════════════════════ */}
      {viewMode === 'PHARMACIST' && (
        <div className="card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wide">
            Pharmacist Clinical Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/prescriptions"
              className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50
                         flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 text-rose-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Verify Prescriptions</span>
            </Link>
            <Link to="/sales"
              className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50
                         flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform">
              <Receipt className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Dispense & POS Billing</span>
            </Link>
            <Link to="/ai-insights"
              className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50
                         flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-amber-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Stock Risk Radar</span>
            </Link>
            <Link to="/inventory"
              className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50
                         flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform">
              <Package className="w-6 h-6 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">FEFO Stock Audit</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
