import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import PrivateRoute from './routes/PrivateRoute'
import CommandPalette from './components/CommandPalette'
import MedStockAIAssistant from './components/ai-assistant/MedStockAIAssistant'

// Auth Pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Core Pages
import Dashboard     from './pages/dashboard/Dashboard'
import Medicines     from './pages/medicines/Medicines'
import Inventory     from './pages/inventory/Inventory'
import StockTracking from './pages/stocktracking/StockTracking'

// Operations Pages
import Prescriptions from './pages/prescriptions/Prescriptions'
import Patients      from './pages/patients/Patients'
import Doctors       from './pages/doctors/Doctors'
import Suppliers     from './pages/suppliers/Suppliers'
import Purchases     from './pages/purchases/Purchases'
import Sales         from './pages/sales/Sales'
import Employees     from './pages/employees/Employees'

// Intelligence Pages
import AIInsights    from './pages/aiinsights/AIInsights'
import Alerts        from './pages/alerts/Alerts'

// Reporting & System Pages
import Reports       from './pages/reports/Reports'
import AuditLogs     from './pages/auditlogs/AuditLogs'
import Profile       from './pages/profile/Profile'
import Settings      from './pages/settings/Settings'

export default function App() {
  const { user } = useAuth()

  return (
    <>
      {user && <CommandPalette />}
      {user && <MedStockAIAssistant />}
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        </Route>

        {/* Protected App Routes */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          {/* Core */}
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/medicines"      element={<Medicines />} />
          <Route path="/inventory"      element={<Inventory />} />
          <Route path="/stock-tracking" element={<StockTracking />} />

          {/* Operations */}
          <Route path="/prescriptions"  element={<Prescriptions />} />
          <Route path="/patients"       element={<Patients />} />
          <Route path="/doctors"        element={<Doctors />} />
          <Route path="/suppliers"      element={<Suppliers />} />
          <Route path="/purchases"      element={<Purchases />} />
          <Route path="/sales"          element={<Sales />} />
          <Route path="/employees"      element={<Employees />} />

          {/* Intelligence */}
          <Route path="/ai-insights"    element={<AIInsights />} />
          <Route path="/alerts"         element={<Alerts />} />

          {/* Reporting & System */}
          <Route path="/reports"        element={<Reports />} />
          <Route path="/audit-logs"     element={<AuditLogs />} />
          <Route path="/profile"        element={<Profile />} />
          <Route path="/settings"       element={<Settings />} />
        </Route>

        {/* Default redirect */}
        <Route path="/"  element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}
