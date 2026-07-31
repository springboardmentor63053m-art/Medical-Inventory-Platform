import { useEffect, useState } from 'react'
import { supplierAPI } from '../../api/services'
import { Truck, Plus, Pencil, X, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

function SupplierModal({ supplier, onClose, onSave }) {
  const [form, setForm] = useState(supplier || {
    name:'', contactPerson:'', email:'', phone:'', address:'',
    city:'', state:'', pincode:'', gstNumber:'', licenseNumber:''
  })
  const [loading, setLoading] = useState(false)

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Name and phone are required')
    setLoading(true)
    try {
      if (supplier?.id) { await supplierAPI.update(supplier.id, form); toast.success('Supplier updated') }
      else { await supplierAPI.create(form); toast.success('Supplier created') }
      onSave(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="text-lg font-semibold">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4"/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Supplier Name *</label>
              <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Contact Person</label>
              <input className="form-input" value={form.contactPerson||''} onChange={e => f('contactPerson', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Phone *</label>
              <input className="form-input" value={form.phone} onChange={e => f('phone', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email||''} onChange={e => f('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">GST Number</label>
              <input className="form-input" value={form.gstNumber||''} onChange={e => f('gstNumber', e.target.value)} />
            </div>
            <div>
              <label className="form-label">City</label>
              <input className="form-input" value={form.city||''} onChange={e => f('city', e.target.value)} />
            </div>
            <div>
              <label className="form-label">State</label>
              <input className="form-input" value={form.state||''} onChange={e => f('state', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" rows={2} value={form.address||''} onChange={e => f('address', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : supplier ? 'Update' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Suppliers() {
  const { isAdmin, hasRole } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [modal,     setModal]     = useState(false)
  const [edit,      setEdit]      = useState(null)

  const load = async () => {
    setLoading(true)
    try { const r = await supplierAPI.getAll(); setSuppliers(r.data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.city||'').toLowerCase().includes(search.toLowerCase())
  )

  const canEdit = hasRole(['ADMIN','INVENTORY_MANAGER'])

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3"><Truck className="w-7 h-7 text-primary-600"/>Suppliers</h1>
          <p className="page-subtitle">{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} registered</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEdit(null); setModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4"/> Add Supplier
          </button>
        )}
      </div>

      <div className="card !p-4">
        <div className="search-box max-w-md">
          <Search className="w-4 h-4 text-slate-400"/>
          <input className="flex-1 outline-none text-sm placeholder-slate-400 bg-transparent"
            placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? [...Array(6)].map((_, i) => <div key={i} className="card h-44 animate-pulse bg-slate-100" />)
        : filtered.length === 0 ? (
          <div className="col-span-3 card text-center py-12 text-slate-400">
            <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No suppliers found
          </div>
        ) : filtered.map(s => (
          <div key={s.id} className="card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <span className={s.isActive ? 'badge badge-green' : 'badge badge-gray'}>
                {s.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{s.name}</h3>
            <p className="text-sm text-slate-500 mb-1">{s.contactPerson}</p>
            <p className="text-sm text-slate-500">{s.phone}</p>
            {s.city && <p className="text-xs text-slate-400 mt-1">{s.city}, {s.state}</p>}
            {s.gstNumber && <p className="text-xs text-slate-400">GST: {s.gstNumber}</p>}
            {canEdit && (
              <button onClick={() => { setEdit(s); setModal(true) }}
                className="mt-3 btn-secondary btn-sm w-full justify-center">
                <Pencil className="w-3.5 h-3.5"/> Edit
              </button>
            )}
          </div>
        ))}
      </div>

      {modal && (
        <SupplierModal supplier={edit} onClose={() => { setModal(false); setEdit(null) }} onSave={load} />
      )}
    </div>
  )
}
