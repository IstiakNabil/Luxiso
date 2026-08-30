export const API_BASE_URL = "http://127.0.0.1:8000";

/** Single source of truth for the display currency. */
export const CURRENCY_SYMBOL = "৳";

/**
 * Loomino only ships within Bangladesh, so this is the single
 * valid option for the Country / Region dropdown — matching the
 * backend Address model's default. Kept as a list (not a
 * constant string) so more countries can be added later without
 * touching the form components.
 */
export const COUNTRY_OPTIONS = ["Bangladesh"];
