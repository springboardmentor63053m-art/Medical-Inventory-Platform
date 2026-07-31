import { useEffect, useState } from 'react'
import { medicineAPI, categoryAPI, supplierAPI } from '../../api/services'
import { Plus, Search, Pencil, Trash2, Pill, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

function MedicineModal({ medicine, categories, suppliers, onClose, onSave }) {
  const [form, setForm] = useState(medicine || {
    name:'', genericName:'', brandName:'', unit:'Tablets', hsnCode:'',
    description:'', unitPrice:'', mrp:'', reorderLevel:10,
    status:'ACTIVE', category:{ id:'' }, supplier:{ id:'' }
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.category?.id) return toast.error('Name and category are required')
    setLoading(true)
    try {
      const payload = {
        ...form,
        category:  { id: Number(form.category.id) },
        supplier:  form.supplier?.id ? { id: Number(form.supplier.id) } : null,
        unitPrice: Number(form.unitPrice),
        mrp:       Number(form.mrp),
        reorderLevel: Number(form.reorderLevel),
      }
      if (medicine?.id) {
        await medicineAPI.update(medicine.id, payload)
        toast.success('Medicine updated')
      } else {
        await medicineAPI.create(payload)
        toast.success('Medicine created')
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }))

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-slate-800">
            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Medicine Name *</label>
                <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Amoxicillin 500mg Capsules" required />
              </div>
              <div>
                <label className="form-label">Generic Name</label>
                <input className="form-input" value={form.genericName || ''} onChange={e => f('genericName', e.target.value)} placeholder="Generic name" />
              </div>
              <div>
                <label className="form-label">Brand Name</label>
                <input className="form-input" value={form.brandName || ''} onChange={e => f('brandName', e.target.value)} placeholder="Brand" />
              </div>
              <div>
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category?.id || ''} onChange={e => f('category', { id: e.target.value })} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Supplier</label>
                <select className="form-select" value={form.supplier?.id || ''} onChange={e => f('supplier', { id: e.target.value })}>
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Unit</label>
                <select className="form-select" value={form.unit} onChange={e => f('unit', e.target.value)}>
                  {['Tablets','Capsules','ml','mg','Strips','Vials','Bottles','Injections'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">HSN Code</label>
                <input className="form-input" value={form.hsnCode || ''} onChange={e => f('hsnCode', e.target.value)} placeholder="e.g. 3004.10" />
              </div>
              <div>
                <label className="form-label">Unit Price (₹) *</label>
                <input type="number" step="0.01" className="form-input" value={form.unitPrice} onChange={e => f('unitPrice', e.target.value)} required placeholder="0.00" />
              </div>
              <div>
                <label className="form-label">MRP (₹) *</label>
                <input type="number" step="0.01" className="form-input" value={form.mrp} onChange={e => f('mrp', e.target.value)} required placeholder="0.00" />
              </div>
              <div>
                <label className="form-label">Reorder Level</label>
                <input type="number" className="form-input" value={form.reorderLevel} onChange={e => f('reorderLevel', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => f('status', e.target.value)}>
                  <option>ACTIVE</option>
                  <option>DISCONTINUED</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={2} value={form.description || ''} onChange={e => f('description', e.target.value)} placeholder="Brief description..." />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : medicine ? 'Update Medicine' : 'Create Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Medicines() {
  const { isAdmin, hasRole } = useAuth()
  const [medicines,   setMedicines]   = useState([])
  const [categories,  setCategories]  = useState([])
  const [suppliers,   setSuppliers]   = useState([])
  const [search,      setSearch]      = useState('')
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(false)
  const [editItem,    setEditItem]    = useState(null)
  const [deleteConf,  setDeleteConf]  = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [mRes, cRes, sRes] = await Promise.all([
        medicineAPI.getAll(search || undefined),
        categoryAPI.getAll(),
        supplierAPI.getAll(),
      ])
      setMedicines(mRes.data)
      setCategories(cRes.data)
      setSuppliers(sRes.data)
    } catch {
      toast.error('Failed to load medicines')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search])

  const handleDelete = async (id) => {
    try {
      await medicineAPI.delete(id)
      toast.success('Medicine deleted')
      setDeleteConf(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete medicine')
    }
  }

  const canEdit   = hasRole(['ADMIN','PHARMACIST','INVENTORY_MANAGER'])
  const canDelete = isAdmin

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Pill className="w-7 h-7 text-primary-600" />
            Medicine Management
          </h1>
          <p className="page-subtitle">Manage your medicine catalog — {medicines.length} medicines</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditItem(null); setModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Medicine
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card !p-4">
        <div className="search-box max-w-md">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            className="flex-1 outline-none text-sm placeholder-slate-400 bg-transparent"
            placeholder="Search by name, generic name, or brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Generic Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>MRP (₹)</th>
                <th>Reorder Lvl</th>
                <th>Status</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(canEdit ? 9 : 8)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 9 : 8} className="text-center py-12 text-slate-400">
                    <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No medicines found</p>
                  </td>
                </tr>
              ) : (
                medicines.map((m, idx) => (
                  <tr key={m.id}>
                    <td className="text-slate-400 text-xs">{idx + 1}</td>
                    <td>
                      <div>
                        <p className="font-medium text-slate-800">{m.name}</p>
                        {m.brandName && <p className="text-xs text-slate-400">{m.brandName}</p>}
                      </div>
                    </td>
                    <td className="text-slate-600">{m.genericName || '—'}</td>
                    <td><span className="badge badge-blue">{m.category?.name}</span></td>
                    <td className="text-slate-600">{m.unit}</td>
                    <td className="font-medium">₹{Number(m.mrp).toFixed(2)}</td>
                    <td className="text-slate-600">{m.reorderLevel}</td>
                    <td>
                      <span className={m.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-gray'}>
                        {m.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditItem(m); setModal(true) }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {canDelete && (
                            <button onClick={() => setDeleteConf(m)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <MedicineModal
          medicine={editItem}
          categories={categories}
          suppliers={suppliers}
          onClose={() => { setModal(false); setEditItem(null) }}
          onSave={load}
        />
      )}

      {/* Delete confirm */}
      {deleteConf && (
        <div className="modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-slide-up">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Medicine</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete <strong>"{deleteConf.name}"</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConf(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => handleDelete(deleteConf.id)} className="btn-danger flex-1">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
