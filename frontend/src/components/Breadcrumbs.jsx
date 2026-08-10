import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels = {
  dashboard: 'Dashboard',
  medicines: 'Medicines',
  inventory: 'Inventory',
  suppliers: 'Suppliers',
  purchases: 'Purchases',
  sales: 'Sales',
  employees: 'Employees',
  alerts: 'Alerts',
  reports: 'Reports',
  profile: 'Profile',
  settings: 'Settings',
}

export default function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 animate-fade-in">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        const label = routeLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)

        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 opacity-50" />
            {isLast ? (
              <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
            ) : (
              <Link to={path} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
