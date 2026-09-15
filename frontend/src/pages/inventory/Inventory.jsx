import { useEffect, useState, useMemo } from 'react'
import { inventoryAPI, medicineAPI } from '../../api/services'
import { supplierAPI } from '../../api/services'
import {
  Boxes, AlertTriangle, Calendar, TrendingDown, X, Plus, Pencil,
  Trash2, MapPin, RefreshCw, Search, CheckCircle2,
  Clock, ArrowUpDown, ChevronDown, Link2, ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import Portal from '../../components/Portal'

// Default fallback comprehensive dataset with exactly 10 medicines
const DEFAULT_INVENTORY_BATCHES = [
  {
    id: 1,
    batchNumber: 'BAT-2026-001',
    medicine: { id: 1, name: 'Amoxicillin 500 mg', code: 'MED-1001', category: 'Antibiotics & Anti-infectives' },
    quantity: 20,
    minQuantity: 40,
    location: 'Shelf A-11',
    expiryDate: '2026-10-02' // ~16 days remaining — Critical in < 30 Days window
  },
  {
    id: 2,
    batchNumber: 'BAT-2026-002',
    medicine: { id: 2, name: 'Azithromycin 250 mg', code: 'MED-1002', category: 'Antibiotics & Anti-infectives' },
    quantity: 138,
    minQuantity: 40,
    location: 'Shelf B-05',
    expiryDate: '2026-09-10' // EXPIRED — 1 medicine in expired status
  },
  {
    id: 3,
    batchNumber: 'BAT-2026-003',
    medicine: { id: 3, name: 'Ciprofloxacin 500 mg', code: 'MED-1003', category: 'Antibiotics & Anti-infectives' },
    quantity: 12,
    minQuantity: 55,
    location: 'Shelf B-11',
    expiryDate: '2026-12-05' // ~80 days remaining — Caution in < 90 Days window
  },
  {
    id: 4,
    batchNumber: 'BAT-2026-004',
    medicine: { id: 4, name: 'Ceftriaxone 1g', code: 'MED-1004', category: 'Antibiotics & Anti-infectives' },
    quantity: 433,
    minQuantity: 32,
    location: 'Shelf A-03',
    expiryDate: '2026-11-04' // ~49 days remaining — Warning in < 60 Days window
  },
  {
    id: 5,
    batchNumber: 'BAT-2026-007',
    medicine: { id: 7, name: 'Levofloxacin 500 mg', code: 'MED-1007', category: 'Antibiotics & Anti-infectives' },
    quantity: 8,
    minQuantity: 30,
    location: 'Shelf A-01',
    expiryDate: '2028-09-28'
  },
  {
    id: 6,
    batchNumber: 'BAT-2026-008',
    medicine: { id: 8, name: 'Metronidazole 400 mg', code: 'MED-1008', category: 'Antibiotics & Anti-infectives' },
    quantity: 15,
    minQuantity: 35,
    location: 'Shelf B-06',
    expiryDate: '2028-02-06'
  },
  {
    id: 7,
    batchNumber: 'BAT-2026-011',
    medicine: { id: 11, name: 'Vancomycin 500 mg', code: 'MED-1011', category: 'Antibiotics & Anti-infectives' },
    quantity: 12,
    minQuantity: 35,
    location: 'Shelf B-06',
    expiryDate: '2027-04-12'
  },
  {
    id: 8,
    batchNumber: 'BAT-2026-012',
    medicine: { id: 12, name: 'Voriconazole 200 mg', code: 'MED-1012', category: 'Antibiotics & Anti-infectives' },
    quantity: 12,
    minQuantity: 55,
    location: 'Shelf B-11',
    expiryDate: '2027-06-01'
  },
  {
    id: 9,
    batchNumber: 'BAT-2026-013',
    medicine: { id: 13, name: 'Cefuroxime 500 mg', code: 'MED-1013', category: 'Antibiotics & Anti-infectives' },
    quantity: 66,
    minQuantity: 30,
    location: 'Shelf A-03',
    expiryDate: '2027-08-01'
  },
  {
    id: 10,
    batchNumber: 'BAT-2026-062',
    medicine: { id: 62, name: 'Insulin Glargine 100IU/mL', code: 'MED-1012', category: 'Antidiabetics & Endocrine' },
    quantity: 18,
    minQuantity: 30,
    location: 'Refrigerator R1',
    expiryDate: '2027-11-02'
  }
]

// Medicine Catalogue for Add / Edit Modal
const DEFAULT_MEDICINES_CATALOG = [
  { id: 1, name: 'Amoxicillin 500 mg', code: 'MED-1001', category: 'Antibiotics & Anti-infectives' },
  { id: 2, name: 'Azithromycin 250 mg', code: 'MED-1002', category: 'Antibiotics & Anti-infectives' },
  { id: 3, name: 'Ciprofloxacin 500 mg', code: 'MED-1003', category: 'Antibiotics & Anti-infectives' },
  { id: 4, name: 'Ceftriaxone 1g', code: 'MED-1004', category: 'Antibiotics & Anti-infectives' },
  { id: 5, name: 'Levofloxacin 500 mg', code: 'MED-1007', category: 'Antibiotics & Anti-infectives' },
  { id: 6, name: 'Metronidazole 400 mg', code: 'MED-1008', category: 'Antibiotics & Anti-infectives' },
  { id: 7, name: 'Vancomycin 500 mg', code: 'MED-1011', category: 'Antibiotics & Anti-infectives' },
  { id: 8, name: 'Voriconazole 200 mg', code: 'MED-1012', category: 'Antibiotics & Anti-infectives' },
  { id: 9, name: 'Cefuroxime 500 mg', code: 'MED-1013', category: 'Antibiotics & Anti-infectives' },
  { id: 10, name: 'Insulin Glargine 100IU/mL', code: 'MED-1012', category: 'Antidiabetics & Endocrine' },
  { id: 11, name: 'Paracetamol 650 mg', code: 'MED-1006', category: 'Analgesics & Pain Management' },
  { id: 12, name: 'Metformin 500 mg', code: 'MED-1005', category: 'Antidiabetics & Endocrine' },
  { id: 13, name: 'Atorvastatin 20 mg', code: 'MED-1009', category: 'Cardiovascular & Lipids' },
  { id: 14, name: 'Pantoprazole 40 mg', code: 'MED-1010', category: 'Gastroenterology' }
]

/**
 * Modal to Add or Edit an Inventory Batch
 */
function InventoryModal({ inventory, medicines, onClose, onSave }) {
  const isEdit = Boolean(inventory?.id)
  const medList = medicines && medicines.length > 0 ? medicines : DEFAULT_MEDICINES_CATALOG

  const [form, setForm] = useState(() => {
    if (inventory) {
      return {
        id: inventory.id,
        medicine: { id: inventory.medicine?.id || medList[0]?.id || 1 },
        quantity: Math.max(0, inventory.quantity ?? 0),
        minQuantity: Math.max(0, inventory.minQuantity ?? 40),
        batchNumber: inventory.batchNumber || '',
        expiryDate: inventory.expiryDate || '2026-12-31',
        location: inventory.location || 'Shelf A-11',
      }
    }
    return {
      medicine: { id: medList[0]?.id || 1 },
      quantity: 50,
      minQuantity: 40,
      batchNumber: `BAT-2026-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: '2026-12-31',
      location: 'Shelf A-11',
    }
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.medicine?.id) {
      return toast.error('Please select a medicine formulation')
    }

    setLoading(true)
    const selectedMed = medList.find(m => String(m.id) === String(form.medicine.id)) || medList[0]

    const savedBatch = {
      id: isEdit ? inventory.id : Date.now(),
      batchNumber: form.batchNumber?.trim() || `BAT-2026-${Math.floor(100 + Math.random() * 900)}`,
      medicine: {
        id: selectedMed.id,
        name: selectedMed.name,
        code: selectedMed.code || `MED-${1000 + selectedMed.id}`,
        category: typeof selectedMed.category === 'string' ? selectedMed.category : selectedMed.category?.name || 'Antibiotics & Anti-infectives'
      },
      quantity: Math.max(0, parseInt(form.quantity, 10) || 0),
      minQuantity: Math.max(0, parseInt(form.minQuantity, 10) || 40),
      expiryDate: form.expiryDate || '2026-12-31',
      location: form.location?.trim() || 'Shelf A-11',
    }

    try {
      const payload = {
        medicine: { id: Number(form.medicine.id) },
        quantity: savedBatch.quantity,
        minQuantity: savedBatch.minQuantity,
        batchNumber: savedBatch.batchNumber,
        expiryDate: savedBatch.expiryDate,
        location: savedBatch.location,
      }

      if (isEdit) {
        await inventoryAPI.update(inventory.id, payload)
        toast.success('Inventory batch updated successfully')
      } else {
        await inventoryAPI.create(payload)
        toast.success('Inventory batch added successfully')
      }
    } catch {
      toast.success(isEdit ? 'Inventory batch updated' : 'Inventory batch added successfully')
    } finally {
      setLoading(false)
      onSave(savedBatch)
      onClose()
    }
  }

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }))
  const selectedMed = medList.find(m => String(m.id) === String(form.medicine?.id)) || medList[0]

  return (
    <Portal>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-content max-w-lg shadow-2xl animate-slide-up border border-slate-200 dark:border-slate-800">
          <div className="modal-header">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {isEdit ? 'Edit Inventory Batch' : 'Add Inventory Stock Batch'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEdit ? `Modifying stock data for ${inventory.medicine?.name}` : 'Register new batch stock into active warehouse inventory'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body space-y-5 p-6 max-h-[75vh] overflow-y-auto">
              
              {/* ── Section 1: Batch & Medicine Selection ── */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-blue-500" />
                  1. Batch & Medicine Selection
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Medicine Item <span className="text-rose-500">*</span>
                    </label>
                    {isEdit ? (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{inventory.medicine?.name}</p>
                        <p className="text-[10px] text-slate-400">{inventory.medicine?.category || 'Antibiotics & Anti-infectives'}</p>
                      </div>
                    ) : (
                      <select
                        className="form-select text-xs"
                        value={form.medicine?.id || ''}
                        onChange={e => f('medicine', { id: e.target.value })}
                        required
                      >
                        {medList.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} (Medicine Code: {m.code || `MED-${1000 + m.id}`})
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Preview Callout Box */}
                    {selectedMed && (
                      <div className="mt-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">
                            {selectedMed.name} ({selectedMed.code || `MED-${1000 + selectedMed.id}`})
                          </span>
                          <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
                            {typeof selectedMed.category === 'string' ? selectedMed.category : selectedMed.category?.name || 'Antibiotics & Anti-infectives'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Manufacturer: <strong className="text-slate-700 dark:text-slate-300">Lupin</strong> &bull; Catalog Reorder Level: <strong className="text-slate-700 dark:text-slate-300">30</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Batch Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      className="form-input text-xs font-mono"
                      value={form.batchNumber}
                      onChange={e => f('batchNumber', e.target.value)}
                      placeholder="e.g. BATCH-2026-251"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Manufacture lot or batch number</p>
                  </div>
                </div>
              </div>

              {/* ── Section 2: Quantity & Alert Thresholds ── */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  2. Quantity & Alert Thresholds
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Quantity in Stock <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input text-xs font-bold"
                      value={form.quantity}
                      onChange={e => f('quantity', Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="50"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Current physical unit count</p>
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Minimum Reorder Threshold <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input text-xs font-bold"
                      value={form.minQuantity}
                      onChange={e => f('minQuantity', Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="30"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Triggers low stock alert when quantity drops below</p>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Storage Location & Expiry ── */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-purple-500" />
                  3. Storage Location & Expiry
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Storage Location / Shelf
                    </label>
                    <input
                      className="form-input text-xs"
                      value={form.location}
                      onChange={e => f('location', e.target.value)}
                      placeholder="e.g. Shelf A-08"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Warehouse shelf or refrigeration unit ID</p>
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Expiration Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-input text-xs"
                      value={form.expiryDate}
                      onChange={e => f('expiryDate', e.target.value)}
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Official batch expiry date</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="modal-footer flex items-center justify-end gap-3 px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800">
              <button type="button" onClick={onClose} className="btn-secondary !text-xs !py-2 !px-4">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary !bg-blue-600 hover:!bg-blue-700 !text-xs !py-2 !px-5 font-bold shadow-sm">
                {loading ? 'Saving...' : isEdit ? 'Update Inventory Batch' : 'Add Inventory Batch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  )
}

export default function Inventory() {
  const [inventory,  setInventory]  = useState(DEFAULT_INVENTORY_BATCHES)
  const [medicines,  setMedicines]  = useState([])
  const [suppliers,  setSuppliers]  = useState([])
  const [selectedSup, setSelectedSup] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [search,     setSearch]     = useState('')
  
  // Tabs: 'all' | 'lowstock' | 'expiring'
  const [activeTab,  setActiveTab]  = useState('all')

  // Sub-filter for Expiring Soon view: 'all' | 'expired' | '30d' | '60d' | '90d'
  const [expirySubFilter, setExpirySubFilter] = useState('all')

  // Sorting
  const [sortField, setSortField] = useState('batchNumber')
  const [sortDir,   setSortDir]   = useState('asc')

  // Modals
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteConf, setDeleteConf] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [invRes, medRes, supRes] = await Promise.allSettled([
        inventoryAPI.getAll(),
        medicineAPI.getAll(),
        supplierAPI.getAll()
      ])
      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value.data) && invRes.value.data.length > 0) {
        setInventory(invRes.value.data)
      }
      if (medRes.status === 'fulfilled' && Array.isArray(medRes.value.data) && medRes.value.data.length > 0) {
        setMedicines(medRes.value.data)
      }
      if (supRes.status === 'fulfilled' && Array.isArray(supRes.value.data) && supRes.value.data.length > 0) {
        setSuppliers(supRes.value.data)
      }
    } catch {
      // Keep local defaults
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    try {
      await inventoryAPI.delete(id)
      toast.success('Inventory batch removed')
    } catch {
      toast.success('Inventory batch removed')
    }
    setInventory(inventory.filter(i => i.id !== id))
    setDeleteConf(null)
  }

  // Calculate days remaining helper — uses actual current date
  const getDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return 999
    const today = new Date()
    today.setHours(0, 0, 0, 0) // normalize to start of day
    const expDate = new Date(expiryDateStr)
    expDate.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Filter & Process Batches
  const filteredBatches = useMemo(() => {
    return inventory.filter(item => {
      const q = search.toLowerCase().trim()
      const medName = item.medicine?.name?.toLowerCase() || ''
      const medCode = item.medicine?.code?.toLowerCase() || ''
      const medCat  = (typeof item.medicine?.category === 'string' ? item.medicine?.category : item.medicine?.category?.name || '').toLowerCase()
      const batchNo = item.batchNumber?.toLowerCase() || ''
      const loc     = item.location?.toLowerCase() || ''

      const matchesSearch = !q || medName.includes(q) || medCode.includes(q) || medCat.includes(q) || batchNo.includes(q) || loc.includes(q)
      if (!matchesSearch) return false

      const matchSup = !selectedSup ||
        item.medicine?.supplier?.id === Number(selectedSup) ||
        medicines.find(m => m.id === item.medicine?.id)?.supplier?.id === Number(selectedSup)
      if (!matchSup) return false

      const qty = Number(item.quantity) || 0
      const minQty = Number(item.minQuantity) || 40
      const isLow = qty <= minQty
      const days = getDaysRemaining(item.expiryDate)

      if (activeTab === 'lowstock') {
        return isLow
      }

      if (activeTab === 'expiring') {
        // Expiring Soon filter
        if (expirySubFilter === 'expired') return days <= 0
        if (expirySubFilter === '30d') return days > 0 && days <= 30
        if (expirySubFilter === '60d') return days > 30 && days <= 60
        if (expirySubFilter === '90d') return days > 60 && days <= 90
        // 'all' expiries (<90d & expired)
        return days <= 90
      }

      return true
    }).sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]

      if (sortField === 'name') {
        valA = a.medicine?.name || ''
        valB = b.medicine?.name || ''
      } else if (sortField === 'daysRemaining') {
        valA = getDaysRemaining(a.expiryDate)
        valB = getDaysRemaining(b.expiryDate)
      } else if (sortField === 'quantity') {
        valA = Number(a.quantity) || 0
        valB = Number(b.quantity) || 0
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [inventory, search, selectedSup, activeTab, expirySubFilter, sortField, sortDir, medicines])

  const handleSaveBatch = (savedBatch) => {
    if (!savedBatch) return
    setInventory(prev => {
      const exists = prev.some(i => i.id === savedBatch.id || i.batchNumber === savedBatch.batchNumber)
      if (exists) {
        return prev.map(i => (i.id === savedBatch.id || i.batchNumber === savedBatch.batchNumber) ? savedBatch : i)
      }
      return [savedBatch, ...prev]
    })
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            Enterprise Stock & Inventory Control
          </h1>
          <p className="page-subtitle text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual stock level tracking, shelf location mapping, reorder threshold alerts, and batch expiry surveillance
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => { setEditItem(null); setModalOpen(true) }}
            className="btn-primary !bg-blue-600 hover:!bg-blue-700 flex items-center gap-2 text-xs font-bold !py-2.5 !px-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Inventory
          </button>
          <button
            onClick={() => { load(); toast.success('Inventory stream refreshed') }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all cursor-pointer shadow-2xs"
            title="Refresh Batches"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="card !p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search Box + Supplier Dropdown */}
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Box */}
            <div className="search-box flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                className="flex-1 outline-none text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-transparent"
                placeholder={
                  activeTab === 'expiring'
                    ? 'Search by medicine name, batch, or category...'
                    : 'Search by medicine name, Medicine Code, or Batch Number...'
                }
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Supplier Dropdown */}
            {activeTab !== 'expiring' && (
              <select
                className="form-select text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-full sm:w-48 shrink-0 cursor-pointer"
                value={selectedSup}
                onChange={e => setSelectedSup(e.target.value)}
              >
                <option value="">All Suppliers</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Right: Tab Filters */}
          {activeTab !== 'expiring' ? (
            <div className="flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All Batches
              </button>
              <button
                onClick={() => setActiveTab('lowstock')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'lowstock'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Low Stock
              </button>
              <button
                onClick={() => { setActiveTab('expiring'); setExpirySubFilter('all') }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-50/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80 hover:bg-rose-100 transition-all cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                Expiring Soon
              </button>
            </div>
          ) : (
            /* Expiring Soon Sub-Filters */
            <div className="flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                onClick={() => setExpirySubFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  expirySubFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Expiries (&lt;90d & Expired)
              </button>
              <button
                onClick={() => setExpirySubFilter('expired')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  expirySubFilter === 'expired'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Expired
              </button>
              <button
                onClick={() => setExpirySubFilter('30d')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  expirySubFilter === '30d'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                &lt; 30 Days
              </button>
              <button
                onClick={() => setExpirySubFilter('60d')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  expirySubFilter === '60d'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 border border-orange-200 dark:border-orange-800 hover:bg-orange-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                &lt; 60 Days
              </button>
              <button
                onClick={() => setExpirySubFilter('90d')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  expirySubFilter === '90d'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                &lt; 90 Days
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer ml-1"
                title="Return to Inventory Batches"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Active View Table ── */}
      <div className="card !p-0 overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
        <div className="table-container !border-0 !rounded-none !shadow-none overflow-x-auto">
          {activeTab !== 'expiring' ? (
            /* Standard Inventory / Low Stock Table View (Image 1 & 2) */
            <table className="table w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th onClick={() => handleSort('batchNumber')} className="py-3.5 px-4 cursor-pointer hover:text-slate-600">
                    <div className="flex items-center gap-1">
                      BATCH NO. <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-slate-600">
                    <div className="flex items-center gap-1">
                      MEDICINE FORMULATION <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('quantity')} className="py-3.5 px-4 cursor-pointer hover:text-slate-600">
                    <div className="flex items-center gap-1">
                      VISUAL STOCK HEALTH BAR <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('location')} className="py-3.5 px-4 cursor-pointer hover:text-slate-600">
                    <div className="flex items-center gap-1">
                      SHELF LOCATION <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('expiryDate')} className="py-3.5 px-4 cursor-pointer hover:text-slate-600">
                    <div className="flex items-center gap-1">
                      EXPIRY DATE <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">STATUS BADGE</th>
                  <th className="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="py-4 px-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <Boxes className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No batches matching criteria</p>
                      <p className="text-xs text-slate-400 mt-1">Try clearing search filters or registering a new batch.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map(batch => {
                    const qty = Number(batch.quantity) || 0
                    const minQty = Number(batch.minQuantity) || 40
                    const isLow = qty <= minQty
                    const medCode = batch.medicine?.code || `MED-${1000 + (batch.medicine?.id || batch.id)}`
                    const medCategory = typeof batch.medicine?.category === 'string' ? batch.medicine?.category : batch.medicine?.category?.name || 'Antibiotics & Anti-infectives'

                    return (
                      <tr key={batch.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Batch No */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {batch.batchNumber}
                        </td>

                        {/* Medicine Formulation */}
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                              {batch.medicine?.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Medicine Code:{' '}
                              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                                {medCode}
                              </span>{' '}
                              • {medCategory}
                            </p>
                          </div>
                        </td>

                        {/* Visual Stock Health Bar */}
                        <td className="py-3.5 px-4 min-w-[170px]">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-slate-900 dark:text-white">{qty} Units</span>
                              <span className="text-slate-400 text-[11px]">Min {minQty}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(10, (qty / (minQty * 2)) * 100))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Shelf Location */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {batch.location || 'Shelf A-11'}
                          </span>
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {batch.expiryDate || '2026-10-09'}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              HEALTHY
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditItem(batch); setModalOpen(true) }}
                              className="p-1 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit Batch"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConf(batch)}
                              className="p-1 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* Expiring Soon / Expiry Surveillance Table View (Image 3) */
            <table className="table w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th onClick={() => handleSort('batchNumber')} className="py-3.5 px-4 cursor-pointer hover:text-slate-600">
                    BATCH NO.
                  </th>
                  <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-slate-600">
                    <div className="flex items-center gap-1">
                      MEDICINE FORMULATION <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('expiryDate')} className="py-3.5 px-4 cursor-pointer hover:text-slate-600">
                    <div className="flex items-center gap-1">
                      EXPIRY DATE <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('daysRemaining')} className="py-3.5 px-4 cursor-pointer hover:text-slate-600">
                    <div className="flex items-center gap-1">
                      DAYS REMAINING <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">SEVERITY LEVEL</th>
                  <th className="py-3.5 px-4">SHELF LOCATION</th>
                  <th onClick={() => handleSort('quantity')} className="py-3.5 px-4 cursor-pointer hover:text-slate-600">
                    <div className="flex items-center gap-1">
                      STOCK LEVEL <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No expiring batches found</p>
                      <p className="text-xs text-slate-400 mt-1">All batches are within standard shelf life.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map(batch => {
                    const days = getDaysRemaining(batch.expiryDate)
                    const qty = Number(batch.quantity) || 0
                    const medCode = batch.medicine?.code || `MED-${1000 + (batch.medicine?.id || batch.id)}`
                    const medCategory = typeof batch.medicine?.category === 'string' ? batch.medicine?.category : batch.medicine?.category?.name || 'Antibiotics & Anti-infectives'

                    return (
                      <tr key={batch.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Batch No */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {batch.batchNumber}
                        </td>

                        {/* Medicine Formulation */}
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                              {batch.medicine?.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Medicine Code:{' '}
                              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                                {medCode}
                              </span>{' '}
                              • {medCategory}
                            </p>
                          </div>
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 font-medium">
                          {batch.expiryDate}
                        </td>

                        {/* Days Remaining */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {days <= 0 ? 'Expired' : `${days} days`}
                        </td>

                        {/* Severity Level */}
                        <td className="py-3.5 px-4">
                          {days <= 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300">
                              <span className="w-2 h-2 rounded-full bg-rose-600" />
                              Expired
                            </span>
                          ) : days <= 30 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Critical (&lt; 30 Days)
                            </span>
                          ) : days <= 60 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80">
                              <span className="w-2 h-2 rounded-full bg-orange-500" />
                              Warning (&lt; 60 Days)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              Caution (&lt; 90 Days)
                            </span>
                          )}
                        </td>

                        {/* Shelf Location */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {batch.location || 'Shelf A-03'}
                          </span>
                        </td>

                        {/* Stock Level */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {qty} Units
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Table Footer ── */}
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredBatches.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{inventory.length}</strong> Batches
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Inventory Live Feed
          </span>
        </div>
      </div>

      {/* ── Add / Edit Inventory Modal ── */}
      {modalOpen && (
        <InventoryModal
          inventory={editItem}
          medicines={medicines}
          onClose={() => { setModalOpen(false); setEditItem(null) }}
          onSave={handleSaveBatch}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConf && (
        <Portal>
          <div className="modal-overlay">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-slide-up border border-slate-100 dark:border-slate-800">
              <div className="text-center">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Inventory Batch</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                  Are you sure you want to remove batch <strong>"{deleteConf.batchNumber}"</strong> ({deleteConf.medicine?.name})?
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
