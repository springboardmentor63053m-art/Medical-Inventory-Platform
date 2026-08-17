import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useKeyboardShortcut from '../hooks/useKeyboardShortcut'
import {
  LayoutDashboard, Pill, Package, Truck, ShoppingCart,
  Receipt, Users, Bell, BarChart2, Search, Settings, User,
  ArrowRight, Command, X,
} from 'lucide-react'

// Global opener — lets Navbar call this directly without synthetic events
let _globalOpen = null
export const openCommandPaletteGlobal = () => { if (_globalOpen) _globalOpen(true) }

const allItems = [
  { to: '/dashboard',      label: 'Dashboard',       icon: LayoutDashboard, roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'], keywords: 'home overview stats' },
  { to: '/medicines',      label: 'Medicines',       icon: Pill,            roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER'], keywords: 'drugs catalog pills' },
  { to: '/inventory',      label: 'Inventory',       icon: Package,         roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'], keywords: 'stock warehouse' },
  { to: '/stock-tracking', label: 'Stock Tracking',  icon: BarChart2,       roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'], keywords: 'audit movements logs stream' },
  { to: '/suppliers',      label: 'Suppliers',       icon: Truck,           roles: ['ADMIN','INVENTORY_MANAGER'], keywords: 'vendors' },
  { to: '/purchases',      label: 'Purchases',       icon: ShoppingCart,    roles: ['ADMIN','INVENTORY_MANAGER'], keywords: 'orders procurement' },
  { to: '/sales',          label: 'Sales',           icon: Receipt,         roles: ['ADMIN','PHARMACIST'], keywords: 'billing invoice' },
  { to: '/employees',      label: 'Employees',       icon: Users,           roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'], keywords: 'staff team' },
  { to: '/alerts',         label: 'Alerts',          icon: Bell,            roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'], keywords: 'notifications warnings' },
  { to: '/reports',        label: 'Reports',         icon: BarChart2,       roles: ['ADMIN','INVENTORY_MANAGER'], keywords: 'analytics charts' },
  { to: '/profile',        label: 'My Profile',      icon: User,            roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'], keywords: 'account' },
  { to: '/settings',       label: 'Settings',        icon: Settings,        roles: ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'], keywords: 'preferences theme' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Register global opener so Navbar can call it directly
  useEffect(() => {
    _globalOpen = setOpen
    return () => { _globalOpen = null }
  }, [])

  // Also listen for the custom DOM event as a fallback
  useEffect(() => {
    const handler = () => setOpen(o => !o)
    window.addEventListener('open-command-palette', handler)
    return () => window.removeEventListener('open-command-palette', handler)
  }, [])

  const items = useMemo(() =>
    allItems.filter(i => i.roles.includes(user?.role)),
    [user?.role]
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(i =>
      i.label.toLowerCase().includes(q) || i.keywords.includes(q)
    )
  }, [items, query])

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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search medicines, pages, navigate..."
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">No results for <span className="font-semibold text-slate-600 dark:text-slate-300">"{query}"</span></p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Try searching for: dashboard, medicines, inventory, sales...</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon
              return (
                <button
                  key={item.to}
                  onClick={() => go(item.to)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    idx === activeIdx
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    idx === activeIdx
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {idx === activeIdx && <ArrowRight className="w-3.5 h-3.5 opacity-60" />}
                </button>
              )
            })
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50">
          <span className="flex items-center gap-1"><kbd className="kbd">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="kbd">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="kbd">ESC</kbd> close</span>
          <span className="flex items-center gap-1 ml-auto"><Command className="w-3 h-3" /> K to toggle</span>
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
    // Fallback: fire custom event
    window.dispatchEvent(new CustomEvent('open-command-palette'))
  }
}
