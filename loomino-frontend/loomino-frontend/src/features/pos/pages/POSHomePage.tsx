import { useState } from "react";
import {
  Wallet,
  ShoppingCart,
  AlertCircle,
  FileWarning,
  RotateCcw,
  Repeat,
  MinusCircle,
} from "lucide-react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import {
  useDashboardSummary,
  useSalesPaymentDue,
  usePurchasePaymentDue,
  useStockAlert,
  useStockExpiryAlert,
  useSalesOrders,
} from "../hooks/useDashboard";
import {
  getSalesPaymentDue,
  getPurchasePaymentDue,
  getStockAlert,
  getStockExpiryAlert,
  getSalesOrders,
} from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import StatCard from "../components/StatCard";
import SimpleLineChart from "../components/SimpleLineChart";
import DataTableShell from "../components/DataTableShell";
import DateRangeFilter from "../components/DateRangeFilter";
import { formatMoney, formatQty } from "../utils/format";
import type {
  DashboardFilters,
  SalesPaymentDueRow,
  PurchasePaymentDueRow,
  ProductStockAlertRow,
  StockExpiryAlertRow,
  SalesOrderRow,
} from "../types/pos";

function expiresInText(row: StockExpiryAlertRow): string {
  if (row.expires_in_days === null) return "—";
  if (row.expires_in_days < 0) return "Expired";
  return `${row.expires_in_days} days`;
}

