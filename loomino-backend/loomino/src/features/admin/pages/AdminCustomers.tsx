import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { formatDate } from "@/lib/utils";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, {
  type Column,
} from "../components/AdminTable";
import { getCustomers } from "../services/dashboard.service";
import type { DashboardCustomer } from "../types/dashboard";

function AdminCustomers() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: getCustomers,
  });

  const initials = (c: DashboardCustomer) =>
    (
      (c.first_name?.[0] ?? "") + (c.last_name?.[0] ?? "")
    ).toUpperCase() || "U";

  const columns: Column<DashboardCustomer>[] = [
    {
      header: "Customer",
      cell: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFE3F5] text-[12px] font-bold text-[#7A4E93]">
            {initials(c)}
          </span>
          <span className="font-medium text-[#2C2418]">
            {`${c.first_name} ${c.last_name}`.trim() ||
              "Unnamed"}
          </span>
        </div>
      ),
    },
    {
      header: "Email",
      cell: (c) => (
        <span className="text-[#6B5E48]">{c.email}</span>
      ),
    },
    {
      header: "Phone",
      cell: (c) => (
        <span className="text-[#6B5E48]">
          {c.phone_number || "—"}
        </span>
      ),
    },
    {
      header: "Location",
      cell: (c) => (
        <span className="text-[#8A7C64]">
          {c.location || "—"}
        </span>
      ),
    },
    {
      header: "Joined",
      cell: (c) => (
        <span className="text-[#8A7C64]">
          {formatDate(c.date_joined)}
        </span>
      ),
    },
  ];

  return (
    <div className="font-loomino">
      <AdminPageHeader
        icon={<Users size={20} />}
        title="Customers"
        subtitle="Manage your registered users and clients"
      />
      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No customers yet."
      />
    </div>
  );
}

export default AdminCustomers;
