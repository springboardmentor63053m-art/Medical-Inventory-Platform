import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useKeyboardShortcut from '../hooks/useKeyboardShortcut'
import {
  medicineAPI, patientAPI, doctorAPI, prescriptionAPI, supplierAPI
} from '../api/services'
import {
  LayoutDashboard, Pill, Package, Truck, ShoppingCart,
  Receipt, Users, Bell, BarChart2, Search, Settings, User,
  ArrowRight, Command, X, Sparkles, History, UserCheck,
  Stethoscope, FileText, Plus, Camera, Zap, ShieldCheck,
  CheckCircle2, Clock, AlertTriangle, ChevronRight
} from 'lucide-react'

// Global opener
let _globalOpen = null
export const openCommandPaletteGlobal = () => { if (_globalOpen) _globalOpen(true) }

const allPages = [
  { to: '/dashboard',      label: 'Dashboard Overview',           category: 'Pages', icon: LayoutDashboard, keywords: 'home overview analytics telemetry kpi' },
  { to: '/medicines',      label: 'Medicines Catalogue',          category: 'Pages', icon: Pill,            keywords: 'drugs formulations dosage pills skus' },
  { to: '/inventory',      label: 'Inventory & Warehouse Stock',  category: 'Pages', icon: Package,         keywords: 'stock warehouse batches quantities' },
  { to: '/stock-tracking', label: 'Stock Tracking & FEFO Audit',  category: 'Pages', icon: BarChart2,       keywords: 'movements audit expiry fefo stream logs' },
  { to: '/prescriptions',  label: 'Prescription Management',      category: 'Pages', icon: FileText,        keywords: 'prescriptions rx ocr dispensing review' },
  { to: '/patients',       label: 'Patient Management & History', category: 'Pages', icon: UserCheck,       keywords: 'patients profiles clinical allergies' },
  { to: '/doctors',        label: 'Physician & Doctor Directory', category: 'Pages', icon: Stethoscope,     keywords: 'doctors physicians specialists registry' },
  { to: '/ai-insights',    label: 'AI Pharmacy Intelligence',     category: 'Pages', icon: Sparkles,        keywords: 'ai forecast demand intelligence chatbot neural analytics' },
  { to: '/suppliers',      label: 'Suppliers & Vendors',          category: 'Pages', icon: Truck,           keywords: 'vendors distributors procurement partners' },
  { to: '/purchases',      label: 'Purchase Orders & Inward',     category: 'Pages', icon: ShoppingCart,    keywords: 'purchase orders procurement invoices incoming' },
  { to: '/sales',          label: 'POS Sales & Dispensing',       category: 'Pages', icon: Receipt,         keywords: 'pos billing invoice cashier checkout' },
  { to: '/alerts',         label: 'Alerts & Critical Warnings',   category: 'Pages', icon: Bell,            keywords: 'notifications stockout expiry low stock' },
  { to: '/reports',        label: 'Reports & Business Analytics', category: 'Pages', icon: BarChart2,       keywords: 'financial reports pdf revenue exports' },
  { to: '/audit-logs',     label: 'Audit Logs & Compliance',      category: 'Pages', icon: History,         keywords: 'audit logs compliance security ledger sha256' },
  { to: '/employees',      label: 'Staff & Employee Directory',   category: 'Pages', icon: Users,           keywords: 'staff users pharmacists roles employees' },
  { to: '/profile',        label: 'User Profile & Account',       category: 'Pages', icon: User,            keywords: 'account credentials password me' },
  { to: '/settings',       label: 'System Settings & Theme',      category: 'Pages', icon: Settings,        keywords: 'preferences dark mode appearance configuration' },
]

