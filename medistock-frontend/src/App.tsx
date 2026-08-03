import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Dashboard } from "./pages/Dashboard";
import { ResourceManager } from "./pages/ResourceManager";
import { resources } from "./pages/resources";
import { NotFound } from "./pages/NotFound";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/medicines" element={<ResourceManager config={resources.medicines} />} />
              <Route path="/suppliers" element={<ResourceManager config={resources.suppliers} />} />
              <Route path="/inventory" element={<ResourceManager config={resources.inventory} />} />
              <Route path="/purchases" element={<ResourceManager config={resources.purchases} />} />
              <Route path="/purchase-items" element={<ResourceManager config={resources.purchaseItems} />} />
              <Route path="/reports" element={<ResourceManager config={resources.reports} />} />
              <Route path="/users" element={<ResourceManager config={resources.users} />} />
              <Route path="/roles" element={<ResourceManager config={resources.roles} />} />
              <Route path="/stock-activity" element={<ResourceManager config={resources.stockLogs} />} />
              <Route path="/notifications" element={<ResourceManager config={resources.notifications} />} />
              <Route path="/expiries" element={<ResourceManager config={resources.expiries} />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </Router>
  );
}

export default App;
