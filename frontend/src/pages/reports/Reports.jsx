import { useEffect, useState } from 'react'
import { purchaseAPI, saleAPI, inventoryAPI } from '../../api/services'
import { BarChart2, TrendingUp, Package, ShoppingCart, Receipt } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

export default function Reports() {
  const [purchases,  setPurchases]  = useState([])
  const [sales,      setSales]      = useState([])
  const [inventory,  setInventory]  = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([purchaseAPI.getAll(), saleAPI.getAll(), inventoryAPI.getAll()])
      .then(([p, s, i]) => { setPurchases(p.data); setSales(s.data); setInventory(i.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalPurchase = purchases.filter(p => p.status === 'RECEIVED').reduce((s, p) => s + Number(p.netAmount), 0)
  const totalSales    = sales.filter(s => s.status === 'COMPLETED').reduce((s, sale) => s + Number(sale.netAmount), 0)
  const totalItems    = inventory.length

  // Payment method breakdown
  const paymentData = ['CASH','CARD','UPI','INSURANCE'].map(m => ({
    name: m,
    value: sales.filter(s => s.paymentMethod === m && s.status === 'COMPLETED').length
  })).filter(d => d.value > 0)

  // Purchase status
  const purchaseStatus = [
    { name: 'Received',  value: purchases.filter(p => p.status === 'RECEIVED').length },
    { name: 'Pending',   value: purchases.filter(p => p.status === 'PENDING').length },
    { name: 'Cancelled', value: purchases.filter(p => p.status === 'CANCELLED').length },
  ]

  const statCard = (label, value, Icon, color) => (
    <div className="card">
      <div className={`stat-icon ${color} mb-3`}><Icon className="w-6 h-6"/></div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3"><BarChart2 className="w-7 h-7 text-primary-600"/>Reports & Analytics</h1>
          <p className="page-subtitle">Comprehensive inventory and transaction analytics</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-slate-100"/>)}
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {statCard('Total Purchase Value', '₹' + totalPurchase.toLocaleString('en-IN', {maximumFractionDigits:0}), ShoppingCart, 'bg-blue-50 text-blue-600')}
            {statCard('Total Sales Revenue',  '₹' + totalSales.toLocaleString('en-IN', {maximumFractionDigits:0}),    Receipt,      'bg-emerald-50 text-emerald-600')}
            {statCard('Total Inventory SKUs', totalItems, Package, 'bg-purple-50 text-purple-600')}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Payment methods pie */}
            <div className="card">
              <h3 className="text-base font-semibold text-slate-800 mb-5">Sales by Payment Method</h3>
              {paymentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={paymentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name}: ${value}`}>
                      {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-slate-400 text-sm text-center py-12">No sales data</p>}
            </div>

            {/* Purchase status bar */}
            <div className="card">
              <h3 className="text-base font-semibold text-slate-800 mb-5">Purchase Order Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={purchaseStatus} margin={{ top:5, right:10, bottom:5, left:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'#94a3b8' }}/>
                  <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} allowDecimals={false}/>
                  <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', fontSize:12 }}/>
                  <Bar dataKey="value" fill="#3b82f6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory summary table */}
          <div className="card">
            <h3 className="text-base font-semibold text-slate-800 mb-5">Inventory Valuation Summary</h3>
            <div className="table-container">
              <table className="table">
                <thead><tr>
                  <th>#</th><th>Medicine</th><th>Current Stock</th><th>Min Stock</th><th>Expiry</th><th>Stock Status</th>
                </tr></thead>
                <tbody>
                  {inventory.slice(0, 15).map((inv, idx) => {
                    const isLow = inv.quantity <= inv.minQuantity
                    const isExp = inv.expiryDate && new Date(inv.expiryDate) <= new Date(Date.now() + 90*24*60*60*1000)
                    return (
                      <tr key={inv.id}>
                        <td className="text-slate-400 text-xs">{idx+1}</td>
                        <td className="font-medium">{inv.medicine?.name}</td>
                        <td className={`font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>{inv.quantity}</td>
                        <td className="text-slate-500">{inv.minQuantity}</td>
                        <td className={`text-sm ${isExp ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>{inv.expiryDate || '—'}</td>
                        <td>
                          <span className={`badge ${isLow ? 'badge-red' : isExp ? 'badge-yellow' : 'badge-green'}`}>
                            {isLow ? 'Low' : isExp ? 'Expiring' : 'OK'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
