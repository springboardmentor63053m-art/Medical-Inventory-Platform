import { useEffect, useState } from 'react'
import { purchaseAPI, supplierAPI, medicineAPI } from '../../api/services'
import { ShoppingCart, Plus, CheckCircle, XCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

function PurchaseRow({ purchase, onReceive, onCancel }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <tr className="cursor-pointer hover:bg-slate-50/80" onClick={() => setExpanded(p => !p)}>
        <td className="font-medium text-primary-700">{purchase.invoiceNumber}</td>
        <td>{purchase.supplier?.name}</td>
        <td>{purchase.purchaseDate}</td>
        <td className="font-semibold">₹{Number(purchase.netAmount).toLocaleString('en-IN')}</td>
        <td>
          <span className={`badge ${purchase.status === 'RECEIVED' ? 'badge-green' : purchase.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'}`}>
            {purchase.status}
          </span>
        </td>
        <td>
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            {purchase.status === 'PENDING' && (
              <>
                <button onClick={() => onReceive(purchase.id)} className="btn-success btn-sm">
                  <CheckCircle className="w-3 h-3"/> Receive
                </button>
                <button onClick={() => onCancel(purchase.id)} className="btn-danger btn-sm">
                  <XCircle className="w-3 h-3"/> Cancel
                </button>
              </>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400"/> : <ChevronDown className="w-4 h-4 text-slate-400"/>}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="bg-slate-50 px-4 py-3">
            <table className="w-full text-xs">
              <thead><tr className="text-slate-500"><th className="text-left pb-2">Medicine</th><th className="text-left">Batch</th><th className="text-left">Qty</th><th className="text-left">Unit Cost</th><th className="text-left">Total</th><th className="text-left">Expiry</th></tr></thead>
              <tbody>
                {(purchase.items || []).map(item => (
                  <tr key={item.id}>
                    <td>{item.medicine?.name}</td>
                    <td>{item.batchNumber || '—'}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitCost}</td>
                    <td>₹{item.totalCost}</td>
                    <td>{item.expiryDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  )
}

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [form, setForm] = useState({
    invoiceNumber:'', supplier:{ id:'' }, purchaseDate: new Date().toISOString().split('T')[0],
    discount:0, taxAmount:0, notes:'',
    items:[{ medicine:{ id:'' }, batchNumber:'', quantity:1, unitCost:0, expiryDate:'' }]
  })

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, sRes, mRes] = await Promise.all([purchaseAPI.getAll(), supplierAPI.getAll(), medicineAPI.getAll()])
      setPurchases(pRes.data); setSuppliers(sRes.data); setMedicines(mRes.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { medicine:{ id:'' }, batchNumber:'', quantity:1, unitCost:0, expiryDate:'' }] }))
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))
  const updateItem = (idx, k, v) => setForm(p => ({
    ...p, items: p.items.map((it, i) => i === idx ? { ...it, [k]: k === 'medicine' ? { id: v } : v } : it)
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        supplier: { id: Number(form.supplier.id) },
        discount: Number(form.discount), taxAmount: Number(form.taxAmount),
        items: form.items.map(it => ({
          medicine: { id: Number(it.medicine.id) },
          batchNumber: it.batchNumber,
          quantity: Number(it.quantity),
          unitCost: Number(it.unitCost),
          expiryDate: it.expiryDate || null,
        }))
      }
      await purchaseAPI.create(payload)
      toast.success('Purchase order created')
      setModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleReceive = async (id) => {
    try { await purchaseAPI.receive(id); toast.success('Purchase received — inventory updated'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }
  const handleCancel = async (id) => {
    try { await purchaseAPI.cancel(id); toast.success('Purchase cancelled'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3"><ShoppingCart className="w-7 h-7 text-primary-600"/>Purchase Management</h1>
          <p className="page-subtitle">{purchases.length} purchase orders</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus className="w-4 h-4"/>New Purchase</button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead><tr>
              <th>Invoice #</th><th>Supplier</th><th>Date</th><th>Net Amount</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse"/></td>)}</tr>)
              : purchases.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30"/>No purchases yet
                </td></tr>
              ) : purchases.map(p => (
                <PurchaseRow key={p.id} purchase={p} onReceive={handleReceive} onCancel={handleCancel} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-semibold">New Purchase Order</h3>
              <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Invoice Number *</label>
                    <input className="form-input" value={form.invoiceNumber} onChange={e => setForm(p => ({...p, invoiceNumber: e.target.value}))} required placeholder="INV-2024-XXXX"/>
                  </div>
                  <div>
                    <label className="form-label">Supplier *</label>
                    <select className="form-select" value={form.supplier.id} onChange={e => setForm(p => ({...p, supplier:{id: e.target.value}}))} required>
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Purchase Date *</label>
                    <input type="date" className="form-input" value={form.purchaseDate} onChange={e => setForm(p => ({...p, purchaseDate: e.target.value}))} required/>
                  </div>
                  <div>
                    <label className="form-label">Discount (₹)</label>
                    <input type="number" className="form-input" value={form.discount} onChange={e => setForm(p => ({...p, discount: e.target.value}))}/>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label !mb-0">Purchase Items *</label>
                    <button type="button" onClick={addItem} className="btn-ghost btn-sm text-primary-600"><Plus className="w-3.5 h-3.5"/>Add Item</button>
                  </div>
                  <div className="space-y-2">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-2 p-3 bg-slate-50 rounded-xl items-end">
                        <div className="col-span-2">
                          <label className="form-label text-xs">Medicine</label>
                          <select className="form-select text-xs" value={item.medicine.id} onChange={e => updateItem(idx, 'medicine', e.target.value)} required>
                            <option value="">Select</option>
                            {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="form-label text-xs">Qty</label>
                          <input type="number" className="form-input text-xs" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} min="1" required/>
                        </div>
                        <div>
                          <label className="form-label text-xs">Unit Cost</label>
                          <input type="number" step="0.01" className="form-input text-xs" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', e.target.value)} required/>
                        </div>
                        <button type="button" onClick={() => removeItem(idx)} className="btn-ghost text-red-500 !p-2 self-end"><X className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Purchase Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
