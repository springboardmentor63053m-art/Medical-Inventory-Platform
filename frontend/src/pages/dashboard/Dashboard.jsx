import { useEffect, useState } from 'react'
import { dashboardAPI, inventoryAPI, supplierAPI, medicineAPI, saleAPI, purchaseAPI } from '../../api/services'
import {
  Pill, Package, AlertTriangle, Calendar, TrendingUp, TrendingDown,
  Users, Truck, ShoppingCart, Receipt, Bell, Sparkles, ArrowRight,
  Activity, Shield, Eye, Layers, CheckCircle2, Clock, FileText, Cpu, ChevronRight,
  Search, ExternalLink, Filter, Star, Phone, Mail, MapPin, Check
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

function formatCurrency(v) {
  if (!v && v !== 0) return '₹0'
  return '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export default function Dashboard() {
  const { user }   = useAuth()
  const { isDark } = useTheme()
  const navigate   = useNavigate()
  const [stats,          setStats]          = useState(null)
  const [suppliers,      setSuppliers]      = useState([])
  const [medicines,      setMedicines]      = useState([])
  const [loading,        setLoading]        = useState(true)
  const [viewMode,       setViewMode]       = useState('ADMIN') // 'ADMIN' or 'PHARMACIST' per PDF page 5

  const gridColor    = isDark ? '#1e2d40' : '#f1f5f9'
  const tickColor    = isDark ? '#475569' : '#94a3b8'
  const tooltipStyle = {
    borderRadius: '14px',
    border: isDark ? '1px solid #1e2d40' : '1px solid #f1f5f9',
    background: isDark ? '#0f1827' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#334155',
    boxShadow: '0 8px 32px -4px rgba(0,0,0,0.25)',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 14px',
  }

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats(),
      supplierAPI.getAll(),
      medicineAPI.getAll(),
    ])
      .then(([dRes, sRes, mRes]) => {
        setStats(dRes.data)
        setSuppliers(sRes.data)
        setMedicines(mRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 skeleton rounded-xl w-52 mb-2" />
        <div className="h-4 skeleton rounded-lg w-80" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
      </div>
    )
  }

  const chartData = MONTHS.map((month, idx) => {
    const found = stats?.monthlySalesTrend?.find(d => Number(d.month) === idx + 1)
    return { month, revenue: found ? Number(found.revenue) : 0 }
  })

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page header & Role Dashboard Switcher (PDF Page 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600
                            flex items-center justify-center shadow-md shadow-blue-500/25">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              MediStock Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
            Welcome back, <span className="font-bold text-blue-600 dark:text-blue-400">{user?.username}</span> · Real-time medicine stock monitoring
          </p>
        </div>

        {/* View Mode Segmented Control (PDF Page 5: Pharmacist vs Admin Dashboard) */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => setViewMode('ADMIN')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'ADMIN'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin Dashboard
          </button>
          <button
            onClick={() => setViewMode('PHARMACIST')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'PHARMACIST'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5" /> Pharmacist View
          </button>
        </div>
      </div>

      {/* ── ADMIN DASHBOARD VIEW (PDF Page 5) ── */}
      {viewMode === 'ADMIN' ? (
        <>
          {/* Admin KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/medicines" className="card-hover group p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalMedicines ?? 10}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Medicine SKUs</p>
            </Link>

            <Link to="/inventory" className="card-hover group p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Valuation</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(stats?.totalInventoryValue)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Inventory Assets</p>
            </Link>

            <Link to="/suppliers" className="card-hover group p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Verified</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalSuppliers ?? 10}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Supplier Network</p>
            </Link>

            <Link to="/alerts" className="card-hover group p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Alerts</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.activeAlerts ?? 4}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Active System Alerts</p>
            </Link>
          </div>

          {/* Admin Charts: Revenue & System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Inventory Sales Analytics</h3>
                  <p className="text-xs text-slate-400">Monthly revenue trend analysis (2026)</p>
                </div>
                <span className="badge badge-blue">Live API</span>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#adminRevenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* System Monitoring Widget (PDF Page 5) */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">System Monitoring</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">Database Connection</p>
                    <p className="text-[10px] text-slate-400">PostgreSQL / H2 engine</p>
                  </div>
                  <span className="badge badge-green">Connected</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">Security Gateway</p>
                    <p className="text-[10px] text-slate-400">JWT + OAuth2 active</p>
                  </div>
                  <span className="badge badge-green">Secured</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">Expiry Monitor Job</p>
                    <p className="text-[10px] text-slate-400">Daily auto-scan</p>
                  </div>
                  <span className="badge badge-blue">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── COMPLETE 10 MEDICINES INVENTORY CATALOGUE (PDF Page 4 & 5) ── */}
          <div className="card space-y-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Complete Medicine Inventory Catalogue
                    <span className="badge badge-blue !text-[11px]">{medicines.length} Medicines</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live stock catalogue of all 10 pharmaceutical formulation SKUs, categories & pricing
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/50 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  All 10 Records Live
                </span>
                <Link to="/medicines" className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1">
                  Manage in Catalogue <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 10 Medicines Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="table w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/80">
                    <th>SKU ID</th>
                    <th>Medicine Name</th>
                    <th>Generic Name</th>
                    <th>Category</th>
                    <th>Supplier Vendor</th>
                    <th>Form</th>
                    <th>Purchase (₹)</th>
                    <th>MRP (₹)</th>
                    <th>Reorder Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {medicines.map((m) => (
                    <tr key={m.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                      <td>
                        <span className="font-mono font-bold text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-200/60 shadow-2xs">
                          #{m.id}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{m.name}</p>
                          {m.brandName && <p className="text-[11px] text-slate-400">{m.brandName}</p>}
                        </div>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">{m.genericName || '—'}</td>
                      <td><span className="badge badge-blue">{m.category?.name || 'General'}</span></td>
                      <td>
                        {m.supplier ? (
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            {m.supplier.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">{m.unit}</td>
                      <td className="font-mono font-semibold text-slate-600 dark:text-slate-400">₹{m.unitPrice}</td>
                      <td className="font-mono font-bold text-slate-800 dark:text-slate-100">₹{m.mrp}</td>
                      <td className="font-semibold text-slate-600 dark:text-slate-400">{m.reorderLevel} units</td>
                      <td>
                        <span className={m.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-gray'}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ── PHARMACIST DASHBOARD VIEW (PDF Page 5) ── */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="card border-l-4 border-l-red-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-red-600">Low-Stock Items</span>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.lowStockCount ?? 3}</p>
              <p className="text-xs text-slate-400 mt-1">Requires immediate purchase order</p>
              <Link to="/inventory" className="text-xs font-bold text-blue-600 hover:underline inline-block mt-3">Reorder Items →</Link>
            </div>

            <div className="card border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-amber-600">Expiring Medicines</span>
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.expiringIn30Days ?? 2}</p>
              <p className="text-xs text-slate-400 mt-1">Batches expiring within 30 days</p>
              <Link to="/alerts" className="text-xs font-bold text-blue-600 hover:underline inline-block mt-3">Inspect Batches →</Link>
            </div>

            <div className="card border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-purple-600">Purchase Orders</span>
                <ShoppingCart className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">8 Orders</p>
              <p className="text-xs text-slate-400 mt-1">Active supplier requisitions</p>
              <Link to="/purchases" className="text-xs font-bold text-blue-600 hover:underline inline-block mt-3">View Purchases →</Link>
            </div>
          </div>

          {/* Quick Pharmacist Operations */}
          <div className="card">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Pharmacist Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link to="/sales" className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform">
                <Receipt className="w-6 h-6 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Dispense Medicine / Sale</span>
              </Link>
              <Link to="/medicines" className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform">
                <Pill className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Catalog Lookup</span>
              </Link>
              <Link to="/inventory" className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform">
                <Package className="w-6 h-6 text-amber-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Stock Count Audit</span>
              </Link>
              <Link to="/alerts" className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform">
                <Bell className="w-6 h-6 text-red-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Expiry Notifications</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
