import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";

import { useAdminAuth } from "../hooks/useAdminAuth";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/categories": "Category",
  "/admin/brands": "Brands",
  "/admin/colors": "Product Color",
  "/admin/sizes": "Product Size",
  "/admin/variants": "Variant Products",
  "/admin/reviews": "Product Reviews",
  "/admin/orders": "Orders",
  "/admin/coupons": "Coupons",
  "/admin/customers": "Customers",
  "/admin/mails": "Customer Mails",
  "/admin/newsletters": "Newsletters",
};

function AdminTopbar() {
  const location = useLocation();
  const { user } = useAdminAuth();

  const crumb =
    Object.entries(TITLES)
      .filter(([path]) =>
        path === "/admin"
          ? location.pathname === "/admin"
          : location.pathname.startsWith(path),
      )
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    "Admin";

  return (
    <header className="font-loomino flex h-[64px] items-center justify-between border-b border-[#E4DACA] bg-white px-8">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-[#A88548]">Admin</span>
        <span className="text-[#C9BCA3]">›</span>
        <span className="font-medium text-[#3A2E1B]">
          {crumb}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-[#6B5E48]"
        >
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#A88548]" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A88548] text-[13px] font-bold text-white">
            {(user?.first_name?.[0] ?? "L").toUpperCase()}
          </div>
          <span className="text-[13px] font-medium text-[#3A2E1B]">
            {user?.first_name ?? "Loomino"}
          </span>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
