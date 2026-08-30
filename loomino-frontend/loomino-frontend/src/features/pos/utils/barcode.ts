import JsBarcode from "jsbarcode";

import type { BarcodeType } from "../types/pos";

const FORMAT_MAP: Record<BarcodeType, string> = {
  c128: "CODE128",
  c39: "CODE39",
  ean13: "EAN13",
  ean8: "EAN8",
  upca: "UPC",
  // JsBarcode doesn't have a distinct UPC-E encoder; UPC-A is the closest
  // available fallback. Flagged in the UI, not silently substituted.
  upce: "UPC",
};

/**
 * Renders a barcode to an off-screen SVG element and serializes it to
 * a markup string. This lets the print window's HTML embed the
 * barcode directly (as inline <svg>) without needing to load
 * JsBarcode inside that separate window at all.
 */
export function renderBarcodeSvg(
  value: string,
  type: BarcodeType,
  widthPx: number,
  heightPx: number,
): string | null {
  if (!value) return null;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  try {
    JsBarcode(svg, value, {
      format: FORMAT_MAP[type] ?? "CODE128",
      width: 1.6,
      height: heightPx,
      displayValue: false,
      margin: 0,
    });
  } catch {
    // Value isn't valid for the chosen symbology (e.g. non-numeric for
    // EAN-13) -- caller shows this as a per-label warning instead of a
    // reproduced barcode.
    return null;
  }

  svg.setAttribute("width", String(widthPx));
  svg.setAttribute("style", `width:${widthPx}px;height:${heightPx}px;`);
  return new XMLSerializer().serializeToString(svg);
}
