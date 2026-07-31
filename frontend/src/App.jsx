import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import PrivateRoute from './routes/PrivateRoute'

// Auth Pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// App Pages
import Dashboard  from './pages/dashboard/Dashboard'
import Medicines  from './pages/medicines/Medicines'
import Inventory  from './pages/inventory/Inventory'
import Suppliers  from './pages/suppliers/Suppliers'
import Purchases  from './pages/purchases/Purchases'
import Sales      from './pages/sales/Sales'
import Employees  from './pages/employees/Employees'
import Alerts     from './pages/alerts/Alerts'
import Reports    from './pages/reports/Reports'
import Profile    from './pages/profile/Profile'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      </Route>

      {/* Protected App Routes */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/medicines"  element={<Medicines />} />
        <Route path="/inventory"  element={<Inventory />} />
        <Route path="/suppliers"  element={<Suppliers />} />
        <Route path="/purchases"  element={<Purchases />} />
        <Route path="/sales"      element={<Sales />} />
        <Route path="/employees"  element={<Employees />} />
        <Route path="/alerts"     element={<Alerts />} />
        <Route path="/reports"    element={<Reports />} />
        <Route path="/profile"    element={<Profile />} />
      </Route>

      {/* Default redirect */}
      <Route path="/"  element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
