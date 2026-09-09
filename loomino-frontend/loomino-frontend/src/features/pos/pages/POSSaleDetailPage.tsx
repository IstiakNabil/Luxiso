import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { useBusinessSettings } from "../hooks/useSettings";
import { useSaleDetail, useAddSalePayment } from "../hooks/useSales";
import { printReceipts } from "../utils/receipt";
import { formatMoney } from "../utils/format";
import type { PaymentMethodValue } from "../types/pos";

const STATUS_COLORS: Record<string, string> = {
  final: "bg-[#E6F7EC] text-[#2E9E5B]",
  draft: "bg-[#F1F0F8] text-[#726C8C]",
  quotation: "bg-[#EAF0FE] text-[#3E6FDB]",
  suspended: "bg-[#FDF1DC] text-[#B8791F]",
  partial: "bg-[#FDF1DC] text-[#B8791F]",
  due: "bg-[#FBE9E9] text-[#C24F4F]",
  paid: "bg-[#E6F7EC] text-[#2E9E5B]",
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function StatusPill({ value, label }: { value: string; label: string }) {
  const cls = STATUS_COLORS[value] ?? "bg-[#F1F0F8] text-[#726C8C]";
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>;
}

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethodValue; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

function POSSaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const saleId = Number(id);
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";
  const canPay = me?.has_pos_access && me.permissions.can_sell;
  const cashierName = me?.has_pos_access ? me.role_display : "";

  const detailQuery = useSaleDetail(saleId);
  const businessQuery = useBusinessSettings();
  const addPaymentMutation = useAddSalePayment(saleId);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  if (detailQuery.isLoading || !detailQuery.data) {
    return <p className="text-[13px] text-[#A8A2C9]">Loading…</p>;
  }
  const sale = detailQuery.data;

  const handlePrint = () => {
    if (!businessQuery.data) {
      toast.error("Business settings didn't load — can't print yet.");
      return;
    }
    printReceipts({ sale, business: businessQuery.data, cashierName });
  };

  const handleAddPayment = async () => {
    const numeric = Number(amount);
    if (!amount || Number.isNaN(numeric) || numeric <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    try {
      await addPaymentMutation.mutateAsync({
        amount,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        payment_note: paymentNote,
      });
      toast.success("Payment recorded.");
      setShowPaymentForm(false);
      setAmount("");
      setPaymentReference("");
      setPaymentNote("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <Link
          to="/admin/pos/sell/list"
          className="mb-2 inline-block text-[12px] font-medium text-[#7C6AE8] hover:underline"
        >
          ← Back to Sales
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-bold text-[#221F35]">{sale.invoice_no}</h1>
            <p className="text-[13px] text-[#726C8C]">
              {new Date(sale.sale_date).toLocaleString()} · {sale.customer_name || "Walk-In Customer"} ·{" "}
              {sale.location_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill value={sale.status} label={capitalize(sale.status)} />
            <StatusPill value={sale.payment_status} label={capitalize(sale.payment_status)} />
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg border border-[#E7E4F3] px-3 py-1.5 text-[12px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
            >
              Print
            </button>
            {sale.status === "final" && (
              <>
                <Link
                  to={`/admin/pos/sell/${sale.id}/edit`}
                  className="rounded-lg border border-[#E7E4F3] px-3 py-1.5 text-[12px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
                >
                  Edit
                </Link>
                <Link
                  to={`/admin/pos/sell/returns/add?sale=${sale.id}`}
                  className="rounded-lg border border-[#E7E4F3] px-3 py-1.5 text-[12px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
                >
                  Return
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment summary */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E7E4F3] bg-white p-5 sm:grid-cols-3">
        <div>
          <p className="text-[12px] text-[#A8A2C9]">Total Amount</p>
          <p className="text-[18px] font-semibold text-[#221F35]">
            {formatMoney(sale.total, sym)}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-[#A8A2C9]">Paid</p>
          <p className="text-[18px] font-semibold text-[#2E9E5B]">
            {formatMoney(sale.paid_amount, sym)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-[#A8A2C9]">Sell Due</p>
            <p className="text-[18px] font-semibold text-[#C24F4F]">
              {formatMoney(sale.due_amount, sym)}
            </p>
          </div>
          {canPay && sale.status === "final" && Number(sale.due_amount) > 0 && !showPaymentForm && (
            <button
              type="button"
              onClick={() => setShowPaymentForm(true)}
              className="rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
            >
              Add Payment
            </button>
          )}
        </div>
      </div>

      {sale.status !== "final" && (
        <p className="text-[12px] text-[#A8A2C9]">
          Only a Final sale can take payments — this one is {sale.status}.
        </p>
      )}

      {/* Add payment form */}
      {showPaymentForm && (
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-[#221F35]">Record a Payment</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                Amount (due: {formatMoney(sale.due_amount, sym)})
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
              />
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                Payment Method
              </span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodValue)}
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
              >
                {PAYMENT_METHOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                Reference (optional)
              </span>
              <input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Txn / cheque no."
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
              />
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                Note (optional)
              </span>
              <input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPaymentForm(false)}
              className="rounded-lg border border-[#E7E4F3] px-4 py-2 text-[13px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddPayment}
              disabled={addPaymentMutation.isPending}
              className="rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8] disabled:opacity-60"
            >
              {addPaymentMutation.isPending ? "Saving…" : "Save Payment"}
            </button>
          </div>
        </div>
      )}

      {/* Line items */}
      <div className="overflow-x-auto rounded-2xl border border-[#E7E4F3] bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#E7E4F3] text-left text-[#726C8C]">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Unit Price</th>
              <th className="px-4 py-3 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F4FA]">
            {sale.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 text-[#221F35]">
                  {item.product_name}
                  {item.variant_name ? ` — ${item.variant_name}` : ""}
                  <span className="ml-2 text-[12px] text-[#A8A2C9]">{item.sku}</span>
                </td>
                <td className="px-4 py-2 text-[#726C8C]">{item.quantity}</td>
                <td className="px-4 py-2 text-[#726C8C]">{formatMoney(item.unit_price, sym)}</td>
                <td className="px-4 py-2 text-[#726C8C]">{formatMoney(item.subtotal, sym)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment history */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[14px] font-semibold text-[#221F35]">Payment History</h3>
        {sale.payments.length === 0 ? (
          <p className="text-[13px] text-[#A8A2C9]">No payments recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[#F5F4FA]">
            {sale.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 text-[13px]">
                <span className="text-[#726C8C]">{new Date(p.paid_on).toLocaleString()}</span>
                <span className="text-[#726C8C]">{p.payment_method_display}</span>
                <span className="text-[#726C8C]">{p.payment_reference || "—"}</span>
                <span className="font-medium text-[#2E9E5B]">{formatMoney(p.amount, sym)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default POSSaleDetailPage;
