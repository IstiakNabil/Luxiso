/**
 * Loomino design tokens, mirrored from the Figma file's
 * variables (node 1:3324 variable defs). Use these instead
 * of hardcoding hex values so future batches stay
 * consistent with the design system.
 *
 * Fonts: the design uses Montserrat. We self-host it via
 * @fontsource/montserrat (imported in main.tsx) and expose
 * it through the FONT constants below.
 */

export const COLORS = {
  // Core
  black: "#0C0C0C",
  trueBlack: "#000000",
  white: "#FFFFFF",

  // Brand
  brown: "#4C300D", // primary accent / links (breadcrumb active)
  greenDark: "#343E32", // primary/primary750 — dark buttons
  green: "#748C70", // secondary green

  // Primary tints
  primary25: "#F0F2EF", // panel background
  primary50: "#D1D9CF", // borders / subtle fills

  // Page surfaces (from cart/checkout frames)
  pageCream: "#F0E6D8",

  // Neutrals
  gray606: "#606060",
  gray868: "#868686",
  grayADA: "#ADADAD",
  grayCBC: "#CBCBCB",
  grayDFD: "#DFDFDF",
  gray202: "#202020",

  // Status (derived to fit the palette; not in Figma vars)
  statusPendingBg: "#F0E6D8",
  statusPendingText: "#4C300D",
  statusConfirmedBg: "#E3EAF3",
  statusConfirmedText: "#33506F",
  statusProcessingBg: "#EDE9F2",
  statusProcessingText: "#5A4B78",
  statusShippedBg: "#E5EDE3",
  statusShippedText: "#3B5537",
  statusDeliveredBg: "#DCE7DA",
  statusDeliveredText: "#2C4A28",
  statusCancelledBg: "#F3E3E3",
  statusCancelledText: "#8A3B3B",
} as const;

/** Font family stacks. */
export const FONT = {
  sans: "'Montserrat', sans-serif",
} as const;

/**
 * Type scale from Figma text styles.
 * size in px, lineHeight unitless, weight numeric.
 */
export const TYPE = {
  h3: { size: 32, weight: 600, lineHeight: 1.4 },
  h5: { size: 20, weight: 700, lineHeight: 1.4 },
  h6: { size: 16, weight: 700, lineHeight: 1.4 },
  bodyXL: { size: 20, weight: 400, lineHeight: 1.8 },
  bodyLG: { size: 18, weight: 400, lineHeight: 1.8 },
  bodyMD: { size: 16, weight: 400, lineHeight: 1.8 },
  bodySM: { size: 14, weight: 400, lineHeight: 1.8 },
  bodyXS: { size: 12, weight: 400, lineHeight: 1.8 },
  buttonSM: { size: 14, weight: 400, lineHeight: 1.71 },
} as const;
