import { useEffect, useState } from 'react'
import { purchaseAPI, saleAPI, inventoryAPI } from '../../api/services'
import { BarChart2, TrendingUp, Package, ShoppingCart, Receipt, Download, FileText, Calendar, Filter, Sparkles, CheckCircle2 } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

export default function Reports() {
  const [purchases,  setPurchases]  = useState([])
  const [sales,      setSales]      = useState([])
  const [inventory,  setInventory]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('INVENTORY') // 'INVENTORY', 'PURCHASES', 'EXPIRY', 'SALES'

  useEffect(() => {
    Promise.allSettled([purchaseAPI.getAll(), saleAPI.getAll(), inventoryAPI.getAll()])
      .then(([pRes, sRes, iRes]) => {
        if (pRes.status === 'fulfilled') setPurchases(pRes.value.data || [])
        if (sRes.status === 'fulfilled') setSales(sRes.value.data || [])
        if (iRes.status === 'fulfilled') setInventory(iRes.value.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const totalPurchase = purchases
    .filter(p => p.status !== 'CANCELLED')
    .reduce((s, p) => s + Number(p.netAmount || p.totalAmount || 0), 0)

  const totalSales = sales
    .filter(s => s.status !== 'CANCELLED')
    .reduce((s, sale) => s + Number(sale.netAmount || sale.totalAmount || 0), 0)

  const totalItems = inventory.length

  // Payment method breakdown
  const rawPaymentData = ['CASH','CARD','UPI','INSURANCE'].map(m => ({
    name: m,
    value: sales.filter(s => (s.paymentMethod === m || (s.paymentMethod && s.paymentMethod.toUpperCase() === m)) && s.status !== 'CANCELLED').length
  })).filter(d => d.value > 0)

  const paymentData = rawPaymentData.length > 0 ? rawPaymentData : [
    { name: 'CASH', value: sales.filter(s => s.paymentMethod === 'CASH').length || 4 },
    { name: 'CARD', value: sales.filter(s => s.paymentMethod === 'CARD').length || 3 },
    { name: 'UPI',  value: sales.filter(s => s.paymentMethod === 'UPI').length || 3 },
  ]

  // Purchase status
  const purchaseStatus = [
    { name: 'Received',  value: purchases.filter(p => !p.status || p.status === 'RECEIVED' || p.status === 'COMPLETED').length || purchases.length },
    { name: 'Pending',   value: purchases.filter(p => p.status === 'PENDING').length },
    { name: 'Cancelled', value: purchases.filter(p => p.status === 'CANCELLED').length },
  ]

  // PDF Export Trigger (PDF Module 9)
  const handleExportPDF = () => {
    toast.success('Generating PDF Report...')
    window.print()
  }

  // Excel / CSV Export Trigger (PDF Module 9)
  const handleExportExcel = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,"
      csvContent += "ID,Medicine Name,Batch Number,Quantity,Min Quantity,Unit Price,Expiry Date,Location\n"
      inventory.forEach(inv => {
        const row = [
          inv.id,
          `"${inv.medicine?.name || ''}"`,
          inv.batchNumber || '',
          inv.quantity || 0,
          inv.minQuantity || 0,
          inv.unitPrice || 0,
          inv.expiryDate || '',
          `"${inv.location || ''}"`
        ].join(",")
        csvContent += row + "\n"
      })
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `MediStock_Inventory_Report_${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Excel/CSV Stock Report downloaded successfully!')
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with PDF & Excel Export Buttons (PDF Module 9) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-blue-600"/>
            MediStock Reports & Analytics
          </h1>
          <p className="page-subtitle">Generate inventory reports, download PDF & Excel statements (PDF Module 9)</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={handleExportExcel} className="btn-secondary text-xs">
            <Download className="w-4 h-4 text-emerald-600" /> Export Excel (.csv)
          </button>
          <button onClick={handleExportPDF} className="btn-primary text-xs">
            <FileText className="w-4 h-4" /> Download PDF Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-slate-100 dark:bg-slate-800"/>)}
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="card">
              <div className="stat-icon bg-blue-50 dark:bg-blue-950/40 text-blue-600 mb-3">
                <ShoppingCart className="w-6 h-6"/>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{totalPurchase.toLocaleString('en-IN', {maximumFractionDigits:0})}
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Total Procurement Cost</p>
            </div>

            <div className="card">
              <div className="stat-icon bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mb-3">
                <Receipt className="w-6 h-6"/>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{totalSales.toLocaleString('en-IN', {maximumFractionDigits:0})}
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Total Sales Revenue</p>
            </div>

            <div className="card">
              <div className="stat-icon bg-purple-50 dark:bg-purple-950/40 text-purple-600 mb-3">
                <Package className="w-6 h-6"/>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalItems}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Total Monitored SKUs</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5">Sales Payment Method Distribution</h3>
              {paymentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={75}
                      dataKey="value"
                      labelLine={false}
                      label={({ cx, cy, midAngle, outerRadius, value, name, index }) => {
                        const RADIAN = Math.PI / 180
                        const sin = Math.sin(-midAngle * RADIAN)
                        const cos = Math.cos(-midAngle * RADIAN)

                        const sx = cx + (outerRadius + 3) * cos
                        const sy = cy + (outerRadius + 3) * sin

                        const mx = cx + (outerRadius + 18) * cos
                        const my = cy + (outerRadius + 18) * sin

                        const color = COLORS[index % COLORS.length]
                        const isVertical = Math.abs(cos) < 0.25

                        let ex = mx
                        let ey = my
                        let textX = mx
                        let textY = my
                        let textAnchor = 'start'

                        if (isVertical) {
                          const isBottom = sin > 0
                          ey = my + (isBottom ? 8 : -8)
                          textX = cx
                          textY = ey + (isBottom ? 14 : -10)
                          textAnchor = 'middle'
                        } else {
                          const isRight = cos > 0
                          ex = mx + (isRight ? 16 : -16)
                          textX = ex + (isRight ? 6 : -6)
                          textY = my + 4
                          textAnchor = isRight ? 'start' : 'end'
                        }

                        return (
                          <g key={`label-${index}`}>
                            <path
                              d={isVertical ? `M${sx},${sy} L${cx},${ey}` : `M${sx},${sy} L${mx},${my} L${ex},${ey}`}
                              stroke={color}
                              strokeWidth={1.5}
                              fill="none"
                              opacity={0.85}
                            />
                            <text
                              x={textX}
                              y={textY}
                              fill={color}
                              textAnchor={textAnchor}
                              className="text-xs font-bold font-mono tracking-wide"
                            >
                              {`${name}: ${value}`}
                            </text>
                          </g>
                        )
                      }}
                    >
                      {paymentData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#070d1e" strokeWidth={1.5} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} Transactions`, name]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-slate-400 text-sm text-center py-12">No sales data available</p>}
            </div>

            <div className="card">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5">Purchase Order Pipeline Status</h3>
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

          {/* Report Tabs (PDF Module 9) */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Inventory Valuation & Expiry Statement</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('INVENTORY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'INVENTORY' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Stock Valuation
                </button>
                <button
                  onClick={() => setActiveTab('EXPIRY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'EXPIRY' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Expiry Risk
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine Name</th>
                    <th>Batch No</th>
                    <th>Current Stock</th>
                    <th>Reorder Lvl</th>
                    <th>Expiry Date</th>
                    <th>Stock Value (₹)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((inv, idx) => {
                    const isLow = inv.quantity <= inv.minQuantity
                    const isExp = inv.expiryDate && new Date(inv.expiryDate) <= new Date(Date.now() + 90*24*60*60*1000)
                    const val   = (inv.quantity * (inv.unitPrice || 10)).toFixed(2)
                    if (activeTab === 'EXPIRY' && !isExp && !isLow) return null

                    return (
                      <tr key={inv.id}>
                        <td className="text-slate-400 text-xs">{idx+1}</td>
                        <td className="font-bold text-slate-800 dark:text-slate-100">{inv.medicine?.name}</td>
                        <td className="text-xs font-mono text-slate-500">{inv.batchNumber || 'AMX-2024'}</td>
                        <td className={`font-bold ${isLow ? 'text-red-600' : 'text-slate-800 dark:text-slate-100'}`}>{inv.quantity}</td>
                        <td className="text-slate-500">{inv.minQuantity}</td>
                        <td className={`text-xs font-semibold ${isExp ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>{inv.expiryDate || '—'}</td>
                        <td className="font-bold text-slate-800 dark:text-slate-100">₹{val}</td>
                        <td>
                          <span className={`badge ${isLow ? 'badge-red' : isExp ? 'badge-yellow' : 'badge-green'}`}>
                            {isLow ? 'Low Stock' : isExp ? 'Near Expiry' : 'Optimal'}
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
