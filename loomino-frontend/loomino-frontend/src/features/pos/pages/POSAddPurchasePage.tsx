import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useContacts } from "../hooks/useContacts";
import { useTaxRates } from "../hooks/useProducts";
import { useVariantSearch } from "../hooks/usePurchases";
import { useCreatePurchase } from "../hooks/usePurchases";
import ContactFormModal from "../components/ContactFormModal";
import { formatMoney } from "../utils/format";
import type {
  ContactDetail,
  DiscountTypeValue,
  PaymentMethodValue,
  PurchaseItemInput,
  PurchaseStatusValue,
  VariantSearchResult,
} from "../types/pos";

interface LineItem extends PurchaseItemInput {
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

function POSAddPurchasePage() {
  const navigate = useNavigate();
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const locationsQuery = usePOSLocations();
  const suppliersQuery = useContacts("supplier", 1, "", undefined);
  const taxRatesQuery = useTaxRates();
  const createMutation = useCreatePurchase();

  const [supplierId, setSupplierId] = useState<number | "">("");
  const [quickAddSupplier, setQuickAddSupplier] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(nowLocalDateTime());
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatusValue>("received");
  const [locationId, setLocationId] = useState<number | "">("");
  const [payTermDays, setPayTermDays] = useState("");
  const [attachedDocument, setAttachedDocument] = useState<File | null>(null);

  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);

