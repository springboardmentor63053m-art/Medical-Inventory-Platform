import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
  { to: '/inventory', label: 'Inventory', roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
  { to: '/suppliers', label: 'Suppliers', roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
  { to: '/expiry', label: 'Expiry Tracking', roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
  { to: '/reports', label: 'Reports', roles: ['ADMIN', 'PHARMACIST'] },
  { to: '/notifications', label: 'Notifications', roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
  { to: '/users', label: 'Users', roles: ['ADMIN', 'PHARMACIST'] },
  { to: '/profile', label: 'Profile', roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
]

/** Sidebar + top bar shared by every page. */
export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 bg-slate-900 text-slate-200 p-4">
        <h1 className="text-xl font-bold text-teal-400 mb-6">MediStock</h1>
        <nav className="space-y-1">
          {links.filter((l) => l.roles.includes(user?.role)).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-teal-600 text-white' : 'hover:bg-slate-800'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <span className="text-sm text-slate-500">Medical Inventory Management Platform</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{user?.fullName}</span>
            <span className="badge bg-teal-100 text-teal-700">{user?.role}</span>
            <button className="btn-outline" onClick={() => { logout(); navigate('/login') }}>Logout</button>
          </div>
        </header>

        <motion.main
          className="p-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
