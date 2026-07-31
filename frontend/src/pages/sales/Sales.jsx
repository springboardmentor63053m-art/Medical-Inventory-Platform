import { useEffect, useState } from 'react'
import { saleAPI, medicineAPI } from '../../api/services'
import { Receipt, Plus, X, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Sales() {
  const { hasRole } = useAuth()
  const [sales,     setSales]     = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [form, setForm] = useState({
    customerName:'', customerPhone:'', saleDate: new Date().toISOString().split('T')[0],
    paymentMethod:'CASH', discount:0, taxAmount:0, notes:'',
    items:[{ medicine:{ id:'' }, quantity:1, unitPrice:0 }]
  })

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, mRes] = await Promise.all([saleAPI.getAll(), medicineAPI.getAll()])
      setSales(sRes.data); setMedicines(mRes.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { medicine:{ id:'' }, quantity:1, unitPrice:0 }] }))
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))
  const updateItem = (idx, k, v) => setForm(p => ({
    ...p, items: p.items.map((it, i) => i === idx ? { ...it, [k]: k === 'medicine' ? { id: v } : v } : it)
  }))

  const onMedSelect = (idx, medId) => {
    const med = medicines.find(m => String(m.id) === String(medId))
    updateItem(idx, 'medicine', medId)
    if (med) {
      setForm(p => ({
        ...p,
        items: p.items.map((it, i) => i === idx ? { ...it, medicine:{ id: medId }, unitPrice: med.mrp } : it)
      }))
    }
  }

  const calcTotal = () => form.items.reduce((sum, it) => sum + (Number(it.unitPrice) * Number(it.quantity)), 0)
  const calcNet   = () => calcTotal() - Number(form.discount) + Number(form.taxAmount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        discount: Number(form.discount), taxAmount: Number(form.taxAmount),
        items: form.items.map(it => ({
          medicine: { id: Number(it.medicine.id) },
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        }))
      }
      await saleAPI.create(payload)
      toast.success('Sale recorded successfully')
      setModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Sale failed — check stock levels') }
  }

  const handleCancel = async (id) => {
    try { await saleAPI.cancel(id); toast.success('Sale cancelled — inventory restored'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const canCreate = hasRole(['ADMIN','PHARMACIST'])

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3"><Receipt className="w-7 h-7 text-primary-600"/>Sales Management</h1>
          <p className="page-subtitle">{sales.length} transactions recorded</p>
        </div>
        {canCreate && (
          <button onClick={() => setModal(true)} className="btn-primary"><Plus className="w-4 h-4"/>New Sale</button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead><tr>
              <th>Sale #</th><th>Customer</th><th>Date</th><th>Payment</th><th>Net Amount</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse"/></td>)}</tr>)
              : sales.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                  <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30"/>No sales yet
                </td></tr>
              ) : sales.map(s => (
                <tr key={s.id}>
                  <td className="font-medium text-primary-700">{s.saleNumber}</td>
                  <td>{s.customerName || 'Walk-in'}</td>
                  <td>{s.saleDate}</td>
                  <td><span className="badge badge-blue">{s.paymentMethod}</span></td>
                  <td className="font-semibold text-emerald-700">₹{Number(s.netAmount).toLocaleString('en-IN')}</td>
                  <td><span className={s.status === 'COMPLETED' ? 'badge badge-green' : 'badge badge-red'}>{s.status}</span></td>
                  <td>
                    {canCreate && s.status === 'COMPLETED' && (
                      <button onClick={() => handleCancel(s.id)} className="btn-danger btn-sm">
                        <XCircle className="w-3 h-3"/>Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-semibold">New Sale Transaction</h3>
              <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Customer Name</label>
                    <input className="form-input" value={form.customerName} onChange={e => setForm(p => ({...p, customerName: e.target.value}))} placeholder="Walk-in customer"/>
                  </div>
                  <div>
                    <label className="form-label">Customer Phone</label>
                    <input className="form-input" value={form.customerPhone} onChange={e => setForm(p => ({...p, customerPhone: e.target.value}))}/>
                  </div>
                  <div>
                    <label className="form-label">Sale Date</label>
                    <input type="date" className="form-input" value={form.saleDate} onChange={e => setForm(p => ({...p, saleDate: e.target.value}))}/>
                  </div>
                  <div>
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" value={form.paymentMethod} onChange={e => setForm(p => ({...p, paymentMethod: e.target.value}))}>
                      {['CASH','CARD','UPI','INSURANCE'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label !mb-0">Sale Items *</label>
                    <button type="button" onClick={addItem} className="btn-ghost btn-sm text-primary-600"><Plus className="w-3.5 h-3.5"/>Add Item</button>
                  </div>
                  <div className="space-y-2">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl items-end">
                        <div className="col-span-2">
                          <label className="form-label text-xs">Medicine</label>
                          <select className="form-select text-xs" value={item.medicine.id} onChange={e => onMedSelect(idx, e.target.value)} required>
                            <option value="">Select</option>
                            {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="form-label text-xs">Qty</label>
                          <input type="number" className="form-input text-xs" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} min="1" required/>
                        </div>
                        <div>
                          <label className="form-label text-xs">Unit Price</label>
                          <input type="number" step="0.01" className="form-input text-xs" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} required/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="form-label text-xs">Discount (₹)</label>
                    <input type="number" className="form-input text-xs" value={form.discount} onChange={e => setForm(p => ({...p, discount: e.target.value}))}/>
                  </div>
                  <div>
                    <label className="form-label text-xs">Tax (₹)</label>
                    <input type="number" className="form-input text-xs" value={form.taxAmount} onChange={e => setForm(p => ({...p, taxAmount: e.target.value}))}/>
                  </div>
                  <div className="flex flex-col justify-end">
                    <p className="text-xs text-slate-500">Net Amount</p>
                    <p className="text-xl font-bold text-emerald-700">₹{calcNet().toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-success">Complete Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
