import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Package, User } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";

/**
 * Auth-aware account control for the navbar.
 * Guest: links to /login.
 * Authenticated: dropdown with user info and logout.
 */
function UserMenu() {
  const { isAuthenticated, user } = useAuth();
  const { logout, isPending } = useLogout();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, [open]);

  if (!isAuthenticated) {
    return (
      <Link to="/login" aria-label="Log in">
        <User size={24} strokeWidth={1.8} />
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center"
      >
        <User size={24} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[220px] border bg-white py-2 text-[#1E1E1E] shadow-lg">
          <div className="border-b px-4 py-3">
            <p className="truncate text-[15px] font-medium text-[#1E1E1E]">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="truncate text-[13px] text-[#6F6F6F]">
              {user?.email}
            </p>
          </div>

          <Link
            to="/account/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-[15px] hover:bg-gray-50"
          >
            <User size={18} />
            My Account
          </Link>

          <Link
            to="/orders"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-[15px] hover:bg-gray-50"
          >
            <Package size={18} />
            My Orders
          </Link>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            disabled={isPending}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-[15px] hover:bg-gray-50 disabled:opacity-50"
          >
            <LogOut size={18} />
            {isPending ? "Logging Out..." : "Log Out"}
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
