import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Trash2, Printer, AlertTriangle } from "lucide-react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { searchVariants } from "../services/pos.service";
import { renderBarcodeSvg } from "../utils/barcode";
import type { BarcodeType, VariantSearchResult } from "../types/pos";

interface LabelQueueItem {
  productId: number;
  name: string;
  sku: string;
  barcode: string | null;
  price: string;
  barcodeType: BarcodeType;
  numLabels: number;
  expDate: string;
  packingDate: string;
}

const LABEL_SIZES = [
  { id: "1.5x1", label: '1.5" x 1"', widthPx: 144, heightPx: 96, barcodeHeightPx: 36 },
  { id: "2x1", label: '2" x 1"', widthPx: 192, heightPx: 96, barcodeHeightPx: 36 },
  { id: "3x1", label: '3" x 1"', widthPx: 288, heightPx: 96, barcodeHeightPx: 36 },
];

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function POSPrintLabelsPage() {
  const { me } = usePOSAuth();
  const businessName = me?.has_pos_access ? me.business.name : "";
  const currencySymbol = me?.has_pos_access ? me.business.currency_symbol : "";

  const [searchTerm, setSearchTerm] = useState("");
  const [queue, setQueue] = useState<LabelQueueItem[]>([]);

  const [showProductName, setShowProductName] = useState(true);
  const [productNameSize, setProductNameSize] = useState(15);
  const [showVariation, setShowVariation] = useState(true);
  const [variationSize, setVariationSize] = useState(12);
  const [showPrice, setShowPrice] = useState(true);
  const [priceSize, setPriceSize] = useState(12);
  const [priceMode, setPriceMode] = useState<"inc" | "exc">("inc");
  const [showBusinessName, setShowBusinessName] = useState(true);
  const [businessNameSize, setBusinessNameSize] = useState(15);
  const [showPackingDate, setShowPackingDate] = useState(true);
  const [packingDateSize, setPackingDateSize] = useState(12);
  const [showExpiryDate, setShowExpiryDate] = useState(true);
  const [expiryDateSize, setExpiryDateSize] = useState(12);
  const [labelSizeId, setLabelSizeId] = useState(LABEL_SIZES[0].id);

  // Searches VARIANTS, not products -- each size/colour carries its
  // own EAN-13, so a "Red / M" label must encode that variant's
  // barcode rather than a shared product-level SKU.
  const searchQuery = useQuery({
    queryKey: ["pos", "variants", "label-search", searchTerm],
    queryFn: () => searchVariants(searchTerm),
    enabled: searchTerm.trim().length >= 2,
  });

  const addToQueue = (variant: VariantSearchResult) => {
    if (queue.some((q) => q.productId === variant.id)) {
      toast.error(`${variant.display_name} is already in the list.`);
      return;
    }
    setQueue((prev) => [
      ...prev,
      {
        productId: variant.id,
        name: variant.display_name,
        sku: variant.sku,
        barcode: variant.barcode,
        price: variant.selling_price,
        // Default to the scannable retail EAN-13 when the variant has
        // one; fall back to CODE128 over the SKU otherwise.
        barcodeType: variant.barcode ? "ean13" : "c128",
        numLabels: 1,
        expDate: "",
        packingDate: "",
      },
    ]);
    setSearchTerm("");
  };

  const updateQueueItem = (productId: number, patch: Partial<LabelQueueItem>) => {
    setQueue((prev) => prev.map((q) => (q.productId === productId ? { ...q, ...patch } : q)));
  };

  const removeFromQueue = (productId: number) => {
    setQueue((prev) => prev.filter((q) => q.productId !== productId));
  };

  const handlePreview = () => {
    if (queue.length === 0) {
      toast.error("Add at least one product first.");
      return;
    }

    const size = LABEL_SIZES.find((s) => s.id === labelSizeId) ?? LABEL_SIZES[0];
    let skippedCount = 0;

    const labelsHtml = queue
      .flatMap((item) => {
        const barcodeSvg = renderBarcodeSvg(
          item.barcode || item.sku,
          item.barcodeType,
          size.widthPx - 16,
          size.barcodeHeightPx,
        );
        if (!barcodeSvg) {
          skippedCount += 1;
          return [];
        }

        const lines: string[] = [];
        if (showBusinessName && businessName) {
          lines.push(`<div style="font-size:${businessNameSize}px;font-weight:600;">${escapeHtml(businessName)}</div>`);
        }
        if (showProductName) {
          lines.push(`<div style="font-size:${productNameSize}px;">${escapeHtml(item.name)}</div>`);
        }
        if (showVariation) {
          lines.push(`<div style="font-size:${variationSize}px;color:#666;">${escapeHtml(item.sku || "-")}</div>`);
        }

        const bottomLine: string[] = [];
        if (showPrice) {
          const label = priceMode === "inc" ? "Inc. tax" : "Exc. tax";
          bottomLine.push(
            `<span style="font-size:${priceSize}px;">${currencySymbol}${escapeHtml(item.price)} (${label})</span>`,
          );
        }
        if (showPackingDate && item.packingDate) {
          bottomLine.push(`<span style="font-size:${packingDateSize}px;">Pkd: ${escapeHtml(item.packingDate)}</span>`);
        }
        if (showExpiryDate && item.expDate) {
          bottomLine.push(`<span style="font-size:${expiryDateSize}px;">Exp: ${escapeHtml(item.expDate)}</span>`);
        }

        const oneLabel = `
          <div class="label" style="width:${size.widthPx}px;height:${size.heightPx}px;">
            ${lines.join("")}
            ${barcodeSvg}
            <div class="label-bottom">${bottomLine.join(" &nbsp;·&nbsp; ")}</div>
          </div>
        `;
        return Array(item.numLabels).fill(oneLabel);
      })
      .join("");

    if (skippedCount > 0) {
      toast.error(
        `${skippedCount} label${skippedCount === 1 ? "" : "s"} skipped — SKU isn't valid for the chosen barcode type.`,
      );
    }

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Labels</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 12px; }
            .sheet { display: flex; flex-wrap: wrap; gap: 6px; }
            .label {
              border: 1px dashed #ccc;
              padding: 4px 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              overflow: hidden;
              page-break-inside: avoid;
            }
            .label-bottom { margin-top: 2px; white-space: nowrap; }
            @media print { .label { border: none; } }
          </style>
        </head>
        <body>
          <div class="sheet">${labelsHtml}</div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Print Labels</h1>
        <p className="text-[13px] text-[#726C8C]">
          Barcodes are generated in your browser from each product's SKU — no server round trip.
        </p>
      </div>

      {/* Add products */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[14px] font-semibold text-[#221F35]">Add products to generate Labels</h3>
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] px-3 py-2">
            <Search size={14} className="text-[#8A84B8]" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter product name to print labels"
              className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
            />
          </div>
          {searchTerm.trim().length >= 2 && (
            <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#E7E4F3] bg-white shadow-lg">
              {searchQuery.isLoading ? (
                <p className="px-3 py-2 text-[13px] text-[#A8A2C9]">Searching…</p>
              ) : searchQuery.data?.length === 0 ? (
                <p className="px-3 py-2 text-[13px] text-[#A8A2C9]">No matching products.</p>
              ) : (
                searchQuery.data?.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => addToQueue(variant)}
                    className="flex w-full items-center justify-between border-b border-[#F5F4FA] px-3 py-2 text-left last:border-b-0 hover:bg-[#F5F4FA]"
                  >
                    <span className="text-[13px] text-[#221F35]">{variant.display_name}</span>
                    <span className="text-[12px] text-[#A8A2C9]">
                      {variant.barcode || variant.sku}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {queue.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#EDEBFA] text-[#726C8C]">
                  <th className="py-2 pr-4 font-medium">Products</th>
                  <th className="py-2 pr-4 font-medium">No. of labels</th>
                  <th className="py-2 pr-4 font-medium">EXP Date</th>
                  <th className="py-2 pr-4 font-medium">Packing Date</th>
                  <th className="py-2 pr-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item.productId} className="border-b border-[#F5F4FA]">
                    <td className="py-2 pr-4 text-[#221F35]">
                      {item.name}
                      <span className="ml-1 text-[12px] text-[#A8A2C9]">({item.sku})</span>
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="number"
                        min={1}
                        value={item.numLabels}
                        onChange={(e) =>
                          updateQueueItem(item.productId, {
                            numLabels: Math.max(1, Number(e.target.value)),
                          })
                        }
                        className="w-20 rounded-lg border border-[#E7E4F3] px-2 py-1.5 text-[13px] outline-none focus:border-[#7C6AE8]"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="date"
                        value={item.expDate}
                        onChange={(e) => updateQueueItem(item.productId, { expDate: e.target.value })}
                        className="rounded-lg border border-[#E7E4F3] px-2 py-1.5 text-[13px] outline-none focus:border-[#7C6AE8]"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="date"
                        value={item.packingDate}
                        onChange={(e) => updateQueueItem(item.productId, { packingDate: e.target.value })}
                        className="rounded-lg border border-[#E7E4F3] px-2 py-1.5 text-[13px] outline-none focus:border-[#7C6AE8]"
                      />
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <button
                        type="button"
                        onClick={() => removeFromQueue(item.productId)}
                        className="text-[#C24F4F] hover:underline"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Label content options */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">Information to show in Labels</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <OptionSizeField
            label="Product Name"
            checked={showProductName}
            onCheckedChange={setShowProductName}
            size={productNameSize}
            onSizeChange={setProductNameSize}
          />
          <OptionSizeField
            label="Product SKU (variation)"
            checked={showVariation}
            onCheckedChange={setShowVariation}
            size={variationSize}
            onSizeChange={setVariationSize}
          />
          <div>
            <OptionSizeField
              label="Product Price"
              checked={showPrice}
              onCheckedChange={setShowPrice}
              size={priceSize}
              onSizeChange={setPriceSize}
            />
            <select
              value={priceMode}
              onChange={(e) => setPriceMode(e.target.value as "inc" | "exc")}
              className="mt-2 w-full rounded-lg border border-[#E7E4F3] px-2.5 py-1.5 text-[12px] outline-none"
            >
              <option value="inc">Inc. tax</option>
              <option value="exc">Exc. tax</option>
            </select>
          </div>
          <OptionSizeField
            label="Business name"
            checked={showBusinessName}
            onCheckedChange={setShowBusinessName}
            size={businessNameSize}
            onSizeChange={setBusinessNameSize}
          />
          <OptionSizeField
            label="Print packing date"
            checked={showPackingDate}
            onCheckedChange={setShowPackingDate}
            size={packingDateSize}
            onSizeChange={setPackingDateSize}
          />
          <OptionSizeField
            label="Print expiry date"
            checked={showExpiryDate}
            onCheckedChange={setShowExpiryDate}
            size={expiryDateSize}
            onSizeChange={setExpiryDateSize}
          />
        </div>
      </div>

      {/* Barcode setting + preview */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Barcode / Label size
            </span>
            <select
              value={labelSizeId}
              onChange={(e) => setLabelSizeId(e.target.value)}
              className="w-56 rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              {LABEL_SIZES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handlePreview}
            className="flex items-center gap-2 rounded-lg bg-[#7C6AE8] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
          >
            <Printer size={16} /> Preview
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#FDF1DC] px-3 py-2 text-[12px] text-[#8A6A1F]">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            Each label encodes that exact variant's own EAN-13, so scanning a "Red / M" sticker
            at the till pulls up Red / M specifically — not the base product. Variants created
            before barcodes existed were backfilled automatically.
          </span>
        </div>
      </div>
    </div>
  );
}

function OptionSizeField({
  label,
  checked,
  onCheckedChange,
  size,
  onSizeChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  size: number;
  onSizeChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[13px] font-medium text-[#221F35]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
        />
        {label}
      </label>
      {checked && (
        <label className="mt-1.5 flex items-center gap-2 text-[12px] text-[#8A84B8]">
          Size
          <input
            type="number"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="w-16 rounded-lg border border-[#E7E4F3] px-2 py-1 text-[12px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
      )}
    </div>
  );
}

export default POSPrintLabelsPage;
