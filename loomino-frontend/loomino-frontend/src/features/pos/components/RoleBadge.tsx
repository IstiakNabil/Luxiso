import type { POSRole } from "../types/pos";

const ROLE_STYLES: Record<POSRole, string> = {
  admin: "bg-[#F1EAFB] text-[#7C4FD6]",
  manager: "bg-[#EAF0FE] text-[#3E6FDB]",
  cashier: "bg-[#E6F7EC] text-[#2E9E5B]",
};

function RoleBadge({ role, label }: { role: POSRole; label: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ROLE_STYLES[role] ?? "bg-[#F1F0F8] text-[#726C8C]"}`}
    >
      {label}
    </span>
  );
}

export default RoleBadge;