const quickActions = [
  { to: '/prescriptions',  label: '+ Create New Prescription',       category: 'Quick Actions', icon: Plus,      subtext: 'Issue digital medical prescription', keywords: 'new add prescription rx' },
  { to: '/prescriptions',  label: '📷 Upload Prescription Scan (OCR)',category: 'Quick Actions', icon: Camera,    subtext: 'Neural OCR handwriting scanner',     keywords: 'ocr upload camera scan' },
  { to: '/sales',          label: '+ New POS Sale & Dispense',       category: 'Quick Actions', icon: Receipt,   subtext: 'Open point-of-sale checkout register', keywords: 'pos new sale bill' },
  { to: '/patients',       label: '+ Register New Patient',          category: 'Quick Actions', icon: UserCheck, subtext: 'Create electronic patient record', keywords: 'add patient register' },
  { to: '/medicines',      label: '+ Add New Medicine SKU',          category: 'Quick Actions', icon: Pill,      subtext: 'Register new drug formula & barcode', keywords: 'add medicine drug sku' },
  { to: '/purchases',      label: '+ Create Purchase Order',         category: 'Quick Actions', icon: ShoppingCart, subtext: 'Replenish stock from vendor', keywords: 'new po purchase order' },
  { to: '/ai-insights',    label: '🧠 Inspect AI Stockout Radar',    category: 'Quick Actions', icon: Sparkles,  subtext: 'Run predictive 30-day forecast', keywords: 'ai stockout demand projection' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Dynamic entity cache for live search
  const [medicines,     setMedicines]     = useState([])
  const [patients,      setPatients]      = useState([])
  const [doctors,       setDoctors]       = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [suppliers,     setSuppliers]     = useState([])

  // Register global opener so Navbar can call it directly
  useEffect(() => {
    _globalOpen = setOpen
    return () => { _globalOpen = null }
  }, [])

  // Also listen for custom DOM event as fallback
  useEffect(() => {
    const handler = () => setOpen(o => !o)
    window.addEventListener('open-command-palette', handler)
    return () => window.removeEventListener('open-command-palette', handler)
  }, [])

  // Load database items on open for dynamic search
  useEffect(() => {
    if (!open) return

    const loadLiveEntities = async () => {
      try {
        const [mRes, pRes, dRes, rxRes, sRes] = await Promise.all([
          medicineAPI.getAll().catch(() => ({ data: [] })),
          patientAPI.getAll().catch(() => ({ data: [] })),
          doctorAPI.getAll().catch(() => ({ data: [] })),
          prescriptionAPI.getAll().catch(() => ({ data: [] })),
          supplierAPI.getAll().catch(() => ({ data: [] }))
        ])
        setMedicines(Array.isArray(mRes.data) ? mRes.data : [])
        setPatients(Array.isArray(pRes.data) ? pRes.data : [])
        setDoctors(Array.isArray(dRes.data) ? dRes.data : [])
        setPrescriptions(Array.isArray(rxRes.data) ? rxRes.data : [])
        setSuppliers(Array.isArray(sRes.data) ? sRes.data : [])
      } catch (e) {
        // Silent catch
      }
    }

    loadLiveEntities()
  }, [open])

  // Build unified search universe
  const allSearchItems = useMemo(() => {
    const list = [
      ...allPages,
      ...quickActions,
    ]

    // Append dynamic medicines
    medicines.forEach(m => {
      list.push({
        to: '/medicines',
        label: m.name,
        category: 'Medicines & Drugs',
        subtext: `${m.category?.name || 'General'} · ₹${m.unitPrice || 0} / unit`,
        icon: Pill,
        badge: `${m.stockQuantity || 0} in stock`,
        keywords: `${m.name} ${m.genericName || ''} ${m.category?.name || ''} ${m.sku || ''} drug medicine`
      })
    })

    // Append dynamic patients
    patients.forEach(p => {
      list.push({
        to: '/patients',
        label: p.fullName || `${p.firstName} ${p.lastName}`,
        category: 'Patients',
        subtext: `ID: ${p.patientId} · Phone: ${p.phone} · Blood: ${p.bloodGroup || 'N/A'}`,
        icon: UserCheck,
        badge: p.status || 'ACTIVE',
        keywords: `${p.firstName} ${p.lastName} ${p.patientId} ${p.phone} ${p.bloodGroup} ${p.allergies || ''} patient`
      })
    })

    // Append dynamic doctors
    doctors.forEach(d => {
      list.push({
        to: '/doctors',
        label: d.name,
        category: 'Physicians & Doctors',
        subtext: `${d.specialty} · ${d.hospital || 'Hospital Affiliated'}`,
        icon: Stethoscope,
        badge: d.registrationNumber,
        keywords: `${d.name} ${d.specialty} ${d.hospital} ${d.registrationNumber} doctor physician`
      })
    })

    // Append dynamic prescriptions
    prescriptions.forEach(rx => {
      list.push({
        to: '/prescriptions',
        label: `${rx.prescriptionNumber} — ${rx.patient?.fullName || 'Patient RX'}`,
        category: 'Prescriptions',
        subtext: `Doctor: ${rx.doctor?.name || 'Physician'} · ${rx.prescriptionDate || 'Recent'}`,
        icon: FileText,
        badge: rx.status,
        keywords: `${rx.prescriptionNumber} ${rx.patient?.fullName} ${rx.doctor?.name} ${rx.status} prescription`
      })
    })

    // Append dynamic suppliers
    suppliers.forEach(s => {
      list.push({
        to: '/suppliers',
        label: s.name,
        category: 'Suppliers & Vendors',
        subtext: `Contact: ${s.contactPerson || s.phone || 'Supplier Partner'}`,
        icon: Truck,
        keywords: `${s.name} ${s.contactPerson} ${s.phone} ${s.email} supplier vendor`
      })
    })

    return list
  }, [medicines, patients, doctors, prescriptions, suppliers])

  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Default view: show all main pages and quick actions
      return [...quickActions.slice(0, 4), ...allPages]
    }
    const q = query.toLowerCase().trim()
    return allSearchItems.filter(i =>
      i.label.toLowerCase().includes(q) ||
      (i.subtext && i.subtext.toLowerCase().includes(q)) ||
      (i.category && i.category.toLowerCase().includes(q)) ||
      (i.keywords && i.keywords.toLowerCase().includes(q))
    )
  }, [allSearchItems, query])

  useKeyboardShortcut('ctrl+k', () => setOpen(o => !o))
  useKeyboardShortcut('cmd+k', () => setOpen(o => !o))

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
    }
  }, [open])

  useEffect(() => { setActiveIdx(0) }, [query])

  const go = (to) => {
    navigate(to)
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[activeIdx]) {
      go(filtered[activeIdx].to)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setOpen(false)} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up flex flex-col max-h-[80vh]">
        {/* Search Header Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>

          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search medicines, patients, doctors, prescriptions, pages, actions..."
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-mono font-bold border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-slate-100/50 dark:divide-slate-800/40 text-xs custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No matching records found for "{query}"
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Search across all 14 application pages, drugs, patients, physicians, prescriptions, or quick actions.
              </p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon || ArrowRight
              const isSelected = idx === activeIdx

              return (
                <button
                  key={`${item.category}-${item.label}-${idx}`}
                  onClick={() => go(item.to)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 pl-5'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.label}
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                          {item.category}
                        </span>
                      </div>

                      {item.subtext && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          {item.subtext}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.badge && (
                      <span className="badge badge-teal text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">↑↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">↵</kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">ESC</kbd>
              <span>close</span>
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <Command className="w-3 h-3" />
            <span>Ctrl + K Omni-Search</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Call this from Navbar or anywhere to open the command palette directly */
export function openCommandPalette() {
  if (_globalOpen) {
    _globalOpen(o => !o)
  } else {
    window.dispatchEvent(new CustomEvent('open-command-palette'))
  }
}
