import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

/**
 * Blocks authenticated users from guest-only pages
 * (login, register, password recovery).
 */
function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