function POSHomePage() {
  const { me } = usePOSAuth();
  const currencySymbol = me?.has_pos_access ? me.business.currency_symbol : "";

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const filters: DashboardFilters = {
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  };

  const summaryQuery = useDashboardSummary(filters);
  const summary = summaryQuery.data;

  const [salesDuePage, setSalesDuePage] = useState(1);
  const [purchaseDuePage, setPurchaseDuePage] = useState(1);
  const [stockAlertPage, setStockAlertPage] = useState(1);
  const [stockExpiryPage, setStockExpiryPage] = useState(1);
  const [salesOrderPage, setSalesOrderPage] = useState(1);

  const salesDueQuery = useSalesPaymentDue(salesDuePage, filters);
  const purchaseDueQuery = usePurchasePaymentDue(purchaseDuePage, filters);
  const stockAlertQuery = useStockAlert(stockAlertPage, filters);
  const stockExpiryQuery = useStockExpiryAlert(stockExpiryPage, filters);
  const salesOrderQuery = useSalesOrders(salesOrderPage, filters);

  const sym = currencySymbol;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold text-[#221F35]">
          Welcome{me?.has_pos_access ? `, ${me.role_display}` : ""}
        </h1>
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={({ dateFrom, dateTo }) => {
            setDateFrom(dateFrom);
            setDateTo(dateTo);
          }}
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Purchase"
          value={summary ? formatMoney(summary.total_purchase, sym) : "…"}
          icon={<Wallet size={20} />}
        />
        <StatCard
          label="Total Sales"
          value={summary ? formatMoney(summary.total_sales, sym) : "…"}
          icon={<ShoppingCart size={20} />}
          accent="#3DBE7A"
        />
        <StatCard
          label="Purchase Due"
          value={summary ? formatMoney(summary.purchase_due, sym) : "…"}
          icon={<AlertCircle size={20} />}
          accent="#E8A23D"
        />
        <StatCard
          label="Invoice Due"
          value={summary ? formatMoney(summary.invoice_due, sym) : "…"}
          icon={<FileWarning size={20} />}
          accent="#E8A23D"
        />
        <StatCard
          label="Total Purchase Return"
          value={summary ? formatMoney(summary.total_purchase_return, sym) : "…"}
          icon={<RotateCcw size={20} />}
          accent="#E36868"
        />
        <StatCard
          label="Total Sell Return"
          value={summary ? formatMoney(summary.total_sell_return, sym) : "…"}
          icon={<Repeat size={20} />}
          accent="#E36868"
        />
        <StatCard
          label="Expense"
          value={summary ? formatMoney(summary.expense, sym) : "…"}
          icon={<MinusCircle size={20} />}
          accent="#E36868"
        />
      </div>

      {/* Charts */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">
          Sales Last 30 Days
        </h3>
        <SimpleLineChart
          data={
            summary?.sales_last_30_days.map((d) => ({
              label: new Date(d.date).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              }),
              value: d.total,
            })) ?? []
          }
          currencySymbol={sym}
        />
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">
          Sales Current Financial Year
        </h3>
        <SimpleLineChart
          data={
            summary?.sales_current_financial_year.map((d) => ({
              label: d.month,
              value: d.total,
            })) ?? []
          }
          currencySymbol={sym}
          labelStride={1}
        />
      </div>

      {/* Payment due widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DataTableShell<SalesPaymentDueRow>
          title="Sales Payment Due"
          data={salesDueQuery.data}
          isLoading={salesDueQuery.isLoading}
          page={salesDuePage}
          onPageChange={setSalesDuePage}
          rowKey={(row) => row.id}
          filenameBase="sales-payment-due"
          fetchAll={() => fetchAllPages((p) => getSalesPaymentDue(p, filters))}
          columns={[
            { header: "Customer", render: (row) => row.customer },
            { header: "Invoice No.", render: (row) => row.invoice_no },
            {
              header: "Due Amount",
              align: "right",
              render: (row) => formatMoney(row.due_amount, sym),
              exportValue: (row) => row.due_amount,
            },
          ]}
        />

        <DataTableShell<PurchasePaymentDueRow>
          title="Purchase Payment Due"
          data={purchaseDueQuery.data}
          isLoading={purchaseDueQuery.isLoading}
          page={purchaseDuePage}
          onPageChange={setPurchaseDuePage}
          rowKey={(row) => row.id}
          filenameBase="purchase-payment-due"
          fetchAll={() => fetchAllPages((p) => getPurchasePaymentDue(p, filters))}
          columns={[
            { header: "Supplier", render: (row) => row.supplier },
            { header: "Reference No", render: (row) => row.reference_no },
            {
              header: "Due Amount",
              align: "right",
              render: (row) => formatMoney(row.due_amount, sym),
              exportValue: (row) => row.due_amount,
            },
          ]}
        />

        <DataTableShell<ProductStockAlertRow>
          title="Product Stock Alert"
          data={stockAlertQuery.data}
          isLoading={stockAlertQuery.isLoading}
          page={stockAlertPage}
          onPageChange={setStockAlertPage}
          rowKey={(row) => row.id}
          filenameBase="product-stock-alert"
          fetchAll={() => fetchAllPages((p) => getStockAlert(p, filters))}
          columns={[
            { header: "Product", render: (row) => row.product },
            { header: "Location", render: (row) => row.location },
            {
              header: "Current Stock",
              align: "right",
              render: (row) => `${formatQty(row.current_stock)} ${row.unit}`,
              exportValue: (row) => `${formatQty(row.current_stock)} ${row.unit}`,
            },
          ]}
        />

        <DataTableShell<StockExpiryAlertRow>
          title="Stock Expiry Alert"
          data={stockExpiryQuery.data}
          isLoading={stockExpiryQuery.isLoading}
          page={stockExpiryPage}
          onPageChange={setStockExpiryPage}
          rowKey={(row) => row.id}
          filenameBase="stock-expiry-alert"
          fetchAll={() => fetchAllPages((p) => getStockExpiryAlert(p, filters))}
          columns={[
            { header: "Product", render: (row) => row.product },
            { header: "Location", render: (row) => row.location },
            {
              header: "Stock Left",
              align: "right",
              render: (row) => formatQty(row.stock_left),
              exportValue: (row) => formatQty(row.stock_left),
            },
            {
              header: "Expires In",
              align: "right",
              render: (row) => expiresInText(row),
              exportValue: (row) => expiresInText(row),
            },
          ]}
        />
      </div>

      {/* Sales Order */}
      <DataTableShell<SalesOrderRow>
        title="Sales Order"
        data={salesOrderQuery.data}
        isLoading={salesOrderQuery.isLoading}
        page={salesOrderPage}
        onPageChange={setSalesOrderPage}
        rowKey={(row) => row.id}
        filenameBase="sales-order"
        fetchAll={() => fetchAllPages((p) => getSalesOrders(p, filters))}
        columns={[
          { header: "Date", render: (row) => row.sale_date },
          { header: "Order No.", render: (row) => row.order_no },
          { header: "Customer", render: (row) => row.customer_name },
          { header: "Contact Number", render: (row) => row.contact_number || "—" },
          { header: "Location", render: (row) => row.location },
          {
            header: "Status",
            render: (row) => <StatusPill value={row.status} />,
            exportValue: (row) => row.status,
          },
          {
            header: "Shipping Status",
            render: (row) =>
              row.shipping_status ? <StatusPill value={row.shipping_status} /> : "—",
            exportValue: (row) => row.shipping_status || "—",
          },
          {
            header: "Qty Remaining",
            align: "right",
            render: (row) => formatQty(row.quantity_remaining),
            exportValue: (row) => formatQty(row.quantity_remaining),
          },
          { header: "Added By", render: (row) => row.added_by || "—" },
        ]}
      />
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  final: "bg-[#E6F7EC] text-[#2E9E5B]",
  draft: "bg-[#F1F0F8] text-[#726C8C]",
  quotation: "bg-[#FDF1DC] text-[#B8791F]",
  suspended: "bg-[#FBE9E9] text-[#C24F4F]",
  ordered: "bg-[#EAF0FE] text-[#3E6FDB]",
  packed: "bg-[#F1F0F8] text-[#726C8C]",
  shipped: "bg-[#EAF0FE] text-[#3E6FDB]",
  delivered: "bg-[#E6F7EC] text-[#2E9E5B]",
  cancelled: "bg-[#FBE9E9] text-[#C24F4F]",
};

function StatusPill({ value }: { value: string }) {
  const cls = STATUS_COLORS[value] ?? "bg-[#F1F0F8] text-[#726C8C]";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${cls}`}>
      {value}
    </span>
  );
}

export default POSHomePage;
