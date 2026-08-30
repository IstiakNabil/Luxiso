import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { useBusinessSettings, useUpdateBusinessSettings } from "../hooks/useSettings";
import type {
  BusinessSettings,
  CurrencySymbolPlacementValue,
  DateFormatValue,
  StockAccountingMethodValue,
  TimeFormatValue,
} from "../types/pos";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function POSBusinessSettingsPage() {
  const { data, isLoading } = useBusinessSettings();

  if (isLoading || !data) {
    return <p className="text-[13px] text-[#A8A2C9]">Loading…</p>;
  }

  // Keyed by id so this remounts (and re-syncs local state) if the
  // underlying settings row is ever replaced outright.
  return <BusinessSettingsForm key={data.id} settings={data} />;
}

/**
 * All initial state comes straight from `settings` via useState's
 * initializer -- no effect needed to "sync" query data into state
 * after the fact, since this only ever mounts once data has loaded
 * (see POSBusinessSettingsPage above).
 */
function BusinessSettingsForm({ settings }: { settings: BusinessSettings }) {
  const updateMutation = useUpdateBusinessSettings();

  const [name, setName] = useState(settings.name);
  const [startDate, setStartDate] = useState(settings.start_date ?? "");
  const [defaultProfitPercent, setDefaultProfitPercent] = useState(settings.default_profit_percent);
  const [currencyCode, setCurrencyCode] = useState(settings.currency_code);
  const [currencySymbolPlacement, setCurrencySymbolPlacement] =
    useState<CurrencySymbolPlacementValue>(settings.currency_symbol_placement);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState(settings.fiscal_year_start_month);
  const [transactionEditDays, setTransactionEditDays] = useState(String(settings.transaction_edit_days));
  const [dateFormat, setDateFormat] = useState<DateFormatValue>(settings.date_format);
  const [timeFormat, setTimeFormat] = useState<TimeFormatValue>(settings.time_format);
  const [stockAccountingMethod, setStockAccountingMethod] =
    useState<StockAccountingMethodValue>(settings.stock_accounting_method);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (startDate) formData.append("start_date", startDate);
    formData.append("default_profit_percent", defaultProfitPercent || "0");
    formData.append("currency_code", currencyCode);
    formData.append("currency_symbol_placement", currencySymbolPlacement);
    formData.append("timezone", timezone);
    formData.append("fiscal_year_start_month", String(fiscalYearStartMonth));
    formData.append("transaction_edit_days", transactionEditDays || "30");
    formData.append("date_format", dateFormat);
    formData.append("time_format", timeFormat);
    formData.append("stock_accounting_method", stockAccountingMethod);
    if (logoFile) formData.append("logo", logoFile);

    try {
      await updateMutation.mutateAsync(formData);
      toast.success("Business settings updated.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <h1 className="text-[20px] font-bold text-[#221F35]">Business Settings</h1>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Business Name <span className="text-[#C24F4F]">*</span>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Default profit percent
            </span>
            <input
              type="number"
              value={defaultProfitPercent}
              onChange={(e) => setDefaultProfitPercent(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Currency Code</span>
            <input
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
              maxLength={10}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Currency Symbol Placement
            </span>
            <select
              value={currencySymbolPlacement}
              onChange={(e) => setCurrencySymbolPlacement(e.target.value as CurrencySymbolPlacementValue)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="before">Before amount</option>
              <option value="after">After amount</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Time zone</span>
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="e.g. Asia/Dhaka"
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Upload Logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="text-[13px] text-[#3A3560]"
            />
            <p className="mt-1 text-[12px] text-[#A8A2C9]">Previous logo (if exists) will be replaced.</p>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Financial year start month
            </span>
            <select
              value={fiscalYearStartMonth}
              onChange={(e) => setFiscalYearStartMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Stock Accounting Method
            </span>
            <select
              value={stockAccountingMethod}
              onChange={(e) => setStockAccountingMethod(e.target.value as StockAccountingMethodValue)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="fifo">FIFO (First In First Out)</option>
              <option value="lifo">LIFO (Last In First Out)</option>
              <option value="average">Weighted Average</option>
            </select>
            <p className="mt-1 text-[12px] text-[#A8A2C9]">
              Stored as a preference — stock is currently costed with a single pooled price
              per product, not true lot-level costing.
            </p>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Transaction Edit Days
            </span>
            <input
              type="number"
              value={transactionEditDays}
              onChange={(e) => setTransactionEditDays(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Date Format</span>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as DateFormatValue)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="dd-mm-yyyy">dd-mm-yyyy</option>
              <option value="mm/dd/yyyy">mm/dd/yyyy</option>
              <option value="yyyy-mm-dd">yyyy-mm-dd</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Time Format</span>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value as TimeFormatValue)}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="12h">12 Hour</option>
              <option value="24h">24 Hour</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="rounded-lg bg-[#7C6AE8] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#6C5AD8] disabled:opacity-60"
        >
          {updateMutation.isPending ? "Updating…" : "Update Settings"}
        </button>
      </div>
    </div>
  );
}

export default POSBusinessSettingsPage;
