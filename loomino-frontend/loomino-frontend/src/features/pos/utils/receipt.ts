import type { SaleDetail, BusinessSettings } from "../types/pos";

/**
 * Physical paper widths. Thermal rolls are quoted by paper width but
 * the printable area is narrower (margins the printer can't reach),
 * so these are print widths, not paper widths.
 */
const WIDTH_CSS: Record<string, string> = {
  "58mm": "48mm",
  "80mm": "72mm",
  a4: "190mm",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function money(value: string | number, symbol: string): string {
  const n = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(n) ? n : 0;
  return `${symbol}${safe.toFixed(2)}`;
}

interface BuildReceiptOptions {
  sale: SaleDetail;
  business: BusinessSettings;
  /** Seller copy adds cost/margin-free internal detail and a signature line. */
  variant: "customer" | "seller";
  cashierName: string;
}

function buildReceiptHtml({ sale, business, variant, cashierName }: BuildReceiptOptions): string {
  const width = WIDTH_CSS[business.receipt_paper_width] ?? WIDTH_CSS["80mm"];
  const isThermal = business.receipt_paper_width !== "a4";
  const sym = business.currency_symbol;

  const lines = sale.items
    .map(
      (item) => `
      <tr>
        <td colspan="3" class="item-name">${escapeHtml(
          item.variant_name ? `${item.product_name} — ${item.variant_name}` : item.product_name,
        )}</td>
      </tr>
      <tr>
        <td class="qty">${Number(item.quantity)} ×</td>
        <td class="price">${money(item.unit_price, sym)}</td>
        <td class="amount">${money(item.subtotal, sym)}</td>
      </tr>`,
    )
    .join("");

  const discountRow =
    Number(sale.discount) > 0
      ? `<tr><td colspan="2">Discount</td><td class="amount">− ${money(sale.discount, sym)}</td></tr>`
      : "";
  const taxRow =
    Number(sale.tax) > 0
      ? `<tr><td colspan="2">Tax</td><td class="amount">${money(sale.tax, sym)}</td></tr>`
      : "";
  const shippingRow =
    Number(sale.shipping_charges) > 0
      ? `<tr><td colspan="2">Shipping</td><td class="amount">${money(sale.shipping_charges, sym)}</td></tr>`
      : "";

  const sellerExtras =
    variant === "seller"
      ? `
      <div class="seller-block">
        <div class="row"><span>Cashier</span><span>${escapeHtml(cashierName)}</span></div>
        <div class="row"><span>Payment</span><span>${escapeHtml(sale.payment_method)}</span></div>
        <div class="row"><span>Status</span><span>${escapeHtml(sale.payment_status)}</span></div>
        <div class="sign">Signature: ____________________</div>
      </div>`
      : "";

  const footer =
    variant === "customer" && business.receipt_footer_text
      ? `<div class="footer">${escapeHtml(business.receipt_footer_text)}</div>`
      : "";

  const logo =
    business.receipt_show_logo && business.logo
      ? `<img class="logo" src="${business.logo}" alt="" />`
      : "";

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(sale.invoice_no)}</title>
        <style>
          @page { size: ${isThermal ? `${width} auto` : "A4"}; margin: ${isThermal ? "2mm" : "12mm"}; }
          body {
            width: ${width};
            margin: 0 auto;
            font-family: "Courier New", monospace;
            font-size: ${isThermal ? "11px" : "13px"};
            color: #000;
            line-height: 1.35;
          }
          .logo { display: block; max-width: 60%; margin: 0 auto 4px; }
          .center { text-align: center; }
          .biz-name { font-size: ${isThermal ? "14px" : "18px"}; font-weight: bold; }
          .muted { font-size: ${isThermal ? "10px" : "12px"}; }
          hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 1px 0; vertical-align: top; }
          .item-name { font-weight: bold; padding-top: 4px; }
          .qty { width: 22%; }
          .price { width: 33%; }
          .amount { text-align: right; }
          .total-row td { font-weight: bold; font-size: ${isThermal ? "13px" : "15px"}; padding-top: 4px; }
          .row { display: flex; justify-content: space-between; }
          .copy-label {
            text-align: center; font-weight: bold; letter-spacing: 1px;
            border: 1px solid #000; padding: 2px; margin-bottom: 6px;
          }
          .seller-block { margin-top: 8px; font-size: ${isThermal ? "10px" : "12px"}; }
          .sign { margin-top: 18px; }
          .footer { text-align: center; margin-top: 8px; font-size: ${isThermal ? "10px" : "12px"}; }
        </style>
      </head>
      <body>
        <div class="copy-label">${variant === "customer" ? "CUSTOMER COPY" : "SELLER COPY"}</div>
        ${logo}
        <div class="center biz-name">${escapeHtml(business.name)}</div>
        ${business.address ? `<div class="center muted">${escapeHtml(business.address)}</div>` : ""}
        ${business.phone ? `<div class="center muted">${escapeHtml(business.phone)}</div>` : ""}
        <hr />
        <div class="row"><span>Invoice</span><span>${escapeHtml(sale.invoice_no)}</span></div>
        <div class="row"><span>Date</span><span>${new Date(sale.sale_date).toLocaleString()}</span></div>
        <div class="row"><span>Customer</span><span>${escapeHtml(sale.customer_name)}</span></div>
        <div class="row"><span>Location</span><span>${escapeHtml(sale.location_name)}</span></div>
        <hr />
        <table>${lines}</table>
        <hr />
        <table>
          <tr><td colspan="2">Subtotal</td><td class="amount">${money(sale.subtotal, sym)}</td></tr>
          ${discountRow}
          ${taxRow}
          ${shippingRow}
          <tr class="total-row"><td colspan="2">TOTAL</td><td class="amount">${money(sale.total, sym)}</td></tr>
          <tr><td colspan="2">Paid</td><td class="amount">${money(sale.paid_amount, sym)}</td></tr>
          <tr><td colspan="2">Due</td><td class="amount">${money(sale.due_amount, sym)}</td></tr>
        </table>
        ${sellerExtras}
        ${footer}
      </body>
    </html>`;
}

/**
 * Opens one print window containing both copies (customer then
 * seller) separated by a page break, so a single print action
 * produces both slips rather than making the cashier click twice
 * mid-transaction.
 */
export function printReceipts(options: Omit<BuildReceiptOptions, "variant">) {
  const customer = buildReceiptHtml({ ...options, variant: "customer" });
  const seller = buildReceiptHtml({ ...options, variant: "seller" });

  // Splice the seller copy into the customer document's body so both
  // print in one job with a hard page break between them.
  const sellerBody = seller.slice(seller.indexOf("<body>") + 6, seller.indexOf("</body>"));
  const combined = customer.replace(
    "</body>",
    `<div style="page-break-before: always;"></div>${sellerBody}</body>`,
  );

  const printWindow = window.open("", "_blank", "width=420,height=700");
  if (!printWindow) return;
  printWindow.document.write(combined);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}
