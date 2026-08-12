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

  // Get user's role
  const userRoles = user?.roles || [];

  // If roles are specified, check permission
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.some((role) => userRoles.includes(role))
  ) {
    // User is logged in but does not have permission
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};