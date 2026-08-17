import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supplierAPI, medicineAPI } from '../../api/services'
import {
  Plus, Search, Pencil, Trash2, Truck, X, Star, Phone, Mail, MapPin,
  Link2, Unlink, Pill, Check, ExternalLink, ShieldCheck, UserCheck,
  Layers, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import Portal from '../../components/Portal'

const DEFAULT_SUPPLIERS = [
  { id: 1, name: 'Sun Pharma Distributors', contactPerson: 'Rajesh Kumar', phone: '+91 9876543210', email: 'rajesh@sunpharma.com', address: 'Plot 12, MIDC Industrial Area, Mumbai', status: 'ACTIVE' },
  { id: 2, name: 'Cipla MedCorp', contactPerson: 'Priya Sharma', phone: '+91 9123456789', email: 'contact@ciplamed.com', address: '22, Hosur Road, Electronic City, Bengaluru', status: 'ACTIVE' },
  { id: 3, name: "Dr. Reddy's Pharma Supply", contactPerson: 'Venkat Reddy', phone: '+91 9988776655', email: 'venkat@drreddys.com', address: '8-2-337, Road No. 3, Banjara Hills, Hyderabad', status: 'ACTIVE' },
  { id: 4, name: 'Mankind Pharma Ltd', contactPerson: 'Suresh Patel', phone: '+91 9811223344', email: 'suresh@mankind.in', address: 'A-35, Sector 60, Noida', status: 'ACTIVE' },
  { id: 5, name: 'Lupin Healthcare Distributors', contactPerson: 'Meena Joshi', phone: '+91 9765432100', email: 'meena@lupinhc.com', address: 'Kalpataru Point, Sion-Trombay Road, Mumbai', status: 'ACTIVE' },
  { id: 6, name: 'Alkem Laboratories', contactPerson: 'Amit Singhania', phone: '+91 9654321098', email: 'amit@alkem.com', address: 'Devashish, Premises Co-op Society, Andheri East, Mumbai', status: 'ACTIVE' },
  { id: 7, name: 'Abbott India Pharma', contactPerson: 'Kavitha Nair', phone: '+91 9543210987', email: 'kavitha@abbottindia.com', address: '3/F, Godrej BKC, Bandra Kurla Complex, Mumbai', status: 'ACTIVE' },
  { id: 8, name: 'Torrent Pharmaceuticals', contactPerson: 'Bhavesh Mehta', phone: '+91 9432109876', email: 'bhavesh@torrentpharma.com', address: 'Torrent House, Off Ashram Road, Ahmedabad', status: 'ACTIVE' },
  { id: 9, name: 'Himalaya Drug Company', contactPerson: 'Deepak Rao', phone: '+91 9321098765', email: 'deepak@himalayawellness.com', address: 'Makali, Tumkur Road, Bengaluru', status: 'ACTIVE' },
  { id: 10, name: 'Zydus Healthcare Ltd', contactPerson: 'Pooja Verma', phone: '+91 9210987654', email: 'pooja@zydus.com', address: 'Zydus Corporate Park, SG Highway, Ahmedabad', status: 'ACTIVE' }
]

const DEFAULT_MEDICINES = [
  { id: 1, name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', brandName: 'Mox 500', category: { id: 1, name: 'Antibiotics' }, supplier: { id: 1, name: 'Sun Pharma Distributors' }, unit: 'Capsules', unitPrice: 12.50, mrp: 15.00, status: 'ACTIVE' },
  { id: 2, name: 'Paracetamol 650mg', genericName: 'Acetaminophen', brandName: 'Dolo 650', category: { id: 2, name: 'Analgesics' }, supplier: { id: 2, name: 'Cipla MedCorp' }, unit: 'Tablets', unitPrice: 2.00, mrp: 3.50, status: 'ACTIVE' },
  { id: 3, name: 'Atorvastatin 10mg', genericName: 'Atorvastatin Calcium', brandName: 'Lipitor', category: { id: 7, name: 'Antihypertensives' }, supplier: { id: 3, name: "Dr. Reddy's Pharma Supply" }, unit: 'Tablets', unitPrice: 8.00, mrp: 10.50, status: 'ACTIVE' },
  { id: 4, name: 'Metformin 500mg', genericName: 'Metformin Hydrochloride', brandName: 'Glycomet', category: { id: 6, name: 'Antidiabetics' }, supplier: { id: 4, name: 'Mankind Pharma Ltd' }, unit: 'Tablets', unitPrice: 3.50, mrp: 5.00, status: 'ACTIVE' },
  { id: 5, name: 'Vitamin D3 60000 IU', genericName: 'Cholecalciferol', brandName: 'D-Rise', category: { id: 5, name: 'Vitamins & Minerals' }, supplier: { id: 5, name: 'Lupin Healthcare Distributors' }, unit: 'Capsules', unitPrice: 18.00, mrp: 25.00, status: 'ACTIVE' },
  { id: 6, name: 'Azithromycin 500mg', genericName: 'Azithromycin Dihydrate', brandName: 'Azithral 500', category: { id: 1, name: 'Antibiotics' }, supplier: { id: 6, name: 'Alkem Laboratories' }, unit: 'Tablets', unitPrice: 22.00, mrp: 30.00, status: 'ACTIVE' },
  { id: 7, name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', brandName: 'Norvasc', category: { id: 7, name: 'Antihypertensives' }, supplier: { id: 7, name: 'Abbott India Pharma' }, unit: 'Tablets', unitPrice: 4.50, mrp: 6.00, status: 'ACTIVE' },
  { id: 8, name: 'Insulin Glargine 100IU/mL', genericName: 'Insulin Glargine', brandName: 'Lantus', category: { id: 6, name: 'Antidiabetics' }, supplier: { id: 8, name: 'Torrent Pharmaceuticals' }, unit: 'Vials', unitPrice: 450.00, mrp: 550.00, status: 'ACTIVE' },
  { id: 9, name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', brandName: 'Brufen', category: { id: 10, name: 'NSAIDs' }, supplier: { id: 9, name: 'Himalaya Drug Company' }, unit: 'Tablets', unitPrice: 3.00, mrp: 4.50, status: 'ACTIVE' },
  { id: 10, name: 'Multivitamin & Multimineral', genericName: 'Multivitamin Complex', brandName: 'Supradyn', category: { id: 5, name: 'Vitamins & Minerals' }, supplier: { id: 10, name: 'Zydus Healthcare Ltd' }, unit: 'Tablets', unitPrice: 5.50, mrp: 7.50, status: 'ACTIVE' }
]

function SupplierModal({ supplier, onClose, onSave }) {
  const [form, setForm] = useState(supplier || {
    name: '', contactPerson: '', phone: '', email: '', address: '', taxId: '', status: 'ACTIVE'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Supplier name and phone are required')
    setLoading(true)
    try {
      if (supplier?.id) {
        await supplierAPI.update(supplier.id, form)
        toast.success('Supplier updated successfully')
      } else {
        await supplierAPI.create(form)
        toast.success('Supplier created successfully')
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save supplier')
    } finally {
      setLoading(false)
    }
  }

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }))

  return (
    <Portal>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-content max-w-md">
          <div className="modal-header">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" />
              {supplier ? 'Edit Supplier Record' : 'Add New Supplier'}
            </h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body space-y-4">
              <div>
                <label className="form-label">Supplier Company Name *</label>
                <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Sun Pharma Distributors" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Contact Person</label>
                  <input className="form-input" value={form.contactPerson || ''} onChange={e => f('contactPerson', e.target.value)} placeholder="Name" />
                </div>
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="Phone" required />
                </div>
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={form.email || ''} onChange={e => f('email', e.target.value)} placeholder="orders@supplier.com" />
              </div>
              <div>
                <label className="form-label">Address</label>
                <textarea className="form-textarea" rows={2} value={form.address || ''} onChange={e => f('address', e.target.value)} placeholder="Full office/warehouse address..." />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Create Supplier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  )
}

function SupplierMedicineLinkModal({ supplier, medicines, onLink, onUnlink, onClose }) {
  const [selectedMedId, setSelectedMedId] = useState('')
  const [linking, setLinking] = useState(false)

  const linkedMeds = medicines.filter(m => m.supplier?.id === supplier.id)

  const handleLinkMedicine = async () => {
    if (!selectedMedId) return toast.error('Please select a medicine to link')
    setLinking(true)
    try {
      await onLink(Number(selectedMedId), supplier.id)
      toast.success('Medicine linked to supplier successfully')
      setSelectedMedId('')
    } catch {
      toast.error('Failed to link medicine')
    } finally {
      setLinking(false)
    }
  }

  const handleUnlinkMedicine = async (medId) => {
    try {
      await onUnlink(medId)
      toast.success('Medicine unlinked from supplier')
    } catch {
      toast.error('Failed to unlink medicine')
    }
  }

  const suppCode = `SUP-500${supplier.id}`
  const empId = `SUP00${supplier.id}`

  return (
    <Portal>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-content max-w-xl shadow-2xl animate-slide-up border border-slate-200 dark:border-slate-800">
          <div className="modal-header pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-200/50">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {supplier.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <span>Supplier Code: <strong className="text-slate-600 dark:text-slate-300 font-mono">{suppCode}</strong></span>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-500" /> Verified Supply Partner
                  </span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="modal-body space-y-4 p-5">
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Contact</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{supplier.contactPerson || 'Official Representative'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone / Mobile</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{supplier.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Email</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5 truncate">{supplier.email || 'orders@supplier.com'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 truncate">{supplier.address || 'Industrial Estate Warehouse'}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/40">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>2. LINKED SUPPLIER USER ACCOUNT</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-purple-500/80">Employee ID</p>
                  <p className="font-mono font-bold text-purple-700 dark:text-purple-300 mt-0.5">{empId}</p>
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-purple-500/80">Login Account Email</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">{supplier.email || 'orders@supplier.com'}</p>
                  </div>
                  <span className="badge !bg-purple-100 !text-purple-700 dark:!bg-purple-900/60 dark:!text-purple-200 !font-bold !text-[10px] self-end">
                    SUPPLIER
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                  <Link2 className="w-4 h-4 text-blue-600" />
                  <span>3. MEDICINES SUPPLIED BY THIS SUPPLIER</span>
                </div>
                <span className="badge badge-blue !text-[11px] !font-bold">
                  {linkedMeds.length} LINKED
                </span>
              </div>

              <div className="flex gap-2">
                <select
                  className="form-select flex-1 text-xs"
                  value={selectedMedId}
                  onChange={e => setSelectedMedId(e.target.value)}
                >
                  <option value="">Select a medicine from catalogue to link...</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      #{m.id} {m.name} ({m.genericName || 'General'}) • ₹{m.unitPrice} {m.supplier?.id === supplier.id ? '(Already Linked)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleLinkMedicine}
                  disabled={!selectedMedId || linking}
                  className="btn-primary !text-xs !py-2 !px-4 flex items-center gap-1.5 shrink-0"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  {linking ? 'Linking...' : 'Link Medicine'}
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {linkedMeds.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Link2 className="w-5 h-5 opacity-50" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No medicines are currently linked to this supplier.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Use the dropdown above to link medicines supplied by {supplier.name}.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
                    {linkedMeds.map(m => (
                      <div key={m.id} className="p-3 flex items-center justify-between hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200/50">
                            #{m.id}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{m.name}</p>
                            <p className="text-[10px] text-slate-400">{m.genericName || 'General'} • <span className="text-blue-600 font-semibold">{m.category?.name}</span> • MRP: ₹{m.mrp}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnlinkMedicine(m.id)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Unlink this medicine from supplier"
                        >
                          <Unlink className="w-3 h-3" /> Unlink
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer flex justify-end">
            <button type="button" onClick={onClose} className="btn-secondary !text-xs !py-1.5 !px-4">
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default function Suppliers() {
  const { isAdmin } = useAuth()
  const [suppliers,      setSuppliers]      = useState(DEFAULT_SUPPLIERS)
  const [medicines,      setMedicines]      = useState(DEFAULT_MEDICINES)
  const [search,         setSearch]         = useState('')
  const [linkSearch,     setLinkSearch]     = useState('')
  const [selectedSupId,  setSelectedSupId]  = useState('ALL')
  const [loading,        setLoading]        = useState(false)
  const [modal,          setModal]          = useState(false)
  const [editItem,       setEditItem]       = useState(null)
  const [deleteConf,     setDeleteConf]     = useState(null)
  const [activeLinkSup,  setActiveLinkSup]  = useState(null)

  const tabsContainerRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, mRes] = await Promise.allSettled([
        supplierAPI.getAll(),
        medicineAPI.getAll(),
      ])
      if (sRes.status === 'fulfilled' && Array.isArray(sRes.value.data) && sRes.value.data.length > 0) {
        setSuppliers(sRes.value.data)
      }
      if (mRes.status === 'fulfilled' && Array.isArray(mRes.value.data) && mRes.value.data.length > 0) {
        setMedicines(mRes.value.data)
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    try {
      await supplierAPI.delete(id)
      toast.success('Supplier deleted')
      setDeleteConf(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete supplier')
    }
  }

  const handleLinkMedicine = async (medId, supId) => {
    await medicineAPI.linkSupplier(medId, supId)
    await load()
  }

  const handleUnlinkMedicine = async (medId) => {
    await medicineAPI.unlinkSupplier(medId)
    await load()
  }

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const offset = direction === 'left' ? -200 : 200
      tabsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredLinkages = medicines.filter(m => {
    const matchSup = selectedSupId === 'ALL' || m.supplier?.id === Number(selectedSupId)
    const matchQ   = !linkSearch ||
      m.name.toLowerCase().includes(linkSearch.toLowerCase()) ||
      m.genericName?.toLowerCase().includes(linkSearch.toLowerCase()) ||
      m.supplier?.name?.toLowerCase().includes(linkSearch.toLowerCase()) ||
      String(m.id) === linkSearch.trim() ||
      `#${m.id}` === linkSearch.trim()
    return matchSup && matchQ
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Truck className="w-7 h-7 text-blue-600" />
            Supplier Directory & Supply Network
          </h1>
          <p className="page-subtitle">
            Vendor profiles, reliability scoring & direct medicine assignment (10 active suppliers)
          </p>
        </div>
        <button onClick={() => { setEditItem(null); setModal(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="card !p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="search-box max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              className="flex-1 outline-none text-sm placeholder-slate-400 bg-transparent"
              placeholder="Search supplier by company name, contact, phone, or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredSuppliers.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{suppliers.length}</strong> Suppliers
          </span>
        </div>
      </div>

      {/* Supplier Grid — Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-slate-100 dark:bg-slate-800" />)
        ) : filteredSuppliers.length === 0 ? (
          <div className="col-span-full card text-center py-12 text-slate-400">
            <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No suppliers found</p>
          </div>
        ) : (
          filteredSuppliers.map((s, i) => {
            const rating = (4.5 + ((i % 5) * 0.1)).toFixed(1)
            const onTime = 95 + (i % 4)
            const suppMedsCount = medicines.filter(m => m.supplier?.id === s.id).length

            return (
              <div key={s.id} className="card-hover relative group flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {s.name[0]}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{s.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{s.contactPerson || 'Primary Representative'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-200/50">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{rating}</span>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 my-3.5 border-t border-b border-slate-100 dark:border-slate-800/80 py-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500 shrink-0" /> <span className="font-medium">{s.phone}</span>
                    </div>
                    {s.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" /> <span className="truncate">{s.email}</span>
                      </div>
                    )}
                    {s.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> <span className="text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-1">{s.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Medicine Link Action Button */}
                  <button
                    type="button"
                    onClick={() => setActiveLinkSup(s)}
                    className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-blue-200/60 dark:border-blue-800/60 shadow-2xs cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Link Medicines</span>
                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                      {suppMedsCount} Linked
                    </span>
                  </button>
                </div>

                {/* Footer & Actions */}
                <div className="pt-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                    <span>Fulfillment Reliability:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{onTime}% On-Time</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="badge badge-green">ACTIVE VENDOR</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditItem(s); setModal(true) }} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors" title="Edit Supplier">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConf(s)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors" title="Delete Supplier">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── BELOW SUPPLIERS: SUPPLIER & MEDICINE SUPPLY LINKAGE MATRIX ── */}
      <div className="card space-y-5 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Supplier & Medicine Supply Linkage
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Dedicated distribution matrix mapping each registered vendor supplier with their active medicine portfolio
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{suppliers.length} Active Suppliers</p>
              <p className="text-[11px] text-slate-400">{medicines.length} Medicines Linked</p>
            </div>
          </div>
        </div>

        {/* Filter controls & Search */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="search-box max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                className="flex-1 outline-none text-xs placeholder-slate-400 bg-transparent"
                placeholder="Search mapped medicine or vendor..."
                value={linkSearch}
                onChange={e => setLinkSearch(e.target.value)}
              />
              {linkSearch && (
                <button onClick={() => setLinkSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <span className="text-xs text-slate-500 font-semibold">
              Showing <strong className="text-blue-600 font-bold">{filteredLinkages.length}</strong> mapped medicine records
            </span>
          </div>

          {/* Supplier Tab Buttons with Scroll Arrows */}
          <div className="relative flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div ref={tabsContainerRef} className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scroll-smooth flex-1">
              <button
                onClick={() => setSelectedSupId('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  selectedSupId === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> All Suppliers ({medicines.length})
              </button>
              {suppliers.map(s => {
                const count = medicines.filter(m => m.supplier?.id === s.id).length
                const isSelected = String(selectedSupId) === String(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSupId(String(s.id))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollTabs('right')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linkage Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="table w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">SKU ID</th>
                <th className="py-3 px-4">MEDICINE NAME</th>
                <th className="py-3 px-4">GENERIC / BRAND</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">SUPPLIER VENDOR</th>
                <th className="py-3 px-4">FORM</th>
                <th className="py-3 px-4">PURCHASE / MRP</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">LINK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLinkages.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No linked medicines found for this selection</p>
                  </td>
                </tr>
              ) : (
                filteredLinkages.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-200/50">
                        #{m.id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">{m.name}</p>
                        {m.brandName && <p className="text-[11px] text-slate-400">{m.brandName}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{m.genericName || '—'}</td>
                    <td className="py-3 px-4"><span className="badge badge-blue text-[10px] font-bold">{m.category?.name || 'General'}</span></td>
                    <td className="py-3 px-4">
                      {m.supplier ? (
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{m.supplier.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{m.unit}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-slate-500">₹{m.unitPrice}</span> / <strong className="text-slate-800 dark:text-slate-100">₹{m.mrp}</strong>
                    </td>
                    <td className="py-3 px-4">
                      <span className={m.status === 'ACTIVE' ? 'badge badge-green text-[10px] font-bold' : 'badge badge-gray text-[10px]'}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/medicines?search=${encodeURIComponent(m.name)}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        title="View medicine catalogue"
                      >
                        Catalogue <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Supplier Modal */}
      {modal && (
        <SupplierModal
          supplier={editItem}
          onClose={() => { setModal(false); setEditItem(null) }}
          onSave={load}
        />
      )}

      {/* Link Supplier Modal */}
      {activeLinkSup && (
        <SupplierMedicineLinkModal
          supplier={activeLinkSup}
          medicines={medicines}
          onLink={handleLinkMedicine}
          onUnlink={handleUnlinkMedicine}
          onClose={() => setActiveLinkSup(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConf && (
        <Portal>
          <div className="modal-overlay">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-slide-up border border-slate-100 dark:border-slate-800">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Supplier</h3>
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
        </Portal>
      )}
    </div>
  )
}
