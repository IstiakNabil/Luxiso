import { Navigate, Outlet } from "react-router-dom";

import { useAdminAuth } from "@/features/admin/hooks/useAdminAuth";
import { POSAuthProvider } from "./POSAuthProvider";
import { usePOSAuth } from "../hooks/usePOSAuth";

/**
 * Sits as a SIBLING to <AdminRoute>, not nested inside it — an
 * e-commerce admin (is_staff) has no automatic POS access, and a POS
 * user has no automatic e-commerce admin access. The two guards
 * happen to check the same JWT (see api.ts's isAdminContext), but
 * that's a shared login session, not a shared permission.
 */
function POSRoute() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <POSAuthProvider>
      <POSAccessGate />
    </POSAuthProvider>
  );
}

function POSAccessGate() {
  const { me, isLoading } = usePOSAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-[#8A7C64]">
        Loading…
      </div>
    );
  }

  if (!me?.has_pos_access) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-[#F7F5F1] text-center">
        <p className="text-lg font-semibold text-[#2C2418]">
          You don't have POS access
        </p>
        <p className="max-w-sm text-sm text-[#8A7C64]">
          Your account isn't set up as POS staff. Ask an Admin to add you
          under User Management once that's available, or return to the
          storefront admin panel.
        </p>
      </div>
    );
  }

  return <Outlet />;
}

export default POSRoute;
