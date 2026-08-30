import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePurchases, useReturnableItems, useCreatePurchaseReturn } from "../hooks/usePurchases";
import { formatMoney } from "../utils/format";
import type { PurchaseListRow } from "../types/pos";

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function POSAddPurchaseReturnPage() {
  const navigate = useNavigate();
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseListRow | null>(null);
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [returnQty, setReturnQty] = useState<Record<number, string>>({});

  const purchaseSearchQuery = usePurchases(1, { search: purchaseSearch });
  const returnableQuery = useReturnableItems(selectedPurchase?.id ?? null);
  const createMutation = useCreatePurchaseReturn();

  const items = useMemo(() => returnableQuery.data ?? [], [returnableQuery.data]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = toNum(returnQty[item.id] ?? "0");
      return sum + qty * toNum(item.unit_cost_after_discount);
    }, 0);
  }, [items, returnQty]);

  const handleSelectPurchase = (row: PurchaseListRow) => {
    setSelectedPurchase(row);
    setPurchaseSearch("");
    setReturnQty({});
  };

  const handleSubmit = async () => {
    if (!selectedPurchase) {
      toast.error("Select a purchase to return against first.");
      return;
    }
    const linesToReturn = items
      .filter((item) => toNum(returnQty[item.id] ?? "0") > 0)
      .map((item) => ({
        variant: item.variant,
        quantity: returnQty[item.id],
        unit_cost: item.unit_cost_after_discount,
      }));

    if (linesToReturn.length === 0) {
      toast.error("Enter a quantity to return for at least one item.");
      return;
    }

    const formData = new FormData();
    formData.append("purchase", String(selectedPurchase.id));
    formData.append("return_date", returnDate);
    formData.append("reason", reason);
    formData.append("items", JSON.stringify(linesToReturn));

    try {
      const result = await createMutation.mutateAsync(formData);
      toast.success(`Return ${result.reference_no} saved.`);
      navigate("/admin/pos/purchases/returns");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Add Purchase Return</h1>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
          Purchase <span className="text-[#C24F4F]">*</span>
        </label>
        {selectedPurchase ? (
          <div className="flex items-center justify-between rounded-lg border border-[#E7E4F3] bg-[#F5F4FA] px-3 py-2">
            <div>
              <p className="text-[13px] font-medium text-[#221F35]">
                {selectedPurchase.reference_no} — {selectedPurchase.supplier_name}
              </p>
              <p className="text-[12px] text-[#726C8C]">
                {selectedPurchase.location_name} · {formatMoney(selectedPurchase.total, sym)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPurchase(null)}
              className="text-[12px] font-medium text-[#7C6AE8] hover:underline"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] px-3 py-2">
              <Search size={14} className="text-[#8A84B8]" />
              <input
                value={purchaseSearch}
                onChange={(e) => setPurchaseSearch(e.target.value)}
                placeholder="Search by reference no…"
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </div>
            {purchaseSearch.trim().length >= 1 && (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#E7E4F3] bg-white shadow-lg">
                {purchaseSearchQuery.isLoading ? (
                  <p className="px-3 py-2 text-[13px] text-[#A8A2C9]">Searching…</p>
                ) : purchaseSearchQuery.data?.results.length === 0 ? (
                  <p className="px-3 py-2 text-[13px] text-[#A8A2C9]">No matching purchases.</p>
                ) : (
                  purchaseSearchQuery.data?.results.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => handleSelectPurchase(row)}
                      className="flex w-full items-center justify-between border-b border-[#F5F4FA] px-3 py-2 text-left last:border-b-0 hover:bg-[#F5F4FA]"
                    >
                      <span className="text-[13px] text-[#221F35]">
                        {row.reference_no} — {row.supplier_name}
                      </span>
                      <span className="text-[12px] text-[#A8A2C9]">{formatMoney(row.total, sym)}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPurchase && (
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-[#221F35]">Items to Return</h3>
          {returnableQuery.isLoading ? (
            <p className="text-[13px] text-[#A8A2C9]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-[13px] text-[#A8A2C9]">This purchase has no items.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#EDEBFA] text-[#726C8C]">
                    <th className="py-2 pr-3 font-medium">Product</th>
                    <th className="py-2 pr-3 font-medium">Purchased</th>
                    <th className="py-2 pr-3 font-medium">Already Returned</th>
                    <th className="py-2 pr-3 font-medium">Returnable</th>
                    <th className="py-2 pr-3 font-medium">Unit Cost</th>
                    <th className="py-2 pr-3 font-medium">Return Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-[#F5F4FA]">
                      <td className="py-2 pr-3 text-[#221F35]">
                        {item.product_name}
                        {item.variant_name && ` — ${item.variant_name}`}
                        <div className="text-[11px] text-[#A8A2C9]">{item.sku}</div>
                      </td>
                      <td className="py-2 pr-3">{item.quantity}</td>
                      <td className="py-2 pr-3">{item.already_returned}</td>
                      <td className="py-2 pr-3 font-medium">{item.returnable_quantity}</td>
                      <td className="py-2 pr-3">{formatMoney(item.unit_cost_after_discount, sym)}</td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min={0}
                          max={item.returnable_quantity}
                          value={returnQty[item.id] ?? ""}
                          onChange={(e) =>
                            setReturnQty((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="0"
                          disabled={item.returnable_quantity <= 0}
                          className="w-20 rounded-lg border border-[#E7E4F3] px-2 py-1 outline-none focus:border-[#7C6AE8] disabled:bg-[#F5F4FA]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                Return Date <span className="text-[#C24F4F]">*</span>
              </span>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Reason</span>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Damaged in transit"
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
              />
            </label>
          </div>

          <div className="mt-4 text-right text-[15px] font-semibold text-[#221F35]">
            Return Total: {formatMoney(total, sym)}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate("/admin/pos/purchases/returns")}
          className="rounded-lg border border-[#E7E4F3] px-5 py-2.5 text-[13px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending || !selectedPurchase}
          className="rounded-lg bg-[#7C6AE8] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#6C5AD8] disabled:opacity-60"
        >
          {createMutation.isPending ? "Saving…" : "Save Return"}
        </button>
      </div>
    </div>
  );
}

export default POSAddPurchaseReturnPage;
