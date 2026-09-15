import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuth2Callback from "./pages/OAuth2Callback";
import AdminDashboard from "./pages/AdminDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";
import Medicines from "./pages/Medicines";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import NewSale from "./pages/NewSale";
import SalesHistory from "./pages/SalesHistory";
import Reports from "./pages/Reports";
import UserActivity from "./pages/UserActivity";
import StockMovements from "./pages/StockMovements";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import AdminUsers from "./pages/AdminUsers";
import InventorySettings from "./pages/InventorySettings";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth2/callback" element={<OAuth2Callback />} />
      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/pharmacist/dashboard"
        element={<ProtectedRoute roles={["ADMIN", "PHARMACIST"]}><PharmacistDashboard /></ProtectedRoute>}
      />
      <Route
        path="/staff/dashboard"
        element={<ProtectedRoute roles={["ADMIN", "STAFF"]}><StaffDashboard /></ProtectedRoute>}
      />
      <Route
        path="/supplier/dashboard"
        element={<ProtectedRoute roles={["SUPPLIER"]}><SupplierDashboard /></ProtectedRoute>}
      />
      <Route
        path="/medicines"
        element={<ProtectedRoute roles={["ADMIN", "PHARMACIST", "STAFF"]}><Medicines /></ProtectedRoute>}
      />
      <Route
        path="/suppliers"
        element={<ProtectedRoute roles={["ADMIN", "PHARMACIST"]}><Suppliers /></ProtectedRoute>}
      />
      <Route
        path="/purchases"
        element={<ProtectedRoute roles={["ADMIN", "PHARMACIST"]}><Purchases /></ProtectedRoute>}
      />
      <Route
        path="/reports"
        element={<ProtectedRoute roles={["ADMIN", "PHARMACIST", "STAFF"]}><Reports /></ProtectedRoute>}
      />
      <Route
        path="/sales/new"
        element={<ProtectedRoute roles={["PHARMACIST", "STAFF"]}><NewSale /></ProtectedRoute>}
      />
      <Route
        path="/sales/history"
        element={<ProtectedRoute roles={["ADMIN", "PHARMACIST", "STAFF"]}><SalesHistory /></ProtectedRoute>}
      />
      <Route
        path="/admin/activity"
        element={<ProtectedRoute roles={["ADMIN"]}><UserActivity /></ProtectedRoute>}
      />
      <Route
        path="/admin/stock-movements"
        element={<ProtectedRoute roles={["ADMIN"]}><StockMovements /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute roles={["ADMIN", "PHARMACIST", "STAFF", "SUPPLIER"]}><Profile /></ProtectedRoute>}
      />
      <Route
        path="/help"
        element={<ProtectedRoute roles={["ADMIN", "PHARMACIST", "STAFF", "SUPPLIER"]}><Help /></ProtectedRoute>}
      />
      <Route
        path="/admin/users"
        element={<ProtectedRoute roles={["ADMIN"]}><AdminUsers /></ProtectedRoute>}
      />
      <Route
        path="/admin/inventory-settings"
        element={<ProtectedRoute roles={["ADMIN"]}><InventorySettings /></ProtectedRoute>}
      />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}
