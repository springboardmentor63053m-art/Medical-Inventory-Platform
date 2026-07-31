import { useEffect, useState } from 'react'
import { dashboardAPI } from '../../api/services'
import {
  Pill, Package, AlertTriangle, Calendar, TrendingUp, TrendingDown,
  Users, Truck, ShoppingCart, Receipt, Bell,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function StatCard({ icon: Icon, label, value, color, trend, link }) {
  return (
    <Link to={link || '#'} className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`stat-icon ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1
            ${trend >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-primary-700 transition-colors">
        {value}
      </p>
      <p className="text-sm text-slate-500">{label}</p>
    </Link>
  )
}

function formatCurrency(value) {
  if (!value && value !== 0) return '₹0'
  return '₹' + Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <div className="h-8 bg-slate-200 rounded-lg w-64 animate-pulse mb-2" />
            <div className="h-4 bg-slate-100 rounded w-48 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-32 animate-pulse bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  // Build chart data from monthly trend
  const chartData = MONTHS.map((month, idx) => {
    const found = stats?.monthlySalesTrend?.find(d => Number(d.month) === idx + 1)
    return { month, revenue: found ? Number(found.revenue) : 0 }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <span className="text-primary-600 font-semibold">{user?.username}</span> —
            here's what's happening in your inventory today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Last updated</p>
          <p className="text-sm font-medium text-slate-700">{new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Pill}
          label="Total Medicines"
          value={stats?.totalMedicines ?? '—'}
          color="bg-blue-50 text-blue-600"
          link="/medicines"
        />
        <StatCard
          icon={Package}
          label="Inventory Value"
          value={formatCurrency(stats?.totalInventoryValue)}
          color="bg-emerald-50 text-emerald-600"
          link="/inventory"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={stats?.lowStockCount ?? '—'}
          color="bg-red-50 text-red-600"
          link="/inventory"
        />
        <StatCard
          icon={Calendar}
          label="Expiring in 30 Days"
          value={stats?.expiringIn30Days ?? '—'}
          color="bg-amber-50 text-amber-600"
          link="/inventory"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={Bell}  label="Active Alerts"    value={stats?.activeAlerts ?? '—'}   color="bg-purple-50 text-purple-600" link="/alerts" />
        <StatCard icon={Truck} label="Active Suppliers" value={stats?.totalSuppliers ?? '—'} color="bg-teal-50 text-teal-600" link="/suppliers" />
        <StatCard icon={Users} label="Staff Members"    value="5"  color="bg-indigo-50 text-indigo-600" link="/employees" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Sales Trend */}
        <div className="card lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-800 mb-5">Monthly Sales Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12)', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats panel */}
        <div className="card flex flex-col gap-4">
          <h3 className="text-base font-semibold text-slate-800">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Add Medicine',     link: '/medicines',  icon: Pill,         color: 'text-blue-600 bg-blue-50' },
              { label: 'New Purchase',     link: '/purchases',  icon: ShoppingCart, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Record Sale',      link: '/sales',      icon: Receipt,      color: 'text-purple-600 bg-purple-50' },
              { label: 'View Alerts',      link: '/alerts',     icon: Bell,         color: 'text-red-600 bg-red-50' },
            ].map(({ label, link, icon: Icon, color }) => (
              <Link key={link} to={link}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary-600 transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent purchases + sales tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Purchases */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">Recent Purchases</h3>
            <Link to="/purchases" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all →</Link>
          </div>
          <div className="space-y-2">
            {(stats?.recentPurchases || []).slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{p.invoiceNumber}</p>
                  <p className="text-xs text-slate-400">{p.purchaseDate}</p>
                </div>
                <span className={`badge ${p.status === 'RECEIVED' ? 'badge-green' : p.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'}`}>
                  {p.status}
                </span>
              </div>
            ))}
            {(!stats?.recentPurchases?.length) && (
              <p className="text-sm text-slate-400 text-center py-4">No recent purchases</p>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">Recent Sales</h3>
            <Link to="/sales" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all →</Link>
          </div>
          <div className="space-y-2">
            {(stats?.recentSales || []).slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{s.saleNumber}</p>
                  <p className="text-xs text-slate-400">{s.customerName || 'Walk-in Customer'}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-700">{formatCurrency(s.netAmount)}</p>
              </div>
            ))}
            {(!stats?.recentSales?.length) && (
              <p className="text-sm text-slate-400 text-center py-4">No recent sales</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
