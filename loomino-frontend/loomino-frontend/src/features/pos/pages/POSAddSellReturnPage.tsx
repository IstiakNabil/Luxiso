import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { useSales, useReturnableSaleItems, useCreateSaleReturn } from "../hooks/useSales";
import { formatMoney } from "../utils/format";
import type { SaleListRow } from "../types/pos";

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function POSAddSellReturnPage() {
  const navigate = useNavigate();
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [saleSearch, setSaleSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleListRow | null>(null);
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [reason, setReason] = useState("");
  const [returnQty, setReturnQty] = useState<Record<number, string>>({});

  const saleSearchQuery = useSales(1, { search: saleSearch, status: "final" });
  const returnableQuery = useReturnableSaleItems(selectedSale?.id ?? null);
  const createMutation = useCreateSaleReturn();

  const items = useMemo(() => returnableQuery.data ?? [], [returnableQuery.data]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = toNum(returnQty[item.id] ?? "0");
      return sum + qty * toNum(item.unit_price);
    }, 0);
  }, [items, returnQty]);

  const handleSelectSale = (row: SaleListRow) => {
    setSelectedSale(row);
    setSaleSearch("");
    setReturnQty({});
  };

  const handleSubmit = async () => {
    if (!selectedSale) {
      toast.error("Select a sale to return against first.");
      return;
    }
    const linesToReturn = items
      .filter((item) => toNum(returnQty[item.id] ?? "0") > 0)
      .map((item) => ({
        variant: item.variant,
        quantity: returnQty[item.id],
        unit_price: item.unit_price,
      }));

    if (linesToReturn.length === 0) {
      toast.error("Enter a quantity to return for at least one item.");
      return;
    }

    const formData = new FormData();
    formData.append("sale", String(selectedSale.id));
    formData.append("return_date", new Date(returnDate).toISOString());
    formData.append("reason", reason);
    formData.append("items", JSON.stringify(linesToReturn));

    try {
      const result = await createMutation.mutateAsync(formData);
      toast.success(`Return ${result.reference_no} saved.`);
      navigate("/admin/pos/sell/returns");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Add Sell Return</h1>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
          Sale <span className="text-[#C24F4F]">*</span>
        </label>
        {selectedSale ? (
          <div className="flex items-center justify-between rounded-lg border border-[#E7E4F3] bg-[#F5F4FA] px-3 py-2">
            <div>
              <p className="text-[13px] font-medium text-[#221F35]">
                {selectedSale.invoice_no} — {selectedSale.customer_name}
              </p>
              <p className="text-[12px] text-[#726C8C]">
                {selectedSale.location_name} · {formatMoney(selectedSale.total, sym)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSale(null)}
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
                value={saleSearch}
                onChange={(e) => setSaleSearch(e.target.value)}
                placeholder="Search by invoice no…"
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </div>
            {saleSearch.trim().length >= 1 && (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#E7E4F3] bg-white shadow-lg">
                {saleSearchQuery.isLoading ? (
                  <p className="px-3 py-2 text-[13px] text-[#A8A2C9]">Searching…</p>
                ) : saleSearchQuery.data?.results.length === 0 ? (
                  <p className="px-3 py-2 text-[13px] text-[#A8A2C9]">No matching sales.</p>
                ) : (
                  saleSearchQuery.data?.results.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => handleSelectSale(row)}
                      className="flex w-full items-center justify-between border-b border-[#F5F4FA] px-3 py-2 text-left last:border-b-0 hover:bg-[#F5F4FA]"
                    >
                      <span className="text-[13px] text-[#221F35]">
                        {row.invoice_no} — {row.customer_name}
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

      {selectedSale && (
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-[#221F35]">Items to Return</h3>
          {returnableQuery.isLoading ? (
            <p className="text-[13px] text-[#A8A2C9]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-[13px] text-[#A8A2C9]">This sale has no items.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#EDEBFA] text-[#726C8C]">
                    <th className="py-2 pr-3 font-medium">Product</th>
                    <th className="py-2 pr-3 font-medium">Sold</th>
                    <th className="py-2 pr-3 font-medium">Already Returned</th>
                    <th className="py-2 pr-3 font-medium">Returnable</th>
                    <th className="py-2 pr-3 font-medium">Unit Price</th>
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
                      <td className="py-2 pr-3">{formatMoney(item.unit_price, sym)}</td>
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
                type="datetime-local"
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
                placeholder="e.g. Customer changed mind"
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
          onClick={() => navigate("/admin/pos/sell/returns")}
          className="rounded-lg border border-[#E7E4F3] px-5 py-2.5 text-[13px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending || !selectedSale}
          className="rounded-lg bg-[#7C6AE8] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#6C5AD8] disabled:opacity-60"
        >
          {createMutation.isPending ? "Saving…" : "Save Return"}
        </button>
      </div>
    </div>
  );
}

export default POSAddSellReturnPage;
