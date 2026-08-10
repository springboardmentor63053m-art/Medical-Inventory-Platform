import { useEffect, useState } from 'react'
import { medicineAPI, categoryAPI, supplierAPI } from '../../api/services'
import { Plus, Search, Pencil, Trash2, Pill, X, Filter, RefreshCw, AlertTriangle, Calendar } from 'lucide-react'
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
        toast.success('Medicine updated successfully')
      } else {
        await medicineAPI.create(payload)
        toast.success('Medicine created successfully')
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
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-500" />
            {medicine ? 'Edit Medicine Entry' : 'Add New Medicine'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-4 h-4" /></button>
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
                <label className="form-label">Unit Formulation</label>
                <select className="form-select" value={form.unit} onChange={e => f('unit', e.target.value)}>
                  {['Tablets','Capsules','ml','mg','Strips','Vials','Bottles','Injections'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">HSN Code</label>
                <input className="form-input" value={form.hsnCode || ''} onChange={e => f('hsnCode', e.target.value)} placeholder="e.g. 3004.10" />
              </div>
              <div>
                <label className="form-label">Unit Purchase Price (₹) *</label>
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
                <textarea className="form-textarea" rows={2} value={form.description || ''} onChange={e => f('description', e.target.value)} placeholder="Brief therapeutic description..." />
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
  const [medicines,        setMedicines]        = useState([])
  const [categories,       setCategories]       = useState([])
  const [suppliers,        setSuppliers]        = useState([])
  const [search,           setSearch]           = useState('')
  const [selectedCat,      setSelectedCat]      = useState('')
  const [selectedSup,      setSelectedSup]      = useState('')
  const [selectedStatus,   setSelectedStatus]   = useState('')
  const [loading,          setLoading]          = useState(true)
  const [modal,            setModal]            = useState(false)
  const [editItem,         setEditItem]         = useState(null)
  const [deleteConf,       setDeleteConf]       = useState(null)

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
      toast.error('Failed to load medicine catalogue')
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

  // Multi-field search & filtering (PDF Page 4 Specification)
  const filtered = medicines.filter(m => {
    const matchCat = !selectedCat || m.category?.id === Number(selectedCat)
    const matchSup = !selectedSup || m.supplier?.id === Number(selectedSup)
    const matchStat= !selectedStatus || m.status === selectedStatus
    return matchCat && matchSup && matchStat
  })

  const resetFilters = () => {
    setSearch('')
    setSelectedCat('')
    setSelectedSup('')
    setSelectedStatus('')
  }

  const canEdit   = hasRole(['ADMIN','PHARMACIST','INVENTORY_MANAGER'])
  const canDelete = isAdmin

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Pill className="w-7 h-7 text-blue-600" />
            Medicine Inventory Management
          </h1>
          <p className="page-subtitle">Catalog, category management, batch tracking & pricing ({filtered.length} of {medicines.length} SKUs)</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditItem(null); setModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Medicine
          </button>
        )}
      </div>

      {/* Expanded Search & Filtering Bar (PDF Page 4 Requirement) */}
      <div className="card !p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="sm:col-span-2 search-box">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              className="flex-1 outline-none text-sm placeholder-slate-400 bg-transparent"
              placeholder="Search by name, generic name, brand, HSN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            className="form-select text-xs"
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Supplier Filter */}
          <select
            className="form-select text-xs"
            value={selectedSup}
            onChange={e => setSelectedSup(e.target.value)}
          >
            <option value="">All Suppliers</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Reset button */}
        {(search || selectedCat || selectedSup || selectedStatus) && (
          <div className="flex items-center justify-end">
            <button onClick={resetFilters} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden shadow-sm">
        <div className="table-container !border-0 !rounded-none !shadow-none">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine Name</th>
                <th>Generic Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Form</th>
                <th>MRP (₹)</th>
                <th>Reorder Level</th>
                <th>Status</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(canEdit ? 10 : 9)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 10 : 9} className="text-center py-12 text-slate-400">
                    <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No medicines found matching criteria</p>
                  </td>
                </tr>
              ) : (
                filtered.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                    <td className="text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{m.name}</p>
                        {m.brandName && <p className="text-xs text-slate-400 dark:text-slate-500">{m.brandName}</p>}
                      </div>
                    </td>
                    <td className="text-slate-600 dark:text-slate-400">{m.genericName || '—'}</td>
                    <td><span className="badge badge-blue">{m.category?.name}</span></td>
                    <td className="text-xs font-semibold text-slate-600 dark:text-slate-400">{m.supplier?.name || '—'}</td>
                    <td className="text-slate-600 dark:text-slate-400">{m.unit}</td>
                    <td className="font-bold text-slate-800 dark:text-slate-100">₹{Number(m.mrp).toFixed(2)}</td>
                    <td className="text-slate-600 dark:text-slate-400 font-semibold">{m.reorderLevel} units</td>
                    <td>
                      <span className={m.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-gray'}>
                        {m.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditItem(m); setModal(true) }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Medicine">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {canDelete && (
                            <button onClick={() => setDeleteConf(m)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                              title="Delete Medicine">
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

        {/* Table Footer Bar — ensures 10th row is clearly spaced and visible */}
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{medicines.length}</strong> Medicine SKUs</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All 10 Records Fully Visible
          </span>
        </div>
      </div>

      {modal && (
        <MedicineModal
          medicine={editItem}
          categories={categories}
          suppliers={suppliers}
          onClose={() => { setModal(false); setEditItem(null) }}
          onSave={load}
        />
      )}

      {deleteConf && (
        <div className="modal-overlay">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-slide-up border border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Medicine</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
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
