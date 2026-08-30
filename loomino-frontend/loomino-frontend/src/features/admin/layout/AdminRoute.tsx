import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";

import { useAdminAuth } from "../hooks/useAdminAuth";
import { getProfile } from "@/features/auth/services/auth.service";
import { setAdminUser } from "../store/adminAuthSlice";
import type { AppDispatch } from "@/app/store/store";

/**
 * Guards the admin area. Requires an authenticated user whose
 * profile is flagged as staff/admin.
 *
 * If the stored user object doesn't yet carry is_staff (e.g.
 * the login response omitted it, or the session was restored
 * from storage), we fetch the profile once to resolve it —
 * so a direct visit or refresh on /admin works.
 */
function AdminRoute() {
  const { isAuthenticated, user } = useAdminAuth();
  const dispatch = useDispatch<AppDispatch>();

  const hasFlag =
    !!user &&
    (typeof user.is_staff === "boolean" ||
      typeof user.is_superuser === "boolean");

  const [checking, setChecking] = useState(
    isAuthenticated && !hasFlag,
  );

  useEffect(() => {
    let active = true;
    if (isAuthenticated && !hasFlag) {
      getProfile()
        .then((profile) => {
          if (!active) return;
          dispatch(setAdminUser({ ...user, ...profile }));
        })
        .catch(() => {})
        .finally(() => {
          if (active) setChecking(false);
        });
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, hasFlag]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center text-[#8A7C64]">
        Loading…
      </div>
    );
  }

  const isAdmin =
    !!user &&
    (user.is_staff === true || user.is_superuser === true);

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
