import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket, Plus, Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";

import { formatPrice } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, { type Column } from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import AdminButton from "../components/AdminButton";
import AdminField from "../components/AdminField";
import StatusBadge from "../components/StatusBadge";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
} from "../services/commerce.service";
import type { AdminCoupon } from "../types/commerce";

function AdminCoupons() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: listCoupons,
  });
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin", "coupons"],
    });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(
    null,
  );
  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [minValue, setMinValue] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const create = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      invalidate();
      toast.success("Coupon created.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't create.")),
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AdminCoupon> }) =>
      updateCoupon(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Coupon updated.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't update.")),
  });
  const del = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      invalidate();
      toast.success("Coupon deleted.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't delete.")),
  });
  const toggle = useMutation({
    mutationFn: toggleCouponActive,
    onSuccess: () => {
      invalidate();
      toast.success("Coupon status changed.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't toggle.")),
  });

  const todayDate = () => new Date().toISOString().slice(0, 10);

  const openCreate = () => {
    setEditing(null);
    setCode("");
    setType("percent");
    setValue("");
    setMinValue("");
    setValidFrom(todayDate());
    setExpiryDate("");
    setModalOpen(true);
  };
  const openEdit = (c: AdminCoupon) => {
    setEditing(c);
    setCode(c.code);
    setType(c.type);
    setValue(c.value);
    setMinValue(c.cart_min_value ?? "");
    setValidFrom(c.valid_from ? c.valid_from.slice(0, 10) : todayDate());
    setExpiryDate(c.expiry_date ? c.expiry_date.slice(0, 10) : "");
    setModalOpen(true);
  };
  const submit = () => {
    if (!validFrom || !expiryDate) {
      toast.error("Set both a valid-from and expiry date.");
      return;
    }
    // The backend's cart_min_value field is optional but doesn't
    // accept an explicit null — omit the key entirely when left
    // blank rather than sending `cart_min_value: null`.
    const payload: Partial<AdminCoupon> = {
      code,
      type,
      value,
      ...(minValue ? { cart_min_value: minValue } : {}),
      // Valid from the start of that day...
      valid_from: new Date(`${validFrom}T00:00:00`).toISOString(),
      // ...through the end of the expiry day, so "expires on
      // this date" reads as inclusive rather than at midnight.
      expiry_date: new Date(`${expiryDate}T23:59:59`).toISOString(),
    };
    if (editing)
      update.mutate({ id: editing.id, payload });
    else create.mutate(payload);
  };

  const columns: Column<AdminCoupon>[] = [
    {
      header: "Code",
      cell: (c) => (
        <span className="font-mono text-[13px] font-semibold text-[#2C2418]">
          {c.code}
        </span>
      ),
    },
    {
      header: "Type",
      cell: (c) => (
        <StatusBadge status={c.type} />
      ),
    },
    {
      header: "Value",
      cell: (c) => (
        <span className="text-[#2C2418]">
          {c.type === "percent"
            ? `${c.value}% Off`
            : `${formatPrice(c.value)} Off`}
        </span>
      ),
    },
    {
      header: "Min Cart",
      cell: (c) => (
        <span className="text-[#8A7C64]">
          {c.cart_min_value
            ? formatPrice(c.cart_min_value)
            : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (c) => (
        <StatusBadge
          status={c.is_active ? "Active" : "Inactive"}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            aria-label="Toggle active"
            title="Toggle active"
            onClick={() => toggle.mutate(c.id)}
            className="rounded-md p-2 text-[#6B5E48] hover:bg-[#F0E9DA]"
          >
            <Power size={16} />
          </button>
          <button
            type="button"
            aria-label="Edit"
            onClick={() => openEdit(c)}
            className="rounded-md p-2 text-[#6B5E48] hover:bg-[#F0E9DA]"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={() => {
              if (confirm(`Delete "${c.code}"?`))
                del.mutate(c.id);
            }}
            className="rounded-md p-2 text-[#9A3B3B] hover:bg-[#F7ECEC]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="font-loomino">
      <AdminPageHeader
        icon={<Ticket size={20} />}
        title="Discount Coupons"
        subtitle="Manage promo codes, dates, and settings"
        action={
          <AdminButton onClick={openCreate}>
            <Plus size={16} /> Create Coupon
          </AdminButton>
        }
      />
      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No coupons yet."
      />

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Coupon" : "Create Coupon"}
        onClose={() => setModalOpen(false)}
      >
        <AdminField
          label="Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. EID2026"
        />
        <label className="mb-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
            Type
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-[42px] w-full rounded-lg border border-[#DDD3C0] bg-white px-3 text-[14px] outline-none focus:border-[#A88548]"
          >
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select>
        </label>
        <AdminField
          label={type === "percent" ? "Value (%)" : "Value (amount)"}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <AdminField
          label="Minimum Cart Value (optional)"
          type="number"
          value={minValue}
          onChange={(e) => setMinValue(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <AdminField
            label="Valid From"
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
          <AdminField
            label="Expires On"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <AdminButton
            variant="outline"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </AdminButton>
          <AdminButton
            onClick={submit}
            disabled={create.isPending || update.isPending}
          >
            {editing ? "Save Changes" : "Create Coupon"}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}

export default AdminCoupons;
