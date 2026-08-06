import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Sends the user to the dashboard that matches their role. */
export default function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "PHARMACIST") return <Navigate to="/pharmacist/dashboard" replace />;
  return <Navigate to="/staff/dashboard" replace />;
}
