import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { formatPrice, formatDate } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, { type Column } from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import {
  listOrders,
  updateOrder,
} from "../services/commerce.service";
import type { AdminOrder } from "../types/commerce";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function AdminOrders() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: listOrders,
  });

  const update = useMutation({
    mutationFn: ({
      orderNumber,
      status,
    }: {
      orderNumber: string;
      status: string;
    }) => updateOrder(orderNumber, { order_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "orders"],
      });
      toast.success("Order updated.");
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't update order."),
      ),
  });

  const columns: Column<AdminOrder>[] = [
    {
      header: "Order",
      cell: (o) => (
        <span className="font-mono text-[12px] text-[#4C300D]">
          #{o.order_number}
        </span>
      ),
    },
    {
      header: "Customer",
      cell: (o) => (
        <div>
          <p className="text-[#2C2418]">
            {o.customer.name ?? "—"}
          </p>
          <p className="text-[12px] text-[#A89A80]">
            {o.customer.phone ?? o.customer.email}
          </p>
        </div>
      ),
    },
    {
      header: "Total",
      cell: (o) => (
        <span className="font-semibold text-[#2C2418]">
          {formatPrice(o.total)}
        </span>
      ),
    },
    {
      header: "Payment",
      cell: (o) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={o.payment_status} />
          <span className="text-[11px] text-[#A89A80]">
            {o.payment_method}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (o) => (
        <select
          value={o.order_status}
          onChange={(e) =>
            update.mutate({
              orderNumber: o.order_number,
              status: e.target.value,
            })
          }
          className="rounded-lg border border-[#DDD3C0] bg-white px-2 py-1.5 text-[13px] capitalize outline-none focus:border-[#A88548]"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: "Placed",
      cell: (o) => (
        <span className="text-[#8A7C64]">
          {formatDate(o.placed_date)}
        </span>
      ),
    },
  ];

  return (
    <div className="font-loomino">
      <AdminPageHeader
        icon={<ShoppingCart size={20} />}
        title="Orders"
        subtitle="Manage and process customer purchases"
      />
      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(o) => o.order_number}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No orders yet."
      />
    </div>
  );
}

export default AdminOrders;
