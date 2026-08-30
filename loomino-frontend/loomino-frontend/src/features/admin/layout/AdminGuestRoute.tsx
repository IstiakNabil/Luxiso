import { Navigate, Outlet } from "react-router-dom";

import { useAdminAuth } from "../hooks/useAdminAuth";

/**
 * Wraps the admin login/register pages. If an admin is
 * already signed in, redirect them straight to the dashboard.
 */
function AdminGuestRoute() {
  const { isAuthenticated, user } = useAdminAuth();

  const isAdmin =
    !!user &&
    (user.is_staff === true || user.is_superuser === true);

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default AdminGuestRoute;
