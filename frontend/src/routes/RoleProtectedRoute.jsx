import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleProtectedRoute({ allowedRoles, requireBank = null }) {
  const { role, hasBloodBank } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }

  if (requireBank !== null && hasBloodBank !== requireBank) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;