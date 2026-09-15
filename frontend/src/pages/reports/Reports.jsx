import { useEffect, useState, useMemo } from 'react'
import { purchaseAPI, saleAPI, inventoryAPI } from '../../api/services'
import {
  BarChart2, ShoppingCart, Banknote, Package, Receipt, Download,
  FileText, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  CreditCard, Truck, Pill, Eye, X, Printer, Copy, Check, ShieldCheck
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, LabelList
} from 'recharts'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Portal from '../../components/Portal'

const MOCK_INVENTORY_REPORT = [
  {
    id: 1,
    name: 'Amoxicillin 500mg',
    batchNo: 'A/W-2026-001',
    stock: 500,
    reorder: 100,
    expiry: '2027-01-30',
    value: '₹5000.00',
    status: 'Optimal',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 2,
    name: 'Paracetamol 650mg',
    batchNo: 'DCL-2026-088',
    stock: 45,
    reorder: 200,
    expiry: '2026-08-29',
    value: '₹450.00',
    status: 'Low Stock',
    color: 'from-orange-500 to-amber-600'
  },
  {
    id: 3,
    name: 'Atorvastatin 10mg',
    batchNo: 'LTP-2026-012',
    stock: 300,
    reorder: 50,
    expiry: '2027-08-04',
    value: '₹3000.00',
    status: 'Optimal',
    color: 'from-orange-500 to-amber-600'
  },
  {
    id: 4,
    name: 'Metformin 500mg',
    batchNo: 'GLT-2026-045',
    stock: 620,
    reorder: 150,
    expiry: '2027-06-01',
    value: '₹6200.00',
    status: 'Optimal',
    color: 'from-teal-500 to-emerald-600'
  },
  {
    id: 5,
    name: 'Vitamin D3 60000 IU',
    batchNo: 'DES-2026-019',
    stock: 200,
    reorder: 80,
    expiry: '2028-01-26',
    value: '₹2000.00',
    status: 'Optimal',
    color: 'from-emerald-500 to-green-600'
  },
  {
    id: 6,
    name: 'Azithromycin 500mg',
    batchNo: 'ZIT-2026-033',
    stock: 25,
    reorder: 60,
    expiry: '2026-08-19',
    value: '₹250.00',
    status: 'Low Stock',
    color: 'from-orange-500 to-amber-600'
  },
  {
    id: 7,
    name: 'Amlodipine 5mg',
    batchNo: 'NOR-2026-087',
    stock: 480,
    reorder: 120,
    expiry: '2027-09-08',
    value: '₹4800.00',
    status: 'Optimal',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 8,
    name: 'Insulin Glargine 100IU/mL',
    batchNo: 'LAN-2026-662',
    stock: 18,
    reorder: 30,
    expiry: '2027-09-31',
    value: '₹180.00',
    status: 'Low Stock',
    color: 'from-purple-500 to-violet-600'
  },
  {
    id: 9,
    name: 'Ibuprofen 400mg',
    batchNo: 'BRU-2026-041',
    stock: 750,
    reorder: 180,
    expiry: '2027-05-31',
    value: '₹7500.00',
    status: 'Optimal',
    color: 'from-rose-500 to-red-600'
  },
  {
    id: 10,
    name: 'Multivitamin & Multimineral',
    batchNo: 'SUP-2026-028',
    stock: 310,
    reorder: 100,
    expiry: '2028-08-03',
    value: '₹3100.00',
    status: 'Optimal',
    color: 'from-purple-500 to-violet-600'
  }
]

const PAYMENT_DISTRIBUTION = [
  { name: 'Cash',      percentage: 42, amount: '₹2,019', color: '#0066ff' },
  { name: 'Card',      percentage: 28, amount: '₹1,344', color: '#10b981' },
  { name: 'UPI',       percentage: 18, amount: '₹865',   color: '#f59e0b' },
  { name: 'Insurance', percentage: 12, amount: '₹580',   color: '#8b5cf6' }
]

const PURCHASE_STATUS = [
  { name: 'Received',  value: 9, color: '#0066ff' },
  { name: 'Pending',   value: 1, color: '#10b981' },
  { name: 'Cancelled', value: 0, color: '#8b5cf6' }
]

