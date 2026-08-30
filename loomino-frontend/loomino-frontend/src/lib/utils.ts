import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { API_BASE_URL, CURRENCY_SYMBOL } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// The active display currency symbol. Defaults to the bundled
// constant and is overridden at runtime from Site Settings via
// setCurrencySymbol(), so every formatPrice() call site picks up
// the admin-configured symbol without needing to be a hook.
let activeCurrencySymbol = CURRENCY_SYMBOL;

export function setCurrencySymbol(symbol: string | undefined | null) {
  if (symbol && symbol.trim()) {
    activeCurrencySymbol = symbol.trim();
  }
}

/**
 * Formats a backend price (DRF Decimal → string) for display.
 * formatPrice("485.00") → "৳485.00"
 */
export function formatPrice(
  value: string | number | null | undefined,
): string {
  const amount =
    typeof value === "string" ? parseFloat(value) : value;

  if (amount == null || Number.isNaN(amount)) {
    return `${activeCurrencySymbol}0.00`;
  }

  return `${activeCurrencySymbol}${amount.toFixed(2)}`;
}

/** Resolves a backend media path to an absolute URL. */
export function getMediaUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null;

  if (path.startsWith("http")) return path;

  return `${API_BASE_URL}${path}`;
}

/** Formats an ISO date string as e.g. "Jul 11, 2026". */
export function formatDate(
  iso: string | null | undefined,
): string {
  if (!iso) return "";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
