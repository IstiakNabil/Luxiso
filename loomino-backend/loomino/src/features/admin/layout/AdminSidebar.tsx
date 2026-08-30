import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Package,
  ShoppingCart,
  Ticket,
  Users,
  Mail,
  Send,
  LayoutGrid,
  ChevronDown,
  LogOut,
} from "lucide-react";

import { useDispatch } from "react-redux";

import type { AppDispatch } from "@/app/store/store";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { adminLogout } from "../store/adminAuthSlice";
import { adminStorage } from "../utils/adminStorage";
import { ADMIN_NAV } from "./adminNav";

const ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  home: Home,
  package: Package,
  cart: ShoppingCart,
  ticket: Ticket,
  users: Users,
  mail: Mail,
  send: Send,
  layout: LayoutGrid,
};

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const dispatch = useDispatch<AppDispatch>();

  // Clears ONLY the admin session — any storefront session
  // stays untouched.
  const handleLogout = () => {
    adminStorage.clear();
    dispatch(adminLogout());
    navigate("/admin/login", { replace: true });
  };
  const [openGroups, setOpenGroups] = useState<
    Record<string, boolean>
  >({ Products: true });

  const isActive = (to?: string) =>
    to &&
    (to === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(to));

  return (
    <aside className="font-loomino flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E4DACA] bg-white">
      {/* Logo */}
      <div className="flex h-[80px] items-center border-b border-[#E4DACA] px-6">
        <span className="text-[22px] font-bold tracking-[1px] text-[#4C300D]">
          LOOMINO
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {ADMIN_NAV.map((section) => (
          <div key={section.heading} className="mb-6">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[1px] text-[#A89A80]">
              {section.heading}
            </p>

            {section.items.map((item) => {
              const Icon = ICONS[item.icon] ?? Home;

              if (item.children) {
                const open = openGroups[item.label];
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroups((prev) => ({
                          ...prev,
                          [item.label]: !prev[item.label],
                        }))
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium text-[#3A2E1B] hover:bg-[#F7F0E5]"
                    >
                      <Icon
                        size={18}
                        className="text-[#A88548]"
                      />
                      <span className="flex-1 text-left">
                        {item.label}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {open && (
                      <div className="ml-4 mt-1 border-l border-[#E4DACA] pl-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={`block rounded-md px-3 py-2 text-[13px] transition ${
                              isActive(child.to)
                                ? "font-semibold text-[#A88548]"
                                : "text-[#6B5E48] hover:text-[#4C300D]"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.to}
                  to={item.to ?? "#"}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition ${
                    isActive(item.to)
                      ? "bg-[#F7F0E5] text-[#4C300D]"
                      : "text-[#3A2E1B] hover:bg-[#F7F0E5]"
                  }`}
                >
                  <Icon
                    size={18}
                    className="text-[#A88548]"
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-[#E4DACA] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#A88548] text-[14px] font-bold text-white">
            {(user?.first_name?.[0] ?? "L").toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-[13px] font-semibold text-[#3A2E1B]">
              {user
                ? `${user.first_name} ${user.last_name}`.trim() ||
                  "Loomino"
                : "Loomino"}
            </p>
            <p className="text-[11px] text-[#A89A80]">
              Administrator
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[#9A3B3B] hover:bg-[#F7ECEC]"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