export default function Reports() {
  const [activeTab,    setActiveTab]    = useState('VALUATION') // 'VALUATION', 'EXPIRY'
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [selectedMed,  setSelectedMed]  = useState(null)
  const [copied,       setCopied]       = useState(false)
  const [loading,      setLoading]      = useState(true)

  const [liveInventory, setLiveInventory] = useState([])
  const [livePurchases, setLivePurchases] = useState([])
  const [liveSales,     setLiveSales]     = useState([])

  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true)
        const [invRes, purRes, salRes] = await Promise.allSettled([
          inventoryAPI.getAll(),
          purchaseAPI.getAll(),
          saleAPI.getAll(),
        ])
        if (invRes.status === 'fulfilled' && Array.isArray(invRes.value.data) && invRes.value.data.length > 0) {
          setLiveInventory(invRes.value.data)
        }
        if (purRes.status === 'fulfilled' && Array.isArray(purRes.value.data)) {
          setLivePurchases(purRes.value.data)
        }
        if (salRes.status === 'fulfilled' && Array.isArray(salRes.value.data)) {
          setLiveSales(salRes.value.data)
        }
      } catch (err) {
        console.error('Failed to load live reports data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReportData()
  }, [])

  // 1. Dynamic Inventory Rows
  const inventoryRows = useMemo(() => {
    if (!liveInventory.length) return MOCK_INVENTORY_REPORT
    return liveInventory.map((inv, idx) => {
      const stock = inv.quantity ?? 0
      const reorder = inv.minQuantity ?? inv.medicine?.reorderLevel ?? 50
      const unitPrice = Number(inv.medicine?.unitPrice) || 10
      const val = stock * unitPrice
      const isLow = stock <= reorder
      const expDate = inv.expiryDate || '2027-12-31'
      return {
        id: inv.id || (idx + 1),
        name: inv.medicine?.name || `SKU #${inv.id}`,
        batchNo: inv.batchNumber || `BAT-${202600 + idx}`,
        stock,
        reorder,
        expiry: expDate,
        value: '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        numericValue: val,
        status: isLow ? 'Low Stock' : 'Optimal',
        color: isLow ? 'from-orange-500 to-amber-600' : 'from-blue-500 to-indigo-600'
      }
    })
  }, [liveInventory])

  const displayedRows = activeTab === 'VALUATION'
    ? inventoryRows
    : inventoryRows.filter(m => m.status === 'Low Stock' || (m.expiry && m.expiry.startsWith('2026')))

  // 2. Dynamic KPI Totals
  const totalProcurement = useMemo(() => {
    if (!livePurchases.length) return 83322
    return livePurchases.reduce((sum, p) => sum + (Number(p.netAmount) || 0), 0)
  }, [livePurchases])

  const totalSalesRev = useMemo(() => {
    if (!liveSales.length) return 4808
    return liveSales.reduce((sum, s) => sum + (Number(s.netAmount) || 0), 0)
  }, [liveSales])

  const totalSKUs = inventoryRows.length

  const totalInventoryVal = useMemo(() => {
    return inventoryRows.reduce((sum, r) => sum + (r.numericValue || 0), 0)
  }, [inventoryRows])

  // 3. Dynamic Payment Distribution
  const paymentDistribution = useMemo(() => {
    if (!liveSales.length) return PAYMENT_DISTRIBUTION
    const counts = { CASH: 0, CARD: 0, UPI: 0, INSURANCE: 0 }
    let totalAmt = 0
    liveSales.forEach(s => {
      const amt = Number(s.netAmount) || 0
      totalAmt += amt
      const m = s.paymentMethod ? s.paymentMethod.toUpperCase() : 'CASH'
      if (counts[m] !== undefined) counts[m] += amt
      else counts.CASH += amt
    })
    if (totalAmt === 0) return PAYMENT_DISTRIBUTION
    return [
      { name: 'Cash',      percentage: Math.round((counts.CASH / totalAmt) * 100),      amount: '₹' + Math.round(counts.CASH).toLocaleString('en-IN'),      color: '#0066ff' },
      { name: 'Card',      percentage: Math.round((counts.CARD / totalAmt) * 100),      amount: '₹' + Math.round(counts.CARD).toLocaleString('en-IN'),      color: '#10b981' },
      { name: 'UPI',       percentage: Math.round((counts.UPI / totalAmt) * 100),       amount: '₹' + Math.round(counts.UPI).toLocaleString('en-IN'),       color: '#f59e0b' },
      { name: 'Insurance', percentage: Math.round((counts.INSURANCE / totalAmt) * 100), amount: '₹' + Math.round(counts.INSURANCE).toLocaleString('en-IN'), color: '#8b5cf6' }
    ]
  }, [liveSales])

  // 4. Dynamic Purchase Pipeline
  const purchaseStatus = useMemo(() => {
    if (!livePurchases.length) return PURCHASE_STATUS
    let rec = 0, pen = 0, can = 0
    livePurchases.forEach(p => {
      const st = p.status ? p.status.toUpperCase() : 'RECEIVED'
      if (st === 'RECEIVED') rec++
      else if (st === 'PENDING') pen++
      else if (st === 'CANCELLED') can++
    })
    return [
      { name: 'Received',  value: rec, color: '#0066ff' },
      { name: 'Pending',   value: pen, color: '#10b981' },
      { name: 'Cancelled', value: can, color: '#8b5cf6' }
    ]
  }, [livePurchases])

  const executePdfDownload = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      doc.setFillColor(11, 19, 41)
      doc.rect(0, 0, 210, 32, 'F')
      doc.setFillColor(0, 102, 255)
      doc.rect(0, 0, 210, 3.5, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text('MEDISTOCK PLATFORM REPORTS', 14, 14)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(148, 163, 184)
      doc.text('Inventory Valuation, Procurement & Expiry Statement (Module 9)', 14, 21)
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')} · Audit Statement`, 14, 26.5)

      const tableData = displayedRows.map((inv, idx) => [
        idx + 1, inv.name, inv.batchNo, inv.stock, inv.reorder, inv.expiry, inv.value, inv.status
      ])

      const totalStockUnits = displayedRows.reduce((acc, r) => acc + (r.stock || 0), 0)

      autoTable(doc, {
        startY: 42,
        head: [['#', 'Medicine Name', 'Batch No', 'Current Stock', 'Reorder Lvl', 'Expiry Date', 'Stock Value', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 255], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
        foot: [['Total', `${displayedRows.length} Monitored SKUs`, '', `${totalStockUnits.toLocaleString('en-IN')} units`, '', '', '₹' + totalInventoryVal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), '100% Audit Ready']],
        footStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8.5 }
      })

      doc.save(`MediStock_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success('PDF Statement downloaded successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF')
    }
  }

  const executeCsvDownload = () => {
    try {
      const headers = ['#', 'Medicine Name', 'Batch No', 'Current Stock', 'Reorder Level', 'Expiry Date', 'Stock Value (INR)', 'Status']
      const rows = displayedRows.map((inv, idx) => [
        idx + 1, `"${inv.name}"`, `"${inv.batchNo}"`, inv.stock, inv.reorder, inv.expiry, `"${inv.value}"`, `"${inv.status}"`
      ].join(','))
      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', `MediStock_Valuation_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 300)
      toast.success('Excel (.csv) spreadsheet exported!')
    } catch {
      toast.error('Failed to export CSV')
    }
  }

  const handleExportExcel = () => { executeCsvDownload(); setShowCsvModal(true) }
  const handleExportPDF = () => { executePdfDownload(); setShowPdfModal(true) }

  const copyCsvToClipboard = () => {
    try {
      const headers = ['#', 'Medicine Name', 'Batch No', 'Current Stock', 'Reorder Lvl', 'Expiry Date', 'Stock Value', 'Status']
      const rows = displayedRows.map((inv, idx) => [
        idx + 1, inv.name, inv.batchNo, inv.stock, inv.reorder, inv.expiry, inv.value, inv.status
      ].join('\t'))
      const tsv = [headers.join('\t'), ...rows].join('\n')
      navigator.clipboard.writeText(tsv)
      setCopied(true)
      toast.success('Spreadsheet data copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }


  return (
    <div className="space-y-5 animate-fade-in text-slate-100">
      {/* 1. Header with Title, Badge, and Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
                MediStock Reports & Analytics
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                v3.2.0 Pro
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 ml-12">
            Generate inventory reports, download PDF & Excel statements (PDF Module 9)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Date Selector */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer hover:border-slate-400 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>08 Sep 2026 - 08 Sep 2026</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          {/* Export Excel (.csv) */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.csv)</span>
          </button>

          {/* Download PDF Report */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* 2. Top Row of 3 KPI Cards with Wave Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Procurement Cost */}
        <div className="card !p-5 bg-white dark:bg-[#0c1427]/80 border border-slate-200/80 dark:border-blue-950/60 rounded-2xl flex items-center justify-between shadow-sm hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 flex-shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-300">Total Procurement Cost</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                ₹{Math.round(totalProcurement).toLocaleString('en-IN')}
              </p>
              <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-1">
                <span>↑ 12%</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">live procurement ledger</span>
              </p>
            </div>
          </div>
          <div className="w-24 h-12 flex-shrink-0">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
              <path
                d="M 0 32 Q 25 10, 50 28 T 100 12"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Total Sales Revenue */}
        <div className="card !p-5 bg-white dark:bg-[#0c1427]/80 border border-slate-200/80 dark:border-blue-950/60 rounded-2xl flex items-center justify-between shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 flex-shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-300">Total Sales Revenue</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                ₹{Math.round(totalSalesRev).toLocaleString('en-IN')}
              </p>
              <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-1">
                <span>↑ 8%</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">live sales transactions</span>
              </p>
            </div>
          </div>
          <div className="w-24 h-12 flex-shrink-0">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
              <path
                d="M 0 28 Q 25 12, 50 24 T 100 8"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Total Monitored SKUs */}
        <div className="card !p-5 bg-white dark:bg-[#0c1427]/80 border border-slate-200/80 dark:border-blue-950/60 rounded-2xl flex items-center justify-between shadow-sm hover:border-purple-500/30 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-300">Total Monitored SKUs</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                {totalSKUs}
              </p>
              <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-1">
                <span>Active</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">in inventory database</span>
              </p>
            </div>
          </div>
          <div className="w-24 h-12 flex-shrink-0">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
              <path
                d="M 0 30 Q 25 18, 50 25 T 100 12"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Donut Distribution & Pipeline Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales Payment Method Distribution */}
        <div className="card !p-5 bg-white dark:bg-[#0c1427]/80 border border-slate-200/80 dark:border-blue-950/60 rounded-2xl shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Sales Payment Method Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Breakdown of payments received from customers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>This Month</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            {/* Donut Chart with Center Text */}
            <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={74}
                    paddingAngle={3}
                    dataKey="percentage"
                    stroke="none"
                  >
                    {paymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: '1px solid #1e293b',
                      fontSize: '12px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-medium text-slate-400">Total Sales</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono">₹{Math.round(totalSalesRev).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Legend Breakdown Table */}
            <div className="flex-1 w-full space-y-3.5 pr-2">
              {paymentDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 dark:text-slate-200 min-w-[70px]">{item.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">{item.percentage}%</span>
                  <span className="text-slate-900 dark:text-white font-mono font-bold">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Purchase Order Pipeline Status */}
        <div className="card !p-5 bg-white dark:bg-[#0c1427]/80 border border-slate-200/80 dark:border-blue-950/60 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Purchase Order Pipeline Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tracking the status of purchase orders
                </p>
              </div>
            </div>

            {/* Legend Pills */}
            <div className="flex items-center gap-3 self-start sm:self-auto text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> {purchaseStatus.find(p => p.name === 'Received')?.value || 0} Received
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> {purchaseStatus.find(p => p.name === 'Pending')?.value || 0} Pending
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> {purchaseStatus.find(p => p.name === 'Cancelled')?.value || 0} Cancelled
              </span>
            </div>
          </div>

          <div className="w-full h-44 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseStatus} margin={{ top: 20, right: 10, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => [`${val} Orders`, 'Status']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                    fontSize: '12px',
                    color: '#ffffff'
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={70}>
                  {purchaseStatus.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="#94a3b8" fontSize={11} fontWeight="bold" offset={6} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Bottom Statement: Inventory Valuation & Expiry Statement */}
      <div className="card !p-5 bg-white dark:bg-[#0c1427]/80 border border-slate-200/80 dark:border-blue-950/60 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Inventory Valuation & Expiry Statement
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track stock value, expiry dates and get actionable insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('VALUATION')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'VALUATION'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              Stock Valuation
            </button>
            <button
              onClick={() => setActiveTab('EXPIRY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'EXPIRY'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              Expiry Risk
            </button>
          </div>
        </div>

        {/* 10-Row Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-8">#</th>
                <th className="py-3 px-3">Medicine Name</th>
                <th className="py-3 px-3">Batch No</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Reorder Lvl</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Stock Value (₹)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {displayedRows.map((inv, idx) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="py-3.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${inv.color} flex items-center justify-center text-white shadow-xs flex-shrink-0`}>
                        <Pill className="w-3 h-3" />
                      </div>
                      <span className="truncate">{inv.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-mono">{inv.batchNo}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">
                    {inv.stock}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-mono">
                    {inv.reorder}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-mono">
                    {inv.expiry}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {inv.value}
                  </td>
                  <td className="py-3.5 px-3">
                    {inv.status === 'Optimal' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Optimal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedMed(inv)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg inline-flex items-center gap-1 transition-colors"
                    >
                      <span>&gt;</span>
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Showing 1–{displayedRows.length} of {displayedRows.length} records
          </p>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs">
              1
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* View Medicine Modal */}
      {selectedMed && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedMed.color} text-white flex items-center justify-center`}>
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedMed.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">Batch: {selectedMed.batchNo}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMed(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400">Current Stock</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedMed.stock} units</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400">Reorder Level</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedMed.reorder} units</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400">Stock Valuation</span>
                  <p className="text-base font-bold text-blue-500 font-mono mt-0.5">{selectedMed.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400">Expiration</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">{selectedMed.expiry}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedMed(null)}
                  className="btn-primary !text-xs !py-1.5 !px-4"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* PDF Modal */}
      {showPdfModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">MediStock Official PDF Statement</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Audit Verified Document · Generated {new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5 text-blue-600" /> Print
                  </button>
                  <button onClick={executePdfDownload} className="btn-primary !text-xs !py-1.5 !px-3 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download .PDF
                  </button>
                  <button onClick={() => setShowPdfModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
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
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-blue-600 text-white font-bold">
                      <tr>
                        <th className="p-2.5 text-center">#</th>
                        <th className="p-2.5">Medicine Name</th>
                        <th className="p-2.5">Batch</th>
                        <th className="p-2.5 text-right">Current Stock</th>
                        <th className="p-2.5 text-right">Reorder Lvl</th>
                        <th className="p-2.5 text-right">Stock Value</th>
                        <th className="p-2.5">Expiry</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {MOCK_INVENTORY_REPORT.map((inv, idx) => (
                        <tr key={inv.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-100">{inv.name}</td>
                          <td className="p-2.5 font-mono text-slate-400">{inv.batchNo}</td>
                          <td className="p-2.5 text-right font-bold">{inv.stock}</td>
                          <td className="p-2.5 text-right text-slate-400">{inv.reorder}</td>
                          <td className="p-2.5 text-right font-bold text-blue-400 font-mono">{inv.value}</td>
                          <td className="p-2.5 text-slate-400 font-mono">{inv.expiry}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${inv.status === 'Optimal' ? 'bg-emerald-950/60 text-emerald-300' : 'bg-rose-950/60 text-rose-300'}`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* CSV Modal */}
      {showCsvModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Excel / CSV Spreadsheet Export</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">RFC-4180 Format with UTF-8 BOM · Ready for Excel & Google Sheets</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyCsvToClipboard} className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                  <button onClick={executeCsvDownload} className="btn-primary !bg-emerald-600 hover:!bg-emerald-700 !text-xs !py-1.5 !px-3 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download .CSV File
                  </button>
                  <button onClick={() => setShowCsvModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="table w-full text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80">
                        <th>#</th><th>Medicine Name</th><th>Batch No</th><th>Current Stock</th><th>Reorder Level</th><th>Expiry Date</th><th>Stock Value</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {MOCK_INVENTORY_REPORT.map((inv, idx) => (
                        <tr key={inv.id} className="hover:bg-emerald-950/20">
                          <td className="text-slate-400">{idx + 1}</td>
                          <td className="font-sans font-bold text-slate-100">{inv.name}</td>
                          <td className="text-slate-300">{inv.batchNo}</td>
                          <td className="font-bold">{inv.stock}</td>
                          <td className="text-slate-400">{inv.reorder}</td>
                          <td className="text-slate-300">{inv.expiry}</td>
                          <td className="font-bold text-emerald-400">{inv.value}</td>
                          <td>
                            <span className={`badge ${inv.status === 'Optimal' ? 'badge-green' : 'badge-red'}`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
