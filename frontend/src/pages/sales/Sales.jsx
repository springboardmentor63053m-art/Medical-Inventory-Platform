import { useEffect, useState, useMemo } from 'react'
import { saleAPI, medicineAPI } from '../../api/services'
import {
  Receipt, Plus, X, XCircle, Trash2, Search, Filter, Eye,
  Printer, User, Phone, Calendar, CreditCard, ShoppingBag,
  CheckCircle2, AlertTriangle, ArrowRight, DollarSign, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Sales() {
  const [sales,         setSales]         = useState([])
  const [medicines,     setMedicines]     = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('ALL')
  const [paymentFilter, setPaymentFilter] = useState('ALL')

  // Modals & Drawers
  const [showAddModal,    setShowAddModal]    = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSale,    setSelectedSale]    = useState(null)
  const [saleToDelete,    setSaleToDelete]    = useState(null)
  const [submitting,      setSubmitting]      = useState(false)

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
    if (form.items.length <= 1) return toast.error('Sale must have at least one line item')
    setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))
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
    try {
      await saleAPI.cancel(id)
      toast.success('Sale cancelled — inventory stock restored')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel sale')
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

  const printInvoice = (sale) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Invoice — ${sale.saleNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
            .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 22px; font-weight: 800; color: #0f172a; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #d1fae5; color: #065f46; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 13px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
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

  // KPIs
  const totalRevenue = sales.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + (Number(s.netAmount) || 0), 0)
  const completedCount = sales.filter(s => s.status === 'COMPLETED').length
  const avgOrderValue = completedCount > 0 ? (totalRevenue / completedCount).toFixed(2) : 0

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25 text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display">
                POS Sales & Dispensing Checkout
              </h1>
              <span className="badge badge-teal text-[10px] font-bold">
                {sales.length} Invoices
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-12">
            Point-of-sale customer checkout, prescription billing, automated inventory deduction & tax invoicing
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary !text-xs !py-2 !px-4 flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ New POS Sale / Checkout</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card !p-4 border-l-4 border-l-emerald-500 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Completed transactions</p>
        </div>

        <div className="card !p-4 border-l-4 border-l-blue-500 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Sales Completed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{completedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Dispensed orders</p>
        </div>

        <div className="card !p-4 border-l-4 border-l-purple-500 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Avg Transaction</span>
            <ShoppingBag className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">₹{avgOrderValue}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Per customer ticket</p>
        </div>

        <div className="card !p-4 border-l-4 border-l-teal-500 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Total Invoices</span>
            <Receipt className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{sales.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All billing records</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card space-y-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Sales Transactions Ledger</span>
            <span className="badge badge-teal">{filteredSales.length} Records</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-select !text-xs !py-1.5 !px-3 min-w-[120px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled / Returned</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="form-select !text-xs !py-1.5 !px-3 min-w-[120px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="ALL">All Payments</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="INSURANCE">Insurance</option>
            </select>

            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search invoice #, customer..."
                className="form-input !text-xs !pl-9 !py-1.5 w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="table w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80">
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Payment Mode</th>
                <th>Net Total</th>
                <th>Status</th>
                <th className="text-right pr-4">Actions</th>
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
                filteredSales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                        {s.saleNumber}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{s.customerName || 'Walk-in Customer'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{s.customerPhone || 'No phone'}</p>
                      </div>
                    </td>
                    <td className="font-mono text-slate-600 dark:text-slate-300">{s.saleDate}</td>
                    <td>
                      <span className="badge badge-blue text-[10px] font-bold">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        ₹{Number(s.netAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span className={s.status === 'COMPLETED' ? 'badge badge-green' : 'badge badge-red'}>
                        {s.status}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Cancel / Void Sale */}
                        {s.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleCancelSale(s.id)}
                            className="px-2 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-100 flex items-center gap-1"
                            title="Cancel sale & restore inventory stock"
                          >
                            <XCircle className="w-3 h-3" /> Return
                          </button>
                        )}

                        {/* View Receipt */}
                        <button
                          onClick={() => { setSelectedSale(s); setShowDetailModal(true); }}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 transition-colors"
                          title="View invoice receipt & print"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Sale */}
                        <button
                          onClick={() => { setSaleToDelete(s); setShowDeleteModal(true); }}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete sale record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                  <p className="text-[11px] text-slate-400">Point-of-sale customer billing and stock deduction</p>
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
                    className="form-input text-xs w-full font-mono"
                    placeholder="9876500000"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method *</label>
                  <select
                    value={form.paymentMethod}
                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                    className="form-select text-xs w-full"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card / POS Terminal</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="INSURANCE">Health Insurance</option>
                  </select>
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider text-slate-400">
                    Prescribed / Dispensed Items ({form.items.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn-secondary !text-[11px] !py-1 !px-2.5 flex items-center gap-1 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine
                  </button>
                </div>

                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-12 sm:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Medicine Formulation *</label>
                        <select
                          value={item.medicineId}
                          onChange={e => updateItem(idx, 'medicineId', e.target.value)}
                          className="form-select text-xs w-full"
                          required
                        >
                          {medicines.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} (Stock: {m.stockQuantity || 0} · ₹{m.mrp || m.unitPrice || 0})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Quantity *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', e.target.value)}
                          className="form-input text-xs w-full font-mono"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Unit Price (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={item.unitPrice}
                          onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                          className="form-input text-xs w-full font-mono"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2 text-right">
                        <span className="block text-[10px] text-slate-400">Line Total</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          ₹{(Number(item.unitPrice || 0) * Number(item.quantity || 0)).toFixed(2)}
                        </span>
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer / Rx Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="form-textarea text-xs w-full resize-none"
                    placeholder="Doctor referral, dosage instructions, or billing note..."
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Gross Total:</span>
                    <span className="font-mono font-bold">₹{calcSubtotal().toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Discount (₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={form.discount}
                      onChange={e => setForm({ ...form, discount: e.target.value })}
                      className="form-input !py-1 !px-2 w-24 text-right font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">GST / Tax (₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={form.taxAmount}
                      onChange={e => setForm({ ...form, taxAmount: e.target.value })}
                      className="form-input !py-1 !px-2 w-24 text-right font-mono text-xs"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                    <span>Total Amount Payable:</span>
                    <span className="font-mono text-emerald-600">₹{calcNetTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary !text-xs !py-2 !px-4">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Complete Sale & Print Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE CONFIRMATION ── */}
      {showDeleteModal && saleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-md my-6 p-6 shadow-2xl border border-red-200 dark:border-red-900/60 animate-scale-up">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Sale Invoice?</h3>
                <p className="text-xs text-slate-400">Invoice #{saleToDelete.saleNumber} — {saleToDelete.customerName}</p>
              </div>
            </div>

            <p className="py-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete sale invoice <strong>{saleToDelete.saleNumber}</strong>? This action will remove the record from ledger history.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary !text-xs !py-2 !px-4">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={submitting} className="btn-primary !text-xs !py-2 !px-4 bg-red-600 hover:bg-red-700 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SALE DETAILS & TAX INVOICE ── */}
      {showDetailModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-2xl my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {selectedSale.saleNumber}
                </span>
                <span className={`badge ${selectedSale.status === 'COMPLETED' ? 'badge-green' : 'badge-red'}`}>
                  {selectedSale.status}
                </span>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedSale.customerName || 'Walk-in Customer'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Sale</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedSale.saleDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">{selectedSale.customerPhone || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Mode</span>
                  <span className="badge badge-blue font-bold">{selectedSale.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="table w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80">
                      <th>Medicine</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(selectedSale.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="font-bold text-slate-900 dark:text-white">{it.medicine?.name || 'Item'}</td>
                        <td className="font-mono font-bold">{it.quantity}</td>
                        <td className="font-mono">₹{Number(it.unitPrice || 0).toFixed(2)}</td>
                        <td className="font-mono font-bold">₹{Number(it.totalPrice || (it.quantity * it.unitPrice) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                <div className="text-slate-500">
                  Gross: ₹{Number(selectedSale.totalAmount || 0).toLocaleString('en-IN')} · Tax: +₹{Number(selectedSale.taxAmount || 0).toLocaleString('en-IN')} · Discount: -₹{Number(selectedSale.discount || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Paid</span>
                  <span className="font-mono font-black text-emerald-600 text-base">
                    ₹{Number(selectedSale.netAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => printInvoice(selectedSale)}
                className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Tax Invoice
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSaleToDelete(selectedSale); setShowDeleteModal(true); }}
                  className="btn-secondary !text-xs !py-1.5 !px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button onClick={() => setShowDetailModal(false)} className="btn-primary !text-xs !py-1.5 !px-4">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
