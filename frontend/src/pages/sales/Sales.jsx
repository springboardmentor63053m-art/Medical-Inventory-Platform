import { useEffect, useState, useMemo } from 'react'
import { saleAPI, medicineAPI } from '../../api/services'
import {
  Receipt, Plus, X, XCircle, Trash2, Search, Filter, Eye,
  Printer, User, Phone, Calendar, CreditCard, ShoppingBag,
  CheckCircle2, AlertTriangle, ArrowRight, DollarSign, Clock,
  RefreshCw, ChevronLeft, ChevronRight as ChevronRightIcon, RotateCcw,
  TrendingUp, BarChart2
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell
} from 'recharts'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Sales() {
  const [sales,         setSales]         = useState([])
  const [medicines,     setMedicines]     = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('ALL')
  const [paymentFilter, setPaymentFilter] = useState('ALL')

  // Modals & Drawers
  const [showAddModal,      setShowAddModal]      = useState(false)
  const [showDeleteModal,   setShowDeleteModal]   = useState(false)
  const [showDetailModal,   setShowDetailModal]   = useState(false)
  const [showReturnModal,   setShowReturnModal]   = useState(false)
  const [selectedSale,      setSelectedSale]      = useState(null)
  const [saleToDelete,      setSaleToDelete]      = useState(null)
  const [saleToReturn,      setSaleToReturn]      = useState(null)
  const [submitting,        setSubmitting]        = useState(false)
  const [lastUpdated,       setLastUpdated]       = useState(new Date())

  // Pagination
  const PAGE_SIZE = 10
  const [currentPage, setCurrentPage] = useState(1)

  // New Sale Form state
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    saleDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    discount: 0,
    taxAmount: 0,
    notes: '',
    items: [
      { medicineId: '', quantity: 1, unitPrice: 0 }
    ]
  })

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, mRes] = await Promise.all([
        saleAPI.getAll().catch(() => ({ data: [] })),
        medicineAPI.getAll().catch(() => ({ data: [] }))
      ])
      setSales(Array.isArray(sRes.data) ? sRes.data : [])
      setMedicines(Array.isArray(mRes.data) ? mRes.data : [])
      setLastUpdated(new Date())
    } catch {
      toast.error('Failed to load sales records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreateModal = () => {
    const defaultMed = medicines[0]
    setForm({
      customerName: '',
      customerPhone: '',
      saleDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      discount: 0,
      taxAmount: 0,
      notes: '',
      items: [
        {
          medicineId: defaultMed?.id || '',
          quantity: 1,
          unitPrice: defaultMed?.mrp || defaultMed?.unitPrice || 20
        }
      ]
    })
    setShowAddModal(true)
  }

  const addItem = () => {
    const defaultMed = medicines[0]
    setForm(p => ({
      ...p,
      items: [
        ...p.items,
        {
          medicineId: defaultMed?.id || '',
          quantity: 1,
          unitPrice: defaultMed?.mrp || defaultMed?.unitPrice || 20
        }
      ]
    }))
  }

  const removeItem = (idx) => {
    if (form.items.length === 1) return toast.error('Sale must have at least one medicine item')
    setForm(p => ({
      ...p,
      items: p.items.filter((_, i) => i !== idx)
    }))
  }

  const updateItem = (idx, field, value) => {
    setForm(p => ({
      ...p,
      items: p.items.map((it, i) => {
        if (i !== idx) return it
        const updated = { ...it, [field]: value }
        if (field === 'medicineId') {
          const med = medicines.find(m => String(m.id) === String(value))
          if (med) updated.unitPrice = med.mrp || med.unitPrice || 20
        }
        return updated
      })
    }))
  }

  const calcSubtotal = () => {
    return form.items.reduce((sum, it) => sum + (Number(it.unitPrice || 0) * Number(it.quantity || 0)), 0)
  }

  const calcNetTotal = () => {
    return Math.max(0, calcSubtotal() - Number(form.discount || 0) + Number(form.taxAmount || 0))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.items.some(it => !it.medicineId || Number(it.quantity) <= 0)) {
      return toast.error('All items must have a selected medicine and valid quantity')
    }

    setSubmitting(true)
    try {
      const payload = {
        customerName: form.customerName || 'Walk-in Customer',
        customerPhone: form.customerPhone || 'N/A',
        saleDate: form.saleDate,
        paymentMethod: form.paymentMethod,
        discount: Number(form.discount || 0),
        taxAmount: Number(form.taxAmount || 0),
        notes: form.notes,
        items: form.items.map(it => ({
          medicine: { id: Number(it.medicineId) },
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice || 0)
        }))
      }

      await saleAPI.create(payload)
      toast.success('POS Sale & dispensing recorded successfully!')
      setShowAddModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sale failed — please check stock levels')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelSale = async (id) => {
    setSubmitting(true)
    try {
      await saleAPI.cancel(id)
      toast.success('Sale returned / cancelled — inventory stock restored')
      setShowReturnModal(false)
      setSaleToReturn(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel sale')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!saleToDelete) return
    setSubmitting(true)
    try {
      await saleAPI.delete(saleToDelete.id)
      toast.success(`Sale invoice #${saleToDelete.saleNumber} deleted`)
      setShowDeleteModal(false)
      setSaleToDelete(null)
      if (selectedSale?.id === saleToDelete.id) {
        setShowDetailModal(false)
        setSelectedSale(null)
      }
      load()
    } catch (err) {
      toast.error('Failed to delete sale invoice')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = (sale) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${sale.saleNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: 900; color: #059669; }
            .badge { background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #f8fafc; font-weight: bold; }
            .totals { margin-top: 20px; text-align: right; font-size: 13px; }
            .total-row { font-size: 18px; font-weight: 900; color: #059669; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">MediStock AI — Pharmacy Tax Invoice</div>
              <div style="font-size: 12px; color: #64748b;">Invoice #: ${sale.saleNumber}</div>
            </div>
            <div class="badge">${sale.status}</div>
          </div>

          <div class="grid">
            <div><strong>Customer Name:</strong> ${sale.customerName || 'Walk-in Customer'}</div>
            <div><strong>Date of Sale:</strong> ${sale.saleDate || '—'}</div>
            <div><strong>Customer Phone:</strong> ${sale.customerPhone || '—'}</div>
            <div><strong>Payment Mode:</strong> ${sale.paymentMethod || 'CASH'}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Medicine / Formulation</th>
                <th>Quantity</th>
                <th>Unit Price (MRP)</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${(sale.items || []).map(it => `
                <tr>
                  <td><strong>${it.medicine?.name || 'Pharmaceutical Item'}</strong></td>
                  <td>${it.quantity} units</td>
                  <td>₹${Number(it.unitPrice || 0).toFixed(2)}</td>
                  <td>₹${Number(it.totalPrice || (it.quantity * it.unitPrice) || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div>Subtotal: ₹${Number(sale.totalAmount || 0).toLocaleString('en-IN')}</div>
            <div>Tax: +₹${Number(sale.taxAmount || 0).toLocaleString('en-IN')}</div>
            <div>Discount: -₹${Number(sale.discount || 0).toLocaleString('en-IN')}</div>
            <div class="total-row">Total Paid: ₹${Number(sale.netAmount || 0).toLocaleString('en-IN')}</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Filter sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false
      if (paymentFilter !== 'ALL' && s.paymentMethod !== paymentFilter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        s.saleNumber?.toLowerCase().includes(q) ||
        s.customerName?.toLowerCase().includes(q) ||
        s.customerPhone?.includes(q) ||
        (s.items || []).some(it => it.medicine?.name?.toLowerCase().includes(q))
      )
    })
  }, [sales, statusFilter, paymentFilter, search])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE))
  const pagedSales = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredSales.slice(start, start + PAGE_SIZE)
  }, [filteredSales, currentPage])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, paymentFilter, search])

  // KPIs
  const totalRevenue = sales.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + (Number(s.netAmount) || 0), 0)
  const completedCount = sales.filter(s => s.status === 'COMPLETED').length
  const avgOrderValue = completedCount > 0 ? (totalRevenue / completedCount).toFixed(2) : 0

  // Revenue Trend Data (last 7 recorded dates)
  const revenueTrendData = useMemo(() => {
    const map = {}
    sales.filter(s => s.status === 'COMPLETED').forEach(s => {
      const date = s.saleDate || 'Recent'
      map[date] = (map[date] || 0) + (Number(s.netAmount) || 0)
    })
    const entries = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-7)
    if (entries.length === 0) return [{ date: 'Today', revenue: 0 }]
    return entries.map(([date, revenue]) => ({
      date: date.length > 5 ? date.slice(5) : date,
      revenue: Math.round(revenue)
    }))
  }, [sales])

  // Payment Breakdown Data
  const paymentBreakdownData = useMemo(() => {
    const counts = { CASH: 0, CARD: 0, UPI: 0, INSURANCE: 0 }
    sales.forEach(s => {
      const mode = (s.paymentMethod || 'CASH').toUpperCase()
      if (counts[mode] !== undefined) counts[mode]++
      else counts.CASH++
    })
    return [
      { mode: 'Cash', count: counts.CASH, color: '#10b981' },
      { mode: 'Card', count: counts.CARD, color: '#3b82f6' },
      { mode: 'UPI', count: counts.UPI, color: '#8b5cf6' },
      { mode: 'Ins.', count: counts.INSURANCE, color: '#06b6d4' },
    ]
  }, [sales])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25 text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
                POS Sales & Dispensing Checkout
              </h1>
              <span className="badge badge-teal text-xs font-bold px-2.5 py-0.5">
                {sales.length} Invoices
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 ml-12">
            <span>Point-of-sale customer checkout, prescription billing, automated inventory deduction & tax invoicing</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Last updated: {format(lastUpdated, 'dd MMM yyyy, HH:mm')}
              <button
                onClick={load}
                disabled={loading}
                className="hover:text-emerald-500 transition-colors p-0.5"
                title="Refresh sales ledger"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
              </button>
            </span>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary !text-sm !py-2.5 !px-5 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/25 self-start sm:self-auto hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="font-bold">New POS Sale / Checkout</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card !p-5 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Completed transactions</p>
        </div>

        <div className="card !p-5 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Sales Completed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{completedCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Dispensed orders</p>
        </div>

        <div className="card !p-5 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Avg Transaction</span>
            <ShoppingBag className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">₹{avgOrderValue}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Per customer ticket</p>
        </div>

        <div className="card !p-5 border-l-4 border-l-teal-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Total Invoices</span>
            <Receipt className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{sales.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">All billing records</p>
        </div>
      </div>

      {/* Compact Analytics Section (Revenue Trend + Payment Mode Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: 7-Day Revenue Trend */}
        <div className="lg:col-span-2 card !p-4 bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Dispensing Revenue Trend</span>
            </div>
            <span className="text-[11px] text-slate-400">Recent dispensing cycle</span>
          </div>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Payment Method Breakdown */}
        <div className="card !p-4 bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Payment Mode Share</span>
            </div>
            <span className="text-[11px] text-slate-400">{sales.length} transactions</span>
          </div>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentBreakdownData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="mode" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [`${val} orders`, 'Count']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {paymentBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card space-y-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
        {/* Controls — Clean Single Row Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Sales Transactions Ledger</span>
            <span className="badge badge-teal text-xs font-bold px-2.5 py-0.5">{filteredSales.length} Records</span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="form-select text-xs py-2 pl-8 pr-7 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled / Returned</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Payment Method Filter */}
            <div className="relative">
              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="form-select text-xs py-2 pl-8 pr-7 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-emerald-500"
              >
                <option value="ALL">All Payments</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="INSURANCE">Insurance</option>
              </select>
              <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative min-w-[220px] sm:min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search invoice #, customer..."
                className="form-input text-xs pl-9 pr-3 py-2 w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="table w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-left">
                <th className="py-3.5 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Invoice #</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Customer</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Date</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Payment Mode</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Net Total</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Status</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="py-4 px-4"><div className="h-6 skeleton rounded-lg w-full" /></td></tr>
                ))
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Receipt className="w-9 h-9 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-sm">No sales invoices found</p>
                  </td>
                </tr>
              ) : (
                pagedSales.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => { setSelectedSale(s); setShowDetailModal(true); }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md text-xs">
                        {s.saleNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{s.customerName || 'Walk-in Customer'}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{s.customerPhone || 'No phone recorded'}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">{s.saleDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="badge badge-blue text-[11px] font-bold px-2 py-0.5">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        ₹{Number(s.netAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.status === 'COMPLETED' ? (
                        <span className="badge badge-green text-[11px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="badge badge-red text-[11px] font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> {s.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right pr-4" onClick={e => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        {/* Process Return */}
                        {s.status === 'COMPLETED' && (
                          <button
                            onClick={() => { setSaleToReturn(s); setShowReturnModal(true); }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 hover:bg-amber-100 transition-colors flex items-center gap-1"
                            title="Process customer return & restore inventory"
                          >
                            <RotateCcw className="w-3 h-3" /> Return
                          </button>
                        )}

                        {/* View Receipt */}
                        <button
                          onClick={() => { setSelectedSale(s); setShowDetailModal(true); }}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 transition-colors"
                          title="View invoice receipt & print"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete Sale */}
                        <button
                          onClick={() => { setSaleToDelete(s); setShowDeleteModal(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete sale record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredSales.length > PAGE_SIZE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPage * PAGE_SIZE, filteredSales.length)}</span> of{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{filteredSales.length}</span> sales invoices
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === i + 1
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                      : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
              >
                Next <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: CREATE POS SALE ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-3xl my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">New POS Sale & Dispensing</h2>
                  <p className="text-xs text-slate-400">Point-of-sale customer billing and stock deduction</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={e => setForm({ ...form, customerName: e.target.value })}
                    className="form-input text-xs w-full"
                    placeholder="Walk-in Customer"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={form.customerPhone}
                    onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                    className="form-input text-xs w-full"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sale Date</label>
                  <input
                    type="date"
                    value={form.saleDate}
                    onChange={e => setForm({ ...form, saleDate: e.target.value })}
                    className="form-input text-xs w-full"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Dispensed Items ({form.items.length})</span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine Line
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex-1">
                        <select
                          value={item.medicineId}
                          onChange={e => updateItem(idx, 'medicineId', e.target.value)}
                          className="form-select text-xs w-full"
                        >
                          <option value="">Select Medicine</option>
                          {medicines.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.code || 'NO-CODE'})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', e.target.value)}
                          className="form-input text-xs w-full text-center"
                          placeholder="Qty"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                          className="form-input text-xs w-full text-right"
                          placeholder="Price"
                        />
                      </div>
                      <div className="w-24 text-right font-mono font-bold text-slate-700 dark:text-slate-200">
                        ₹{(Number(item.unitPrice || 0) * Number(item.quantity || 0)).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                    <select
                      value={form.paymentMethod}
                      onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                      className="form-select text-xs w-full"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Credit / Debit Card</option>
                      <option value="UPI">UPI / Digital QR</option>
                      <option value="INSURANCE">Insurance Claim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Prescription Ref</label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      className="form-input text-xs w-full"
                      placeholder="Optional notes or doctor reference..."
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold">₹{calcSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-slate-300">Discount (₹)</span>
                    <input
                      type="number"
                      min="0"
                      value={form.discount}
                      onChange={e => setForm({ ...form, discount: e.target.value })}
                      className="form-input text-xs w-24 text-right py-1"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-slate-300">Tax / GST (₹)</span>
                    <input
                      type="number"
                      min="0"
                      value={form.taxAmount}
                      onChange={e => setForm({ ...form, taxAmount: e.target.value })}
                      className="form-input text-xs w-24 text-right py-1"
                    />
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Net Total</span>
                    <span className="font-mono text-base">₹{calcNetTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary !text-xs !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-1.5"
                >
                  {submitting ? 'Recording...' : 'Complete & Dispense Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW SALE DETAIL & RECEIPT ── */}
      {showDetailModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-2xl my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Tax Invoice #{selectedSale.saleNumber}</h3>
                  <p className="text-xs text-slate-400">{selectedSale.customerName || 'Walk-in Customer'} · {selectedSale.saleDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedSale)}
                  className="btn-primary !text-xs !py-1.5 !px-3 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedSale.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className={selectedSale.status === 'COMPLETED' ? 'badge badge-green' : 'badge badge-red'}>
                    {selectedSale.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedSale.customerPhone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Invoice Date</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedSale.saleDate}</span>
                </div>
              </div>

              {/* Items list */}
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <table className="table w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80">
                      <th>Item / Formulation</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th className="text-right pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(selectedSale.items || []).map((it, i) => (
                      <tr key={i}>
                        <td className="font-bold text-slate-800 dark:text-slate-200">{it.medicine?.name || 'Pharmaceutical Item'}</td>
                        <td>{it.quantity}</td>
                        <td className="font-mono">₹{Number(it.unitPrice || 0).toFixed(2)}</td>
                        <td className="font-mono font-bold text-right pr-4">
                          ₹{Number(it.totalPrice || (it.quantity * it.unitPrice) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <div className="w-56 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{Number(selectedSale.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax</span>
                    <span className="font-mono">+₹{Number(selectedSale.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Discount</span>
                    <span className="font-mono">-₹{Number(selectedSale.discount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Net Paid</span>
                    <span className="font-mono">₹{Number(selectedSale.netAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowDetailModal(false)} className="btn-secondary !text-xs !py-2 !px-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM RETURN / VOID ── */}
      {showReturnModal && saleToReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          <div className="card w-full max-w-md p-0 shadow-2xl border border-amber-200 dark:border-amber-900/50 animate-scale-up overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/20">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Process Return / Void Sale?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Invoice {saleToReturn.saleNumber} · {saleToReturn.customerName || 'Walk-in Customer'}</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{saleToReturn.saleNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Amount</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹{Number(saleToReturn.netAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment</span>
                  <span className="badge badge-blue text-[10px]">{saleToReturn.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sale Date</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">{saleToReturn.saleDate}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-bold">This action will:</p>
                  <ul className="mt-1 space-y-0.5 text-amber-700 dark:text-amber-400">
                    <li>· Cancel invoice {saleToReturn.saleNumber}</li>
                    <li>· Restore all dispensed stock back to inventory</li>
                    <li>· Mark transaction as CANCELLED</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 pb-5">
              <button
                onClick={() => { setShowReturnModal(false); setSaleToReturn(null) }}
                className="btn-secondary !text-xs !py-2 !px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCancelSale(saleToReturn.id)}
                disabled={submitting}
                className="btn-warning !text-xs !py-2 !px-4 flex items-center gap-1.5"
              >
                {submitting ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                ) : (
                  <><RotateCcw className="w-3.5 h-3.5" /> Confirm Return</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE CONFIRMATION ── */}
      {showDeleteModal && saleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-md my-6 p-0 shadow-2xl border border-red-200 dark:border-red-900/60 animate-scale-up overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-red-50/60 dark:bg-red-950/20">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Sale Invoice?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Invoice {saleToDelete.saleNumber} · {saleToDelete.customerName}</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete invoice <strong className="text-slate-900 dark:text-white">{saleToDelete.saleNumber}</strong>?
                This will remove the record from ledger history and cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary !text-xs !py-2 !px-4">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="btn-danger !text-xs !py-2 !px-4 flex items-center gap-1.5"
              >
                {submitting ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-3.5 h-3.5" /> Delete Invoice</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
