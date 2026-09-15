import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Landing from "../pages/Landing";

/** Sends the user to the dashboard that matches their role, or shows the hero landing page if signed out. */
export default function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "PHARMACIST") return <Navigate to="/pharmacist/dashboard" replace />;
  if (user.role === "SUPPLIER") return <Navigate to="/supplier/dashboard" replace />;
  return <Navigate to="/staff/dashboard" replace />;
}
