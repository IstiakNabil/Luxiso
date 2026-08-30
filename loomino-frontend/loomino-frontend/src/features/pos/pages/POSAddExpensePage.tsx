import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useExpenseCategories, useCreateExpense } from "../hooks/useExpenses";
import { useContacts } from "../hooks/useContacts";
import { useTaxRates } from "../hooks/useProducts";
import { formatMoney } from "../utils/format";
import type { PaymentMethodValue } from "../types/pos";

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function nowLocalDateTime(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function POSAddExpensePage() {
  const navigate = useNavigate();
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const locationsQuery = usePOSLocations();
  const categoriesQuery = useExpenseCategories();
  const contactsQuery = useContacts("supplier", 1, "", undefined);
  const taxRatesQuery = useTaxRates();
  const createMutation = useCreateExpense();

  const [locationId, setLocationId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<number | "">("");
  const [referenceNo, setReferenceNo] = useState("");
  const [expenseDate, setExpenseDate] = useState(nowLocalDateTime());
  const [expenseForContact, setExpenseForContact] = useState<number | "">("");
  const [attachedDocument, setAttachedDocument] = useState<File | null>(null);
  const [taxRateId, setTaxRateId] = useState<number | "">("");
  const [totalAmount, setTotalAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");
  const [isRefund, setIsRefund] = useState(false);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringIntervalValue, setRecurringIntervalValue] = useState("");
  const [recurringIntervalUnit, setRecurringIntervalUnit] = useState<"days" | "months" | "years">("days");
  const [recurringRepetitions, setRecurringRepetitions] = useState("");

  const [paidAmount, setPaidAmount] = useState("0");
  const [paidOn, setPaidOn] = useState(nowLocalDateTime());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("cash");
  const [paymentNote, setPaymentNote] = useState("");

  const subcategoryOptions = useMemo(
    () => (categoriesQuery.data ?? []).filter((c) => c.parent === categoryId),
    [categoriesQuery.data, categoryId],
  );

  const selectedTax = taxRatesQuery.data?.find((t) => t.id === taxRateId);
  const taxAmount = selectedTax ? (toNum(totalAmount) * toNum(selectedTax.rate)) / 100 : 0;
  const totalPayable = toNum(totalAmount) + taxAmount;
  const paymentDue = totalPayable - toNum(paidAmount);

  const handleSubmit = async () => {
    if (!totalAmount || toNum(totalAmount) <= 0) {
      toast.error("Total amount is required.");
      return;
    }

    const formData = new FormData();
    if (locationId) formData.append("location", String(locationId));
    if (categoryId) formData.append("category", String(categoryId));
    if (subcategoryId) formData.append("subcategory", String(subcategoryId));
    if (referenceNo) formData.append("reference_no", referenceNo);
    formData.append("expense_date", new Date(expenseDate).toISOString());
    if (expenseForContact) formData.append("expense_for_contact", String(expenseForContact));
    if (attachedDocument) formData.append("attached_document", attachedDocument);
    if (taxRateId) formData.append("tax_rate", String(taxRateId));
    formData.append("amount", totalAmount);
    formData.append("is_refund", String(isRefund));
    formData.append("note", expenseNote);
    formData.append("is_recurring", String(isRecurring));
    if (isRecurring) {
      formData.append("recurring_interval_value", recurringIntervalValue || "1");
      formData.append("recurring_interval_unit", recurringIntervalUnit);
      if (recurringRepetitions) formData.append("recurring_repetitions", recurringRepetitions);
    }
    formData.append("payment_method", paymentMethod);
    formData.append("paid_on", paidOn ? new Date(paidOn).toISOString() : "");
    formData.append("payment_note", paymentNote);
    formData.append("paid_amount", paidAmount || "0");

    try {
      const expense = await createMutation.mutateAsync(formData);
      toast.success(`${expense.reference_no} saved.`);
      navigate("/admin/pos/expenses/list");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Add Expense</h1>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Expense Category</span>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value === "" ? "" : Number(e.target.value));
                setSubcategoryId("");
              }}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">Please Select</option>
              {(categoriesQuery.data ?? []).filter((c) => c.parent === null).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Sub category</span>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={!categoryId || subcategoryOptions.length === 0}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8] disabled:bg-[#F5F4FA]"
            >
              <option value="">Please Select</option>
              {subcategoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Reference No</span>
            <input
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="Leave empty to autogenerate"
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Date <span className="text-[#C24F4F]">*</span>
            </span>
            <input
              type="datetime-local"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Expense for contact
            </span>
            <select
              value={expenseForContact}
              onChange={(e) => setExpenseForContact(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">Please Select</option>
              {contactsQuery.data?.results.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Attach Document</span>
            <input
              type="file"
              onChange={(e) => setAttachedDocument(e.target.files?.[0] ?? null)}
              className="text-[13px] text-[#3A3560]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Applicable Tax</span>
            <select
              value={taxRateId}
              onChange={(e) => setTaxRateId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">None</option>
              {taxRatesQuery.data?.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Total amount <span className="text-[#C24F4F]">*</span>
            </span>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Total amount"
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Expense note</span>
          <textarea
            value={expenseNote}
            onChange={(e) => setExpenseNote(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>

        <label className="mt-4 flex items-center gap-2 text-[13px] text-[#221F35]">
          <input
            type="checkbox"
            checked={isRefund}
            onChange={(e) => setIsRefund(e.target.checked)}
            className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
          />
          Is refund?
        </label>
      </div>

      {/* Recurring */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <label className="mb-4 flex items-center gap-2 text-[13px] font-medium text-[#221F35]">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
          />
          Is Recurring?
        </label>
        {isRecurring && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                Recurring interval
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={recurringIntervalValue}
                  onChange={(e) => setRecurringIntervalValue(e.target.value)}
                  className="w-24 rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
                />
                <select
                  value={recurringIntervalUnit}
                  onChange={(e) => setRecurringIntervalUnit(e.target.value as "days" | "months" | "years")}
                  className="rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
                >
                  <option value="days">Days</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">No. of Repetitions</span>
              <input
                type="number"
                value={recurringRepetitions}
                onChange={(e) => setRecurringRepetitions(e.target.value)}
                placeholder="If blank, repeats infinitely"
                className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
              />
            </label>
            <p className="md:col-span-2 text-[12px] text-[#A8A2C9]">
              Recurrence is recorded but not yet auto-generated — future expense entries
              from this schedule will need a background job that isn't built yet.
            </p>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">Add payment</h3>
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
              Paid on <span className="text-[#C24F4F]">*</span>
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
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Payment note</span>
          <textarea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>

        <div className="mt-4 border-t border-[#E7E4F3] pt-4 text-right text-[14px] font-semibold text-[#221F35]">
          Payment due: {formatMoney(paymentDue, sym)}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate("/admin/pos/expenses/list")}
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

export default POSAddExpensePage;