  const [discountType, setDiscountType] = useState<DiscountTypeValue>("none");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [taxRateId, setTaxRateId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [shippingDetails, setShippingDetails] = useState("");
  const [shippingCharges, setShippingCharges] = useState("0");
  const [additionalExpensesNote, setAdditionalExpensesNote] = useState("");
  const [additionalExpensesAmount, setAdditionalExpensesAmount] = useState("0");

  const [paidAmount, setPaidAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("cash");
  const [paidOn, setPaidOn] = useState(nowLocalDateTime());
  const [paymentNote, setPaymentNote] = useState("");

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
        unit_cost: variant.purchase_price,
        discount_percent: "0",
        selling_price: variant.selling_price,
        mfg_date: "",
        exp_date: "",
      },
    ]);
    setProductSearch("");
  };

  const updateItem = (key: string, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };

  const removeItem = (key: string) => setItems((prev) => prev.filter((it) => it.key !== key));

  // Mirrors the backend's exact computation (ProductPurchaseCreateView.post)
  // so the person sees the real total before saving, not just an estimate.
  const computed = useMemo(() => {
    const lineComputations = items.map((it) => {
      const qty = toNum(it.quantity);
      const unitCost = toNum(it.unit_cost);
      const discPct = toNum(it.discount_percent);
      const unitCostAfterDiscount = unitCost * (1 - discPct / 100);
      const lineTotal = qty * unitCostAfterDiscount;
      return { ...it, unitCostAfterDiscount, lineTotal };
    });

    const subtotal = lineComputations.reduce((sum, it) => sum + it.lineTotal, 0);

    let discount = 0;
    if (discountType === "percentage") discount = (subtotal * toNum(discountAmount)) / 100;
    else if (discountType === "fixed") discount = toNum(discountAmount);

    const taxable = subtotal - discount;
    const selectedTax = taxRatesQuery.data?.find((t) => t.id === taxRateId);
    const tax = selectedTax ? (taxable * toNum(selectedTax.rate)) / 100 : 0;

    const total = taxable + tax + toNum(shippingCharges) + toNum(additionalExpensesAmount);
    const due = total - toNum(paidAmount);

    return { lineComputations, subtotal, discount, tax, total, due };
  }, [items, discountType, discountAmount, taxRateId, taxRatesQuery.data, shippingCharges, additionalExpensesAmount, paidAmount]);

  const handleSupplierCreated = (contact: ContactDetail) => setSupplierId(contact.id);

  const handleSubmit = async () => {
    if (!supplierId) {
      toast.error("Supplier is required.");
      return;
    }
    if (!locationId) {
      toast.error("Business Location is required.");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one product.");
      return;
    }

    const formData = new FormData();
    formData.append("supplier", String(supplierId));
    formData.append("location", String(locationId));
    if (referenceNo) formData.append("reference_no", referenceNo);
    formData.append("purchase_date", new Date(purchaseDate).toISOString());
    formData.append("status", purchaseStatus);
    if (payTermDays) formData.append("pay_term_days", payTermDays);
    if (attachedDocument) formData.append("attached_document", attachedDocument);
    formData.append("discount_type", discountType);
    formData.append("discount_amount", discountAmount || "0");
    if (taxRateId) formData.append("tax_rate", String(taxRateId));
    formData.append("shipping_details", shippingDetails);
    formData.append("shipping_charges", shippingCharges || "0");
    formData.append("additional_expenses_note", additionalExpensesNote);
    formData.append("additional_expenses_amount", additionalExpensesAmount || "0");
    formData.append("payment_method", paymentMethod);
    formData.append("paid_on", paidOn ? new Date(paidOn).toISOString() : "");
    formData.append("payment_note", paymentNote);
    formData.append("notes", notes);
    formData.append("paid_amount", paidAmount || "0");
    formData.append(
      "items",
      JSON.stringify(
        items.map((it) => ({
          variant: it.variant,
          quantity: it.quantity,
          unit_cost: it.unit_cost,
          discount_percent: it.discount_percent,
          selling_price: it.selling_price || undefined,
          mfg_date: it.mfg_date || undefined,
          exp_date: it.exp_date || undefined,
        })),
      ),
    );

    try {
      const purchase = await createMutation.mutateAsync(formData);
      toast.success(`Purchase ${purchase.reference_no} saved.`);
      navigate("/admin/pos/purchases/list");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Add Purchase</h1>
      </div>

      {/* Header fields */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                Supplier <span className="text-[#C24F4F]">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
              >
                <option value="">Please Select</option>
                {suppliersQuery.data?.results.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setQuickAddSupplier(true)}
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#7C6AE8] text-white hover:bg-[#6C5AD8]"
            >
              <Plus size={16} />
            </button>
          </div>

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
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Purchase Date</span>
            <input
              type="datetime-local"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Purchase Status <span className="text-[#C24F4F]">*</span>
            </span>
            <select
              value={purchaseStatus}
              onChange={(e) => setPurchaseStatus(e.target.value as PurchaseStatusValue)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="partial">Partial</option>
              <option value="received">Received</option>
            </select>
          </label>

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
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Pay Term (days)</span>
            <input
              type="number"
              value={payTermDays}
              onChange={(e) => setPayTermDays(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Attach Document</span>
            <input
              type="file"
              onChange={(e) => setAttachedDocument(e.target.files?.[0] ?? null)}
              className="text-[13px] text-[#3A3560]"
            />
          </label>
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="relative mb-4">
          <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] px-3 py-2">
            <Search size={14} className="text-[#8A84B8]" />
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Enter Product name / SKU / Scan bar code"
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
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#EDEBFA] text-[#726C8C]">
                <th className="py-2 pr-3 font-medium">#</th>
                <th className="py-2 pr-3 font-medium">Product Name</th>
                <th className="py-2 pr-3 font-medium">Qty</th>
                <th className="py-2 pr-3 font-medium">Unit Cost (Before Disc.)</th>
                <th className="py-2 pr-3 font-medium">Disc. %</th>
                <th className="py-2 pr-3 font-medium">Unit Cost (After Disc.)</th>
                <th className="py-2 pr-3 font-medium">Line Total</th>
                <th className="py-2 pr-3 font-medium">Unit Selling Price</th>
                <th className="py-2 pr-3 font-medium">MFG / EXP Date</th>
                <th className="py-2 pr-3" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-[#A8A2C9]">
                    Search and add products above.
                  </td>
                </tr>
              ) : (
                computed.lineComputations.map((it, idx) => (
                  <tr key={it.key} className="border-b border-[#F5F4FA]">
                    <td className="py-2 pr-3 text-[#726C8C]">{idx + 1}</td>
                    <td className="py-2 pr-3 text-[#221F35]">
                      {it.productLabel}
                      <div className="text-[11px] text-[#A8A2C9]">{it.skuLabel}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={it.quantity}
                        onChange={(e) => updateItem(it.key, { quantity: e.target.value })}
                        className="w-16 rounded-lg border border-[#E7E4F3] px-2 py-1 outline-none focus:border-[#7C6AE8]"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={it.unit_cost}
                        onChange={(e) => updateItem(it.key, { unit_cost: e.target.value })}
                        className="w-20 rounded-lg border border-[#E7E4F3] px-2 py-1 outline-none focus:border-[#7C6AE8]"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={it.discount_percent}
                        onChange={(e) => updateItem(it.key, { discount_percent: e.target.value })}
                        className="w-16 rounded-lg border border-[#E7E4F3] px-2 py-1 outline-none focus:border-[#7C6AE8]"
                      />
                    </td>
                    <td className="py-2 pr-3 text-[#726C8C]">{it.unitCostAfterDiscount.toFixed(2)}</td>
                    <td className="py-2 pr-3 font-medium text-[#221F35]">{it.lineTotal.toFixed(2)}</td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={it.selling_price ?? ""}
                        onChange={(e) => updateItem(it.key, { selling_price: e.target.value })}
                        className="w-20 rounded-lg border border-[#E7E4F3] px-2 py-1 outline-none focus:border-[#7C6AE8]"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          value={it.mfg_date ?? ""}
                          onChange={(e) => updateItem(it.key, { mfg_date: e.target.value })}
                          className="rounded-lg border border-[#E7E4F3] px-2 py-1 outline-none focus:border-[#7C6AE8]"
                        />
                        <input
                          type="date"
                          value={it.exp_date ?? ""}
                          onChange={(e) => updateItem(it.key, { exp_date: e.target.value })}
                          className="rounded-lg border border-[#E7E4F3] px-2 py-1 outline-none focus:border-[#7C6AE8]"
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => removeItem(it.key)}
                        className="text-[#C24F4F] hover:underline"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-8 text-[13px]">
          <span className="text-[#726C8C]">
            Total Items: <span className="font-medium text-[#221F35]">{items.length}</span>
          </span>
          <span className="text-[#726C8C]">
            Net Total Amount:{" "}
            <span className="font-medium text-[#221F35]">{formatMoney(computed.subtotal, sym)}</span>
          </span>
        </div>
      </div>

      {/* Discount / Tax / Notes */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountTypeValue)}
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
              >
                <option value="none">None</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Discount Amount</label>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
              />
            </div>
            <span className="whitespace-nowrap pb-2 text-[13px] font-medium text-[#221F35]">
              Discount: (-) {formatMoney(computed.discount, sym)}
            </span>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Purchase Tax</label>
              <select
                value={taxRateId}
                onChange={(e) => setTaxRateId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
              >
                <option value="">None</option>
                {taxRatesQuery.data?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.rate}%)
                  </option>
                ))}
              </select>
            </div>
            <span className="whitespace-nowrap pb-2 text-[13px] font-medium text-[#221F35]">
              Purchase Tax: (+) {formatMoney(computed.tax, sym)}
            </span>
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Additional Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
      </div>

      {/* Shipping + expenses */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Shipping Details</span>
            <input
              value={shippingDetails}
              onChange={(e) => setShippingDetails(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              (+) Additional Shipping Charges
            </span>
            <input
              type="number"
              value={shippingCharges}
              onChange={(e) => setShippingCharges(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Additional Expense Note</span>
            <input
              value={additionalExpensesNote}
              onChange={(e) => setAdditionalExpensesNote(e.target.value)}
              placeholder="e.g. Loading fee"
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              (+) Additional Expense Amount
            </span>
            <input
              type="number"
              value={additionalExpensesAmount}
              onChange={(e) => setAdditionalExpensesAmount(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
        </div>

        <div className="mt-4 text-right text-[15px] font-semibold text-[#221F35]">
          Purchase Total: {formatMoney(computed.total, sym)}
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">Add Payment</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Amount <span className="text-[#C24F4F]">*</span>
            </span>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Paid On <span className="text-[#C24F4F]">*</span>
            </span>
            <input
              type="datetime-local"
              value={paidOn}
              onChange={(e) => setPaidOn(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Payment Method <span className="text-[#C24F4F]">*</span>
            </span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodValue)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Payment Note</span>
          <textarea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>

        <div className="mt-4 border-t border-[#E7E4F3] pt-4 text-right text-[14px] font-semibold text-[#221F35]">
          Payment Due: {formatMoney(computed.due, sym)}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate("/admin/pos/purchases/list")}
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

      {quickAddSupplier && (
        <ContactFormModal
          mode="add"
          defaultType="supplier"
          onClose={() => setQuickAddSupplier(false)}
          onCreated={handleSupplierCreated}
        />
      )}
    </div>
  );
}

export default POSAddPurchasePage;
