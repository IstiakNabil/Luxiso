import { Link, useLocation } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";

import { POS_NAV } from "./posNav";

function findCrumb(pathname: string): string {
  for (const item of POS_NAV) {
    if (item.children) {
      const child = item.children.find((c) => pathname.startsWith(c.to));
      if (child) return `${item.label} › ${child.label}`;
    }
  }

  const flatMatch = [...POS_NAV]
    .filter((i) => !i.children)
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) =>
      item.to === "/admin/pos" ? pathname === "/admin/pos" : pathname.startsWith(item.to),
    );

  return flatMatch?.label ?? "POS";
}

function POSTopbar() {
  const location = useLocation();
  const crumb = findCrumb(location.pathname);

  return (
    <header className="flex h-[64px] items-center justify-between border-b border-[#E7E4F3] bg-white px-8">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-[#7C6AE8]">POS</span>
        <span className="text-[#C9C4E8]">›</span>
        <span className="font-medium text-[#221F35]">{crumb}</span>
      </div>

      <Link
        to="/admin"
        className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] px-3 py-1.5 text-[13px] font-medium text-[#726C8C] transition hover:bg-[#F5F4FA] hover:text-[#221F35]"
      >
        <ArrowLeftRight size={14} />
        Back to Admin
      </Link>
    </header>
  );
}

export default POSTopbar;
