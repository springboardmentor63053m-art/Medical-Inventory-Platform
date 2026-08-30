import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get user's role and normalize
  const userRoles = user?.roles || [];
  const normalizedUserRoles = userRoles.map((r) => r.replace("ROLE_", "").toUpperCase());
  const normalizedAllowed = allowedRoles?.map((r) => r.replace("ROLE_", "").toUpperCase()) || [];

  // If roles are specified, check permission
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !normalizedAllowed.some((role) => normalizedUserRoles.includes(role))
  ) {
    // User is logged in but does not have permission
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};