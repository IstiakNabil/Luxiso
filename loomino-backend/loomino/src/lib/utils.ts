import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { API_BASE_URL, CURRENCY_SYMBOL } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a backend price (DRF Decimal → string) for display.
 * formatPrice("485.00") → "$485.00"
 */
export function formatPrice(
  value: string | number | null | undefined,
): string {
  const amount =
    typeof value === "string" ? parseFloat(value) : value;

  if (amount == null || Number.isNaN(amount)) {
    return `${CURRENCY_SYMBOL}0.00`;
  }

  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
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
