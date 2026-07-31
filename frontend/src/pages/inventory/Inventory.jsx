import { useEffect, useState } from 'react'
import { inventoryAPI } from '../../api/services'
import { Package, AlertTriangle, Calendar, TrendingDown, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Inventory() {
  const { hasRole } = useAuth()
  const [inventory, setInventory] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState('all')     // 'all' | 'lowstock' | 'expiring'
  const [adjustMed, setAdjustMed] = useState(null)
  const [adjForm,   setAdjForm]   = useState({ adjustment: 0, reason: '' })

  const load = async () => {
    setLoading(true)
    try {
      let res
      if (tab === 'lowstock') res = await inventoryAPI.getLowStock()
      else if (tab === 'expiring') res = await inventoryAPI.getExpiring(90)
      else res = await inventoryAPI.getAll()
      setInventory(res.data)
    } catch { toast.error('Failed to load inventory') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [tab])

  const handleAdjust = async (e) => {
    e.preventDefault()
    try {
      await inventoryAPI.adjust({
        medicineId: adjustMed.medicine.id,
        adjustment: Number(adjForm.adjustment),
        reason: adjForm.reason
      })
      toast.success('Stock adjusted successfully')
      setAdjustMed(null)
      setAdjForm({ adjustment: 0, reason: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Adjustment failed') }
  }

  const canAdjust = hasRole(['ADMIN','INVENTORY_MANAGER'])

  const tabBtn = (key, label, Icon, count) => (
    <button key={key} onClick={() => setTab(key)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
        ${tab === key ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
          {count}
        </span>
      )}
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Package className="w-7 h-7 text-primary-600" />
            Inventory Management
          </h1>
          <p className="page-subtitle">Real-time stock levels — {inventory.length} records</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card !p-3 flex gap-2 flex-wrap">
        {tabBtn('all', 'All Stock', Package)}
        {tabBtn('lowstock', 'Low Stock', TrendingDown)}
        {tabBtn('expiring', 'Expiring (90 days)', Calendar)}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Batch No.</th>
                <th>Qty</th>
                <th>Min Qty</th>
                <th>Expiry Date</th>
                <th>Location</th>
                <th>Status</th>
                {canAdjust && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No inventory records found
                  </td>
                </tr>
              ) : (
                inventory.map((inv, idx) => {
                  const isLow      = inv.quantity <= inv.minQuantity
                  const isExpiring = inv.expiryDate && new Date(inv.expiryDate) <= new Date(Date.now() + 90*24*60*60*1000)
                  const isExpired  = inv.expiryDate && new Date(inv.expiryDate) < new Date()
                  return (
                    <tr key={inv.id} className={isLow ? 'bg-red-50/30' : isExpiring ? 'bg-amber-50/30' : ''}>
                      <td className="text-slate-400 text-xs">{idx+1}</td>
                      <td className="font-medium text-slate-800">{inv.medicine?.name}</td>
                      <td className="text-slate-500 text-xs">{inv.batchNumber || '—'}</td>
                      <td>
                        <span className={`font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                          {inv.quantity}
                        </span>
                      </td>
                      <td className="text-slate-500">{inv.minQuantity}</td>
                      <td>
                        {inv.expiryDate ? (
                          <span className={`text-sm ${isExpired ? 'text-red-600 font-semibold' : isExpiring ? 'text-amber-600 font-medium' : 'text-slate-600'}`}>
                            {inv.expiryDate}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="text-slate-500 text-xs">{inv.location || '—'}</td>
                      <td>
                        {isExpired ? <span className="badge badge-red">Expired</span>
                          : isLow  ? <span className="badge badge-red">Low Stock</span>
                          : isExpiring ? <span className="badge badge-yellow">Expiring Soon</span>
                          : <span className="badge badge-green">OK</span>}
                      </td>
                      {canAdjust && (
                        <td>
                          <button onClick={() => setAdjustMed(inv)}
                            className="text-xs btn-secondary !py-1 !px-2.5">
                            Adjust
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {adjustMed && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Adjust Stock — {adjustMed.medicine?.name}</h3>
              <button onClick={() => setAdjustMed(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdjust}>
              <div className="modal-body space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 text-sm">
                  <p className="text-slate-500">Current Stock</p>
                  <p className="text-2xl font-bold text-slate-800">{adjustMed.quantity} <span className="text-sm font-normal text-slate-500">units</span></p>
                </div>
                <div>
                  <label className="form-label">Adjustment Quantity</label>
                  <p className="text-xs text-slate-400 mb-2">Use positive number to add stock, negative to remove</p>
                  <input type="number" className="form-input" value={adjForm.adjustment}
                    onChange={e => setAdjForm(p => ({ ...p, adjustment: e.target.value }))}
                    placeholder="e.g. 50 or -10" required />
                  {adjForm.adjustment !== 0 && (
                    <p className="text-xs mt-1 font-medium text-primary-600">
                      New quantity: {adjustMed.quantity + Number(adjForm.adjustment)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="form-label">Reason *</label>
                  <textarea className="form-textarea" rows={3} value={adjForm.reason}
                    onChange={e => setAdjForm(p => ({ ...p, reason: e.target.value }))}
                    placeholder="Reason for adjustment (e.g. Physical count, damaged goods)" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setAdjustMed(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
