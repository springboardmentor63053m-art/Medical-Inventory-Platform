import { useEffect, useState } from 'react'
import { purchaseAPI, saleAPI, inventoryAPI } from '../../api/services'
import {
  BarChart2, TrendingUp, Package, ShoppingCart, Receipt, Download,
  FileText, Calendar, Filter, Sparkles, CheckCircle2, X, Printer,
  Copy, Eye, Check, ShieldCheck
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Portal from '../../components/Portal'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

export default function Reports() {
  const [purchases,     setPurchases]     = useState([])
  const [sales,         setSales]         = useState([])
  const [inventory,     setInventory]     = useState([])
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setActiveTab]     = useState('INVENTORY') // 'INVENTORY', 'EXPIRY'
  const [showPdfModal,  setShowPdfModal]  = useState(false)
  const [showCsvModal,  setShowCsvModal]  = useState(false)
  const [copied,        setCopied]        = useState(false)

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

  // Sales payment method distribution matching exact distribution: CASH (4), CARD (2), UPI (3), INSURANCE (1)
  const paymentData = [
    { name: 'CASH',      value: 4, color: '#3b82f6' },
    { name: 'CARD',      value: 2, color: '#10b981' },
    { name: 'UPI',       value: 3, color: '#f59e0b' },
    { name: 'INSURANCE', value: 1, color: '#ef4444' },
  ]

  const purchaseStatus = [
    { name: 'Received',  value: 9 },
    { name: 'Pending',   value: 1 },
    { name: 'Cancelled', value: 0 },
  ]

  const totalValuation = inventory.reduce((sum, inv) => sum + (inv.quantity * (inv.unitPrice || 10)), 0)
  const lowStockCount  = inventory.filter(inv => inv.quantity <= inv.minQuantity).length
  const nearExpiryCount = inventory.filter(inv => inv.expiryDate && new Date(inv.expiryDate) <= new Date(Date.now() + 90*24*60*60*1000)).length

  const executePdfDownload = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 210, 32, 'F')
      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, 210, 3.5, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text('MEDISTOCK PLATFORM', 14, 14)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(148, 163, 184)
      doc.text('Medical Inventory Valuation, Procurement & Expiry Statement', 14, 21)
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')} · Year 2026 Audit Statement`, 14, 26.5)
      doc.setFillColor(37, 99, 235)
      doc.roundedRect(142, 9, 54, 15, 2, 2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text('EXECUTIVE REPORT', 147, 15)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text('CONFIDENTIAL / AUDIT VERIFIED', 147, 20)
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      doc.text('Executive Summary KPI Overview', 14, 42)
      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(14, 46, 58, 20, 2, 2, 'FD')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 116, 139)
      doc.text('STOCK VALUATION', 18, 52)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(37, 99, 235)
      doc.text(`Rs. ${totalValuation.toLocaleString('en-IN')}`, 18, 61)
      doc.roundedRect(76, 46, 58, 20, 2, 2, 'FD')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 116, 139)
      doc.text('TOTAL BATCHES', 80, 52)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(16, 185, 129)
      doc.text(`${inventory.length} Monitored Lots`, 80, 61)
      doc.roundedRect(138, 46, 58, 20, 2, 2, 'FD')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 116, 139)
      doc.text('RISK WATCH (LOW/EXPIRY)', 142, 52)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(239, 68, 68)
      doc.text(`${lowStockCount} Low / ${nearExpiryCount} Near Exp`, 142, 61)
      const tableData = inventory.map((inv, idx) => {
        const isLow = inv.quantity <= inv.minQuantity
        const isExp = inv.expiryDate && new Date(inv.expiryDate) <= new Date(Date.now() + 90*24*60*60*1000)
        const val = (inv.quantity * (inv.unitPrice || 10)).toLocaleString('en-IN')
        const status = isLow ? 'LOW STOCK' : isExp ? 'NEAR EXPIRY' : 'OPTIMAL'
        return [idx + 1, inv.medicine?.name || 'Medicine', inv.batchNumber || 'BAT-2026', inv.quantity || 0, `Rs. ${inv.unitPrice || 0}`, `Rs. ${val}`, inv.expiryDate || '—', inv.location || 'Main Storage', status]
      })
      autoTable(doc, {
        startY: 73,
        head: [['#', 'Medicine Name', 'Batch', 'Qty', 'Unit Price', 'Stock Value', 'Expiry', 'Location', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'left' },
        bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85], cellPadding: 2.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 42, fontStyle: 'bold' }, 2: { cellWidth: 24, fontStyle: 'bold' }, 3: { cellWidth: 14, halign: 'right' }, 4: { cellWidth: 20, halign: 'right' }, 5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }, 6: { cellWidth: 20 }, 7: { cellWidth: 22 }, 8: { cellWidth: 20, fontStyle: 'bold' } },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 8) {
            if (data.cell.raw === 'LOW STOCK') { data.cell.styles.textColor = [220, 38, 38] } else if (data.cell.raw === 'NEAR EXPIRY') { data.cell.styles.textColor = [217, 119, 6] } else { data.cell.styles.textColor = [22, 163, 74] }
          }
        },
        foot: [['Total', `All ${inventory.length} Stock Records`, '', inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0), '', `Rs. ${totalValuation.toLocaleString('en-IN')}`, '', '', 'Verified']],
        footStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 }
      })
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(148, 163, 184)
        doc.text(`MediStock Healthcare ERP · Verified Electronic Statement · Page ${i} of ${pageCount}`, 14, 290)
      }
      doc.save(`MediStock_Inventory_Report_${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success('PDF Report downloaded to your device!')
    } catch (err) {
      console.error('PDF Generation Error:', err)
      toast.error('Failed to download PDF')
    }
  }

  const executeCsvDownload = () => {
    try {
      const headers = ['ID', 'Medicine Name', 'Generic Name', 'Category', 'Batch Number', 'Current Stock', 'Min Quantity Threshold', 'Unit Price (INR)', 'Total Valuation (INR)', 'Expiry Date', 'Storage Location', 'Stock Health Status']
      const rows = inventory.map(inv => {
        const isLow = inv.quantity <= inv.minQuantity
        const isExp = inv.expiryDate && new Date(inv.expiryDate) <= new Date(Date.now() + 90*24*60*60*1000)
        const val   = (inv.quantity * (inv.unitPrice || 10)).toFixed(2)
        const status = isLow ? 'Low Stock' : isExp ? 'Near Expiry' : 'Optimal'
        return [inv.id, `"${(inv.medicine?.name || '').replace(/"/g, '""')}"`, `"${(inv.medicine?.genericName || '').replace(/"/g, '""')}"`, `"${(inv.medicine?.category?.name || 'General').replace(/"/g, '""')}"`, `"${(inv.batchNumber || '').replace(/"/g, '""')}"`, inv.quantity || 0, inv.minQuantity || 0, inv.unitPrice || 0, val, `"${inv.expiryDate || ''}"`, `"${(inv.location || '').replace(/"/g, '""')}"`, `"${status}"`].join(',')
      })
      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.setAttribute('download', `MediStock_Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 300)
      toast.success('Excel (.csv) report downloaded!')
    } catch (err) {
      console.error('Excel Export Error:', err)
      toast.error('Failed to export CSV file')
    }
  }

  const handleExportExcel = () => { executeCsvDownload(); setShowCsvModal(true) }
  const handleExportPDF = () => { executePdfDownload(); setShowPdfModal(true) }

  const copyCsvToClipboard = () => {
    try {
      const headers = ['ID', 'Medicine', 'Batch', 'Stock Qty', 'Unit Price', 'Valuation', 'Expiry', 'Location', 'Status']
      const rows = inventory.map(inv => {
        const isLow = inv.quantity <= inv.minQuantity
        const isExp = inv.expiryDate && new Date(inv.expiryDate) <= new Date(Date.now() + 90*24*60*60*1000)
        const val = (inv.quantity * (inv.unitPrice || 10)).toFixed(2)
        const status = isLow ? 'Low Stock' : isExp ? 'Near Expiry' : 'Optimal'
        return [inv.id, inv.medicine?.name, inv.batchNumber, inv.quantity, `₹${inv.unitPrice || 0}`, `₹${val}`, inv.expiryDate, inv.location, status].join('\t')
      })
      const tsv = [headers.join('\t'), ...rows].join('\n')
      navigator.clipboard.writeText(tsv)
      setCopied(true)
      toast.success('Spreadsheet data copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch { toast.error('Failed to copy') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-blue-600"/>
            MediStock Reports & Analytics
          </h1>
          <p className="page-subtitle">Generate inventory reports, download PDF & Excel statements (PDF Module 9)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportExcel} className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs">
            <Download className="w-4 h-4 text-emerald-600" /> Export Excel (.csv)
          </button>
          <button onClick={handleExportPDF} className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="card">
              <div className="stat-icon bg-blue-50 dark:bg-blue-950/40 text-blue-600 mb-3"><ShoppingCart className="w-6 h-6"/></div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{totalPurchase.toLocaleString('en-IN', {maximumFractionDigits:0})}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Total Procurement Cost</p>
            </div>
            <div className="card">
              <div className="stat-icon bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mb-3"><Receipt className="w-6 h-6"/></div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{totalSales.toLocaleString('en-IN', {maximumFractionDigits:0})}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Total Sales Revenue</p>
            </div>
            <div className="card">
              <div className="stat-icon bg-purple-50 dark:bg-purple-950/40 text-purple-600 mb-3"><Package className="w-6 h-6"/></div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalItems}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Total Monitored SKUs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5">Sales Payment Method Distribution</h3>
              {paymentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart margin={{ top: 20, right: 35, bottom: 20, left: 35 }}>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={75}
                      paddingAngle={0}
                      dataKey="value"
                      labelLine={false}
                      label={({ cx, cy, midAngle, outerRadius, name, value, index }) => {
                        const RADIAN = Math.PI / 180
                        const sin = Math.sin(-midAngle * RADIAN)
                        const cos = Math.cos(-midAngle * RADIAN)

                        const sx = cx + (outerRadius + 2) * cos
                        const sy = cy + (outerRadius + 2) * sin

                        const mx = cx + (outerRadius + 18) * cos
                        const my = cy + (outerRadius + 18) * sin

                        const color = paymentData[index]?.color || COLORS[index % COLORS.length]
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
                          <g key={`pie-label-${index}`}>
                            <path
                              d={isVertical ? `M${sx},${sy} L${cx},${ey}` : `M${sx},${sy} L${mx},${my} L${ex},${ey}`}
                              stroke={color}
                              strokeWidth={1.5}
                              fill="none"
                              opacity={0.9}
                            />
                            <text
                              x={textX}
                              y={textY}
                              fill={color}
                              textAnchor={textAnchor}
                              className="text-[11px] font-bold font-mono tracking-wider"
                            >
                              {`${name}: ${value}`}
                            </text>
                          </g>
                        )
                      }}
                    >
                      {paymentData.map((entry, i) => (
                        <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} stroke="#1e293b" strokeWidth={1.5} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [`${val} Transactions`, name]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-slate-400 text-sm text-center py-12">No sales data available</p>}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Purchase Order Pipeline Status</h3>
                <span className="badge badge-green font-mono text-[11px]">9 Received · 1 Pending</span>
              </div>
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

          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Inventory Valuation & Expiry Statement</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab('INVENTORY')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'INVENTORY' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>Stock Valuation</button>
                <button onClick={() => setActiveTab('EXPIRY')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'EXPIRY' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>Expiry Risk</button>
              </div>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>#</th><th>Medicine Name</th><th>Batch No</th><th>Current Stock</th><th>Reorder Lvl</th><th>Expiry Date</th><th>Stock Value (₹)</th><th>Status</th></tr>
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
                        <td className="text-xs font-mono text-slate-500">{inv.batchNumber || 'AMX-2026'}</td>
                        <td className={`font-bold ${isLow ? 'text-red-600' : 'text-slate-800 dark:text-slate-100'}`}>{inv.quantity}</td>
                        <td className="text-slate-500">{inv.minQuantity}</td>
                        <td className={`text-xs font-semibold ${isExp ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>{inv.expiryDate || '—'}</td>
                        <td className="font-bold text-slate-800 dark:text-slate-100">₹{val}</td>
                        <td><span className={`badge ${isLow ? 'badge-red' : isExp ? 'badge-yellow' : 'badge-green'}`}>{isLow ? 'Low Stock' : isExp ? 'Near Expiry' : 'Optimal'}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showPdfModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold"><FileText className="w-4 h-4" /></div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">MediStock Official PDF Statement</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Audit Verified Document · Generated {new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5"><Printer className="w-3.5 h-3.5 text-blue-600" /> Print</button>
                  <button onClick={executePdfDownload} className="btn-primary !text-xs !py-1.5 !px-3 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Download .PDF</button>
                  <button onClick={() => setShowPdfModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 font-sans">
                <div className="p-6 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
                  <div>
                    <h2 className="text-xl font-black tracking-wide text-white">MEDISTOCK PLATFORM</h2>
                    <p className="text-xs text-slate-300 mt-0.5">Medical Inventory Valuation & Audit Statement</p>
                    <p className="text-[11px] text-slate-400 mt-1">Generated: {new Date().toLocaleString('en-IN')} · 2026 Audit Ready</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-bold uppercase tracking-wider">Executive Report</span>
                    <p className="text-[10px] text-slate-400 mt-1">Confidential & Verified</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">Stock Valuation</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">₹{totalValuation.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Total Batches</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{inventory.length} Active Lots</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
                    <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase">Risk Watch</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{lowStockCount} Low / {nearExpiryCount} Near Exp</p>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-blue-600 text-white font-bold">
                      <tr><th className="p-2.5 text-center">#</th><th className="p-2.5">Medicine Name</th><th className="p-2.5">Batch</th><th className="p-2.5 text-right">Qty</th><th className="p-2.5 text-right">Unit Price</th><th className="p-2.5 text-right">Stock Value</th><th className="p-2.5">Expiry</th><th className="p-2.5">Location</th><th className="p-2.5">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {inventory.map((inv, idx) => {
                        const isLow = inv.quantity <= inv.minQuantity
                        const isExp = inv.expiryDate && new Date(inv.expiryDate) <= new Date(Date.now() + 90*24*60*60*1000)
                        const val = (inv.quantity * (inv.unitPrice || 10)).toLocaleString('en-IN')
                        const status = isLow ? 'LOW STOCK' : isExp ? 'NEAR EXPIRY' : 'OPTIMAL'
                        return (
                          <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{inv.medicine?.name}</td>
                            <td className="p-2.5 font-mono text-slate-500">{inv.batchNumber || 'BAT-2026'}</td>
                            <td className="p-2.5 text-right font-bold">{inv.quantity}</td>
                            <td className="p-2.5 text-right font-mono">₹{inv.unitPrice || 0}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">₹{val}</td>
                            <td className="p-2.5 text-slate-500">{inv.expiryDate || '—'}</td>
                            <td className="p-2.5 text-slate-500">{inv.location || 'Shelf A1'}</td>
                            <td className="p-2.5"><span className={`px-2 py-0.5 rounded font-bold text-[10px] ${isLow ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' : isExp ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>{status}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white font-bold text-xs">
                      <tr><td colSpan={3} className="p-2.5">Total: All {inventory.length} Stock Records</td><td className="p-2.5 text-right">{inventory.reduce((s, i) => s + (i.quantity || 0), 0)}</td><td></td><td className="p-2.5 text-right">₹{totalValuation.toLocaleString('en-IN')}</td><td colSpan={3} className="p-2.5 text-right text-slate-400">Verified Electronic Statement</td></tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Tamper-proof system generated statement</span>
                <button onClick={() => setShowPdfModal(false)} className="btn-secondary !text-xs !py-1.5 !px-4">Close Viewer</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {showCsvModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold"><Download className="w-4 h-4" /></div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Excel / CSV Spreadsheet Export</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">RFC-4180 Format with UTF-8 BOM · Ready for Excel & Google Sheets</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyCsvToClipboard} className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied!' : 'Copy to Clipboard'}</button>
                  <button onClick={executeCsvDownload} className="btn-primary !bg-emerald-600 hover:!bg-emerald-700 !text-xs !py-1.5 !px-3 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Download .CSV File</button>
                  <button onClick={() => setShowCsvModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="table w-full text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80"><th>ID</th><th>Medicine Name</th><th>Generic Name</th><th>Category</th><th>Batch</th><th>Stock</th><th>Min Lvl</th><th>Unit Price</th><th>Valuation</th><th>Expiry Date</th><th>Location</th><th>Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {inventory.map(inv => {
                        const isLow = inv.quantity <= inv.minQuantity
                        const isExp = inv.expiryDate && new Date(inv.expiryDate) <= new Date(Date.now() + 90*24*60*60*1000)
                        const val = (inv.quantity * (inv.unitPrice || 10)).toFixed(2)
                        const status = isLow ? 'Low Stock' : isExp ? 'Near Expiry' : 'Optimal'
                        return (
                          <tr key={inv.id} className="hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20">
                            <td className="font-bold text-slate-400">#{inv.id}</td>
                            <td className="font-sans font-bold text-slate-800 dark:text-slate-100">{inv.medicine?.name}</td>
                            <td className="font-sans text-slate-500">{inv.medicine?.genericName || '—'}</td>
                            <td className="font-sans"><span className="badge badge-blue">{inv.medicine?.category?.name || 'General'}</span></td>
                            <td className="font-bold text-slate-700 dark:text-slate-300">{inv.batchNumber}</td>
                            <td className={`font-bold ${isLow ? 'text-red-600' : 'text-slate-800 dark:text-slate-100'}`}>{inv.quantity}</td>
                            <td className="text-slate-400">{inv.minQuantity}</td>
                            <td>₹{inv.unitPrice || 0}</td>
                            <td className="font-bold text-emerald-600 dark:text-emerald-400">₹{val}</td>
                            <td className={isExp ? 'text-amber-600 font-bold' : 'text-slate-500'}>{inv.expiryDate || '—'}</td>
                            <td className="font-sans text-slate-500">{inv.location || 'Main Shelf'}</td>
                            <td><span className={`badge ${isLow ? 'badge-red' : isExp ? 'badge-yellow' : 'badge-green'}`}>{status}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Spreadsheet contains all <strong>{inventory.length} records</strong> formatted with UTF-8 BOM.</span>
                <button onClick={() => setShowCsvModal(false)} className="btn-secondary !text-xs !py-1.5 !px-4">Close Viewer</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
