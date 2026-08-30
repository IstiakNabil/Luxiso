import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Contact as ContactIcon,
  Package,
  Truck,
  ShoppingCart,
  Layers,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { adminStorage } from "@/features/admin/utils/adminStorage";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { POS_NAV, type POSNavItem } from "./posNav";

const ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  home: Home,
  users: Users,
  contact: ContactIcon,
  package: Package,
  truck: Truck,
  cart: ShoppingCart,
  layers: Layers,
  receipt: Receipt,
  chart: BarChart3,
  settings: Settings,
};

function POSSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { me } = usePOSAuth();

  const permissions = me?.has_pos_access ? me.permissions : null;
  const businessName = me?.has_pos_access ? me.business.name : "POS";

  const isGroupActive = (item: POSNavItem) =>
    item.children
      ? item.children.some((c) => location.pathname.startsWith(c.to))
      : item.to === "/admin/pos"
        ? location.pathname === "/admin/pos"
        : location.pathname.startsWith(item.to);

  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(POS_NAV.filter((i) => i.children && isGroupActive(i)).map((i) => i.label)),
  );

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleLogout = () => {
    // Same session as the e-commerce admin panel — logging out of
    // POS logs out of both, which is expected since it's one login.
    adminStorage.clear();
    navigate("/admin/login", { replace: true });
  };

  const visibleItems = POS_NAV.filter(
    (item) => !item.permission || (permissions && permissions[item.permission]),
  );

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[#2E2A4D] bg-[#1E1B33]">
      <div className="flex h-[80px] items-center gap-2 border-b border-[#2E2A4D] px-6">
        <span className="h-2 w-2 rounded-full bg-[#7C6AE8]" />
        <span className="truncate text-[18px] font-bold tracking-[0.5px] text-white">
          {businessName}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {visibleItems.map((item) => {
          const Icon = ICONS[item.icon] ?? Home;
          const active = isGroupActive(item);

          if (!item.children) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition ${
                  active
                    ? "bg-[#7C6AE8]/15 text-white"
                    : "text-[#B8B3D9] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} className={active ? "text-[#9C8DF2]" : "text-[#7C76A8]"} />
                {item.label}
              </Link>
            );
          }

          const isOpen = openGroups.has(item.label);
          return (
            <div key={item.label} className="mb-1">
              <button
                type="button"
                onClick={() => toggleGroup(item.label)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium transition ${
                  active
                    ? "bg-[#7C6AE8]/15 text-white"
                    : "text-[#B8B3D9] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} className={active ? "text-[#9C8DF2]" : "text-[#7C76A8]"} />
                <span className="flex-1">{item.label}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="ml-[34px] mt-1 flex flex-col gap-0.5 border-l border-[#2E2A4D] pl-3">
                  {item.children.map((child) => {
                    const childActive = location.pathname.startsWith(child.to);
                    return (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={`rounded-md px-2.5 py-1.5 text-[13px] font-medium transition ${
                          childActive
                            ? "text-white"
                            : "text-[#9691BE] hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[#2E2A4D] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C6AE8] text-[14px] font-bold text-white">
            {(me?.has_pos_access ? me.role_display[0] : "P").toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-[13px] font-semibold text-white">
              {me?.has_pos_access ? me.role_display : "POS Staff"}
            </p>
            <p className="text-[11px] text-[#8A84B8]">POS Session</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[#E39A9A] hover:bg-white/5"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </aside>
  );
}

export default POSSidebar;
