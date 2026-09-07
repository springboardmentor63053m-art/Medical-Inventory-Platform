import { useEffect, useState, useMemo } from 'react'
import { purchaseAPI, supplierAPI, medicineAPI } from '../../api/services'
import {
  ShoppingCart, Plus, CheckCircle, XCircle, X, ChevronDown, ChevronUp,
  Trash2, Search, Filter, Eye, Printer, Building2, Calendar, FileText,
  DollarSign, Package, AlertTriangle, ArrowRight, CheckCircle2, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Purchases() {
  const [purchases,      setPurchases]      = useState([])
  const [suppliers,      setSuppliers]      = useState([])
  const [medicines,      setMedicines]      = useState([])
  const [loading,        setLoading]        = useState(true)
  const [search,         setSearch]         = useState('')
  const [statusFilter,   setStatusFilter]   = useState('ALL')

  // Modals & Drawers
  const [showAddModal,    setShowAddModal]    = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPO,      setSelectedPO]      = useState(null)
  const [poToDelete,      setPoToDelete]      = useState(null)
  const [submitting,      setSubmitting]      = useState(false)

  // New PO Form state
  const [form, setForm] = useState({
    invoiceNumber: '',
    supplierId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    discount: 0,
    taxAmount: 0,
    notes: '',
    items: [
      { medicineId: '', batchNumber: '', quantity: 10, unitCost: 0, expiryDate: '' }
    ]
  })

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, sRes, mRes] = await Promise.all([
        purchaseAPI.getAll().catch(() => ({ data: [] })),
        supplierAPI.getAll().catch(() => ({ data: [] })),
        medicineAPI.getAll().catch(() => ({ data: [] }))
      ])
      setPurchases(Array.isArray(pRes.data) ? pRes.data : [])
      setSuppliers(Array.isArray(sRes.data) ? sRes.data : [])
      setMedicines(Array.isArray(mRes.data) ? mRes.data : [])
    } catch {
      toast.error('Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const generatePONumber = () => {
    return 'PO-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000))
  }

  const openCreateModal = () => {
    setForm({
      invoiceNumber: generatePONumber(),
      supplierId: suppliers[0]?.id || '',
      purchaseDate: new Date().toISOString().split('T')[0],
      discount: 0,
      taxAmount: 0,
      notes: '',
      items: [
        {
          medicineId: medicines[0]?.id || '',
          batchNumber: 'BATCH-' + Math.floor(100 + Math.random() * 900),
          quantity: 20,
          unitCost: medicines[0]?.costPrice || 10,
          expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
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
          batchNumber: 'BATCH-' + Math.floor(100 + Math.random() * 900),
          quantity: 10,
          unitCost: defaultMed?.costPrice || 10,
          expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
        }
      ]
    }))
  }

  const removeItem = (idx) => {
    if (form.items.length <= 1) return toast.error('Order must have at least one line item')
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
          if (med && med.costPrice) updated.unitCost = med.costPrice
        }
        return updated
      })
    }))
  }

  const calcSubtotal = () => {
    return form.items.reduce((sum, it) => sum + (Number(it.unitCost || 0) * Number(it.quantity || 0)), 0)
  }

  const calcNetTotal = () => {
    return Math.max(0, calcSubtotal() - Number(form.discount || 0) + Number(form.taxAmount || 0))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.supplierId) return toast.error('Please select a supplier')
    if (form.items.some(it => !it.medicineId || Number(it.quantity) <= 0)) {
      return toast.error('All items must have a selected medicine and valid quantity')
    }

    setSubmitting(true)
    try {
      const payload = {
        invoiceNumber: form.invoiceNumber || generatePONumber(),
        supplier: { id: Number(form.supplierId) },
        purchaseDate: form.purchaseDate,
        discount: Number(form.discount || 0),
        taxAmount: Number(form.taxAmount || 0),
        notes: form.notes,
        items: form.items.map(it => ({
          medicine: { id: Number(it.medicineId) },
          batchNumber: it.batchNumber || 'BATCH-' + Math.floor(100 + Math.random() * 900),
          quantity: Number(it.quantity),
          unitCost: Number(it.unitCost || 0),
          expiryDate: it.expiryDate || null
        }))
      }

      await purchaseAPI.create(payload)
      toast.success('Purchase order created successfully!')
      setShowAddModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create purchase order')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReceive = async (id) => {
    try {
      await purchaseAPI.receive(id)
      toast.success('Purchase received! Stock added to inventory.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to receive purchase')
    }
  }

  const handleCancel = async (id) => {
    try {
      await purchaseAPI.cancel(id)
      toast.success('Purchase order cancelled')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel purchase')
    }
  }

  const handleDelete = async () => {
    if (!poToDelete) return
    setSubmitting(true)
    try {
      await purchaseAPI.delete(poToDelete.id)
      toast.success(`Purchase order #${poToDelete.invoiceNumber} deleted`)
      setShowDeleteModal(false)
      setPoToDelete(null)
      if (selectedPO?.id === poToDelete.id) {
        setShowDetailModal(false)
        setSelectedPO(null)
      }
      load()
    } catch (err) {
      toast.error('Failed to delete purchase order')
    } finally {
      setSubmitting(false)
    }
  }

  const printPOReceipt = (po) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Order — ${po.invoiceNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 22px; font-weight: 800; color: #0f172a; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 13px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
            th { background: #f8fafc; font-weight: bold; }
            .totals { margin-top: 20px; text-align: right; font-size: 13px; }
            .total-row { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">MediStock AI — Purchase Order</div>
              <div style="font-size: 12px; color: #64748b;">Order Ref: ${po.invoiceNumber}</div>
            </div>
            <div class="badge">${po.status}</div>
          </div>

          <div class="grid">
            <div><strong>Supplier:</strong> ${po.supplier?.name || 'Partner Supplier'}</div>
            <div><strong>Order Date:</strong> ${po.purchaseDate || '—'}</div>
            <div><strong>Contact:</strong> ${po.supplier?.phone || po.supplier?.email || '—'}</div>
            <div><strong>Created By:</strong> ${po.createdBy?.username || 'admin'}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Medicine SKU</th>
                <th>Batch #</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Line Total</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              ${(po.items || []).map(it => `
                <tr>
                  <td><strong>${it.medicine?.name}</strong></td>
                  <td>${it.batchNumber || '—'}</td>
                  <td>${it.quantity} units</td>
                  <td>₹${Number(it.unitCost || 0).toFixed(2)}</td>
                  <td>₹${Number(it.totalCost || (it.quantity * it.unitCost) || 0).toFixed(2)}</td>
                  <td>${it.expiryDate || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div>Subtotal: ₹${Number(po.totalAmount || 0).toLocaleString('en-IN')}</div>
            <div>Tax: +₹${Number(po.taxAmount || 0).toLocaleString('en-IN')}</div>
            <div>Discount: -₹${Number(po.discount || 0).toLocaleString('en-IN')}</div>
            <div class="total-row">Net Payable: ₹${Number(po.netAmount || 0).toLocaleString('en-IN')}</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        p.invoiceNumber?.toLowerCase().includes(q) ||
        p.supplier?.name?.toLowerCase().includes(q) ||
        (p.items || []).some(it => it.medicine?.name?.toLowerCase().includes(q))
      )
    })
  }, [purchases, statusFilter, search])

  // KPIs
  const totalSpend   = purchases.reduce((sum, p) => sum + (Number(p.netAmount) || 0), 0)
  const pendingCount = purchases.filter(p => p.status === 'PENDING').length
  const receivedCount= purchases.filter(p => p.status === 'RECEIVED').length

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/25 text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display">
                Purchase Orders & Procurement
              </h1>
              <span className="badge badge-blue text-[10px] font-bold">
                {purchases.length} Orders
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-12">
            Supplier purchase orders, warehouse stock replenishment, invoice inwarding & order lifecycle
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary !text-xs !py-2 !px-4 flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card !p-4 border-l-4 border-l-blue-500 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{purchases.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Procurement transactions</p>
        </div>

        <div className="card !p-4 border-l-4 border-l-amber-500 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting warehouse receipt</p>
        </div>

        <div className="card !p-4 border-l-4 border-l-emerald-500 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Received & In Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{receivedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Inwarded to inventory</p>
        </div>

        <div className="card !p-4 border-l-4 border-l-purple-500 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Total Procurement</span>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">₹{totalSpend.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cumulative spend</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card space-y-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Purchase Orders List</span>
            <span className="badge badge-indigo">{filteredPurchases.length} Records</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-select !text-xs !py-1.5 !px-3 min-w-[130px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Orders</option>
              <option value="RECEIVED">Received Orders</option>
              <option value="CANCELLED">Cancelled Orders</option>
            </select>

            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search PO #, supplier, SKU..."
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
                <th>PO Number</th>
                <th>Supplier Partner</th>
                <th>Order Date</th>
                <th>Items Count</th>
                <th>Net Amount</th>
                <th>Status</th>
                <th className="text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="py-4 px-4"><div className="h-6 skeleton rounded-lg w-full" /></td></tr>
                ))
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <ShoppingCart className="w-9 h-9 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-sm">No purchase orders found</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                        {p.invoiceNumber}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{p.supplier?.name || 'Vendor'}</p>
                        <p className="text-[10px] text-slate-400">{p.supplier?.contactPerson || p.supplier?.phone || 'Supplier Partner'}</p>
                      </div>
                    </td>
                    <td className="font-mono text-slate-600 dark:text-slate-300">{p.purchaseDate}</td>
                    <td className="font-bold text-slate-700 dark:text-slate-300">
                      {(p.items || []).length} SKUs
                    </td>
                    <td>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹{Number(p.netAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        p.status === 'RECEIVED' ? 'badge-green' :
                        p.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Quick Receive action if PENDING */}
                        {p.status === 'PENDING' && (
                          <button
                            onClick={() => handleReceive(p.id)}
                            className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1"
                            title="Mark as received & add to inventory"
                          >
                            <CheckCircle className="w-3 h-3" /> Receive
                          </button>
                        )}

                        {/* Quick Cancel action if PENDING */}
                        {p.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancel(p.id)}
                            className="px-2 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-100 flex items-center gap-1"
                            title="Cancel order"
                          >
                            <XCircle className="w-3 h-3" /> Cancel
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => { setSelectedPO(p); setShowDetailModal(true); }}
                          className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 transition-colors"
                          title="View order breakdown & print"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete PO Button */}
                        <button
                          onClick={() => { setPoToDelete(p); setShowDeleteModal(true); }}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete purchase order record"
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

      {/* ── MODAL: CREATE PURCHASE ORDER ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-3xl my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Create Purchase Order (PO)</h2>
                  <p className="text-[11px] text-slate-400">Issue replenishment order to registered supplier</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Order Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice / PO Number *</label>
                  <input
                    type="text"
                    required
                    value={form.invoiceNumber}
                    onChange={e => setForm({ ...form, invoiceNumber: e.target.value })}
                    className="form-input text-xs w-full font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier Partner *</label>
                  <select
                    value={form.supplierId}
                    onChange={e => setForm({ ...form, supplierId: e.target.value })}
                    className="form-select text-xs w-full"
                    required
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.contactPerson || 'Vendor'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Order Date *</label>
                  <input
                    type="date"
                    required
                    value={form.purchaseDate}
                    onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
                    className="form-input text-xs w-full"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider text-slate-400">
                    Order Line Items ({form.items.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn-secondary !text-[11px] !py-1 !px-2.5 flex items-center gap-1 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine SKU
                  </button>
                </div>

                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Medicine *</label>
                        <select
                          value={item.medicineId}
                          onChange={e => updateItem(idx, 'medicineId', e.target.value)}
                          className="form-select text-xs w-full"
                          required
                        >
                          {medicines.map(m => (
                            <option key={m.id} value={m.id}>{m.name} (Stock: {m.stockQuantity || 0})</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Batch #</label>
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={e => updateItem(idx, 'batchNumber', e.target.value)}
                          className="form-input text-xs w-full font-mono"
                          placeholder="BATCH-101"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-2">
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

                      <div className="col-span-5 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Unit Cost (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={item.unitCost}
                          onChange={e => updateItem(idx, 'unitCost', e.target.value)}
                          className="form-input text-xs w-full font-mono"
                        />
                      </div>

                      <div className="col-span-5 sm:col-span-1 text-right">
                        <span className="block text-[10px] text-slate-400">Total</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          ₹{(Number(item.unitCost || 0) * Number(item.quantity || 0)).toFixed(2)}
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-1 flex justify-end">
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Procurement Notes / Terms</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="form-textarea text-xs w-full resize-none"
                    placeholder="Delivery terms, special handling instructions..."
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal:</span>
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
                    <span className="text-slate-500">Tax Amount (₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={form.taxAmount}
                      onChange={e => setForm({ ...form, taxAmount: e.target.value })}
                      className="form-input !py-1 !px-2 w-24 text-right font-mono text-xs"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                    <span>Net Payable:</span>
                    <span className="font-mono text-emerald-600">₹{calcNetTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary !text-xs !py-2 !px-4">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE CONFIRMATION ── */}
      {showDeleteModal && poToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-md my-6 p-6 shadow-2xl border border-red-200 dark:border-red-900/60 animate-scale-up">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Purchase Order?</h3>
                <p className="text-xs text-slate-400">PO #{poToDelete.invoiceNumber} — {poToDelete.supplier?.name}</p>
              </div>
            </div>

            <p className="py-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete purchase order <strong>{poToDelete.invoiceNumber}</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary !text-xs !py-2 !px-4">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={submitting} className="btn-primary !text-xs !py-2 !px-4 bg-red-600 hover:bg-red-700 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Delete PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PO BREAKDOWN & DETAILS ── */}
      {showDetailModal && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-2xl my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {selectedPO.invoiceNumber}
                </span>
                <span className={`badge ${
                  selectedPO.status === 'RECEIVED' ? 'badge-green' :
                  selectedPO.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'
                }`}>
                  {selectedPO.status}
                </span>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Supplier</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPO.supplier?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Order Date</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedPO.purchaseDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact</span>
                  <span className="text-slate-600 dark:text-slate-300">{selectedPO.supplier?.phone || selectedPO.supplier?.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Created By</span>
                  <span className="text-slate-600 dark:text-slate-300">{selectedPO.createdBy?.username || 'admin'}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="table w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80">
                      <th>Medicine</th>
                      <th>Batch</th>
                      <th>Quantity</th>
                      <th>Unit Cost</th>
                      <th>Total Cost</th>
                      <th>Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(selectedPO.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="font-bold text-slate-900 dark:text-white">{it.medicine?.name}</td>
                        <td className="font-mono text-slate-500">{it.batchNumber || '—'}</td>
                        <td className="font-mono font-bold">{it.quantity}</td>
                        <td className="font-mono">₹{Number(it.unitCost || 0).toFixed(2)}</td>
                        <td className="font-mono font-bold">₹{Number(it.totalCost || (it.quantity * it.unitCost) || 0).toFixed(2)}</td>
                        <td className="font-mono text-slate-500">{it.expiryDate || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                <div className="text-slate-500">
                  Subtotal: ₹{Number(selectedPO.totalAmount || 0).toLocaleString('en-IN')} · Tax: +₹{Number(selectedPO.taxAmount || 0).toLocaleString('en-IN')} · Discount: -₹{Number(selectedPO.discount || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Amount</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                    ₹{Number(selectedPO.netAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => printPOReceipt(selectedPO)}
                className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print PO Receipt
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setPoToDelete(selectedPO); setShowDeleteModal(true); }}
                  className="btn-secondary !text-xs !py-1.5 !px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete PO
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
