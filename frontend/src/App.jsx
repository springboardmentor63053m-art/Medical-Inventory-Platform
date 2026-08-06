import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Medicines from "./pages/Medicines";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import UserActivity from "./pages/UserActivity";
import StockMovements from "./pages/StockMovements";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
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
      <Route path="/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
      <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route
        path="/admin/activity"
        element={<ProtectedRoute roles={["ADMIN"]}><UserActivity /></ProtectedRoute>}
      />
      <Route
        path="/admin/stock-movements"
        element={<ProtectedRoute roles={["ADMIN"]}><StockMovements /></ProtectedRoute>}
      />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}
