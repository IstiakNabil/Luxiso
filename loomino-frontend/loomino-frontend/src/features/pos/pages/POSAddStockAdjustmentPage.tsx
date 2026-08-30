import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useVariantSearch } from "../hooks/usePurchases";
import { useCreateStockAdjustment } from "../hooks/useStockAdjustments";
import { formatMoney } from "../utils/format";
import type { AdjustmentTypeValue, StockAdjustmentItemInput, VariantSearchResult } from "../types/pos";

interface LineItem extends StockAdjustmentItemInput {
  key: string;
  productLabel: string;
  skuLabel: string;
}

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function nowLocalDateTime(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function POSAddStockAdjustmentPage() {
  const navigate = useNavigate();
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const locationsQuery = usePOSLocations();
  const createMutation = useCreateStockAdjustment();

  const [locationId, setLocationId] = useState<number | "">("");
  const [referenceNo, setReferenceNo] = useState("");
  const [adjustmentDate, setAdjustmentDate] = useState(nowLocalDateTime());
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentTypeValue | "">("");
  const [totalAmountRecovered, setTotalAmountRecovered] = useState("0");
  const [reason, setReason] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);

  const variantQuery = useVariantSearch(productSearch);

  const addVariant = (variant: VariantSearchResult) => {
    setItems((prev) => [
      ...prev,
      {
        key: `${variant.id}-${Date.now()}`,
        variant: variant.id,
        productLabel: variant.display_name,
        skuLabel: variant.sku,
        quantity: "1",
        unit_price: variant.purchase_price,
      },
    ]);
    setProductSearch("");
  };

  const updateItem = (key: string, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };

  const removeItem = (key: string) => setItems((prev) => prev.filter((it) => it.key !== key));

  const totals = useMemo(() => {
    const totalQty = items.reduce((sum, it) => sum + toNum(it.quantity), 0);
    const totalAmount = items.reduce((sum, it) => sum + toNum(it.quantity) * toNum(it.unit_price), 0);
    return { totalQty, totalAmount };
  }, [items]);

  const handleSubmit = async () => {
    if (!locationId) {
      toast.error("Business Location is required.");
      return;
    }
    if (!adjustmentType) {
      toast.error("Adjustment type is required.");
      return;
    }
    if (items.length === 0) {
      toast.error("Search and add at least one product.");
      return;
    }

    const formData = new FormData();
    formData.append("location", String(locationId));
    if (referenceNo) formData.append("reference_no", referenceNo);
    formData.append("adjustment_date", new Date(adjustmentDate).toISOString());
    formData.append("adjustment_type", adjustmentType);
    formData.append("total_amount_recovered", totalAmountRecovered || "0");
    formData.append("reason", reason);
    formData.append(
      "items",
      JSON.stringify(
        items.map((it) => ({
          variant: it.variant,
          quantity: it.quantity,
          unit_price: it.unit_price,
        })),
      ),
    );

    try {
      const result = await createMutation.mutateAsync(formData);
      toast.success(`${result.reference_no} saved.`);
      navigate("/admin/pos/stock-adjustments/list");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Add Stock Adjustment</h1>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Business Location <span className="text-[#C24F4F]">*</span>
            </span>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">Please Select</option>
              {locationsQuery.data?.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Reference No</span>
            <input
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="Auto-generated if blank"
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Date <span className="text-[#C24F4F]">*</span>
            </span>
            <input
              type="datetime-local"
              value={adjustmentDate}
              onChange={(e) => setAdjustmentDate(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Adjustment type <span className="text-[#C24F4F]">*</span>
            </span>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as AdjustmentTypeValue)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">Please Select</option>
              <option value="normal">Normal (write off — damaged/lost)</option>
              <option value="abnormal">Abnormal (found extra stock)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Search Products */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">Search Products</h3>
        <div className="relative mb-4">
          <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] px-3 py-2">
            <Search size={14} className="text-[#8A84B8]" />
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products for stock adjustment"
              className="w-full bg-transparent text-[13px] outline-none"
            />
          </div>
          {productSearch.trim().length >= 2 && (
            <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#E7E4F3] bg-white shadow-lg">
              {variantQuery.isLoading ? (
                <p className="px-3 py-2 text-[13px] text-[#A8A2C9]">Searching…</p>
              ) : variantQuery.data?.length === 0 ? (
                <p className="px-3 py-2 text-[13px] text-[#A8A2C9]">No matching products.</p>
              ) : (
                variantQuery.data?.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => addVariant(v)}
                    className="flex w-full items-center justify-between border-b border-[#F5F4FA] px-3 py-2 text-left last:border-b-0 hover:bg-[#F5F4FA]"
                  >
                    <span className="text-[13px] text-[#221F35]">{v.display_name}</span>
                    <span className="text-[12px] text-[#A8A2C9]">{v.sku}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#2E9E5B] text-white">
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Quantity</th>
                <th className="px-3 py-2 font-medium">Unit Price</th>
                <th className="px-3 py-2 font-medium">Subtotal</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#A8A2C9]">
                    Search and add products above.
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const subtotal = toNum(it.quantity) * toNum(it.unit_price);
                  return (
                    <tr key={it.key} className="border-b border-[#F5F4FA]">
                      <td className="px-3 py-2 text-[#221F35]">
                        {it.productLabel}
                        <div className="text-[11px] text-[#A8A2C9]">{it.skuLabel}</div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => updateItem(it.key, { quantity: e.target.value })}
                          className="w-20 rounded-lg border border-[#E7E4F3] px-2 py-1 outline-none focus:border-[#7C6AE8]"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={it.unit_price}
                          onChange={(e) => updateItem(it.key, { unit_price: e.target.value })}
                          className="w-24 rounded-lg border border-[#E7E4F3] px-2 py-1 outline-none focus:border-[#7C6AE8]"
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-[#221F35]">
                        {subtotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => removeItem(it.key)} className="text-[#C24F4F] hover:underline">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr className="bg-[#F5F4FA] font-medium text-[#221F35]">
                  <td className="px-3 py-2">Totals</td>
                  <td className="px-3 py-2">{totals.totalQty.toFixed(2)}</td>
                  <td />
                  <td className="px-3 py-2">{formatMoney(totals.totalAmount, sym)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Recovery / Reason */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Total amount recovered
            </span>
            <input
              type="number"
              value={totalAmountRecovered}
              onChange={(e) => setTotalAmountRecovered(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
            <p className="mt-1 text-[12px] text-[#A8A2C9]">
              e.g. partial insurance or salvage value recovered from written-off stock.
            </p>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Reason</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Reason"
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate("/admin/pos/stock-adjustments/list")}
          className="rounded-lg border border-[#E7E4F3] px-5 py-2.5 text-[13px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="rounded-lg bg-[#7C6AE8] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#6C5AD8] disabled:opacity-60"
        >
          {createMutation.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

export default POSAddStockAdjustmentPage;
