/**
 * Determines which of the store's sizes count as "plus size".
 *
 * Sizes are free-text on the backend, so rather than hardcode
 * "XL,XXL" we match common plus-size patterns against the
 * live size list. This keeps the Plus Size page correct even
 * if the store uses "2XL", "3XL", "XXXL", etc.
 */
const PLUS_SIZE_PATTERNS = [
  /^xl$/i,
  /^xxl$/i,
  /^xxxl$/i,
  /^2xl$/i,
  /^3xl$/i,
  /^4xl$/i,
  /plus/i,
];

export function isPlusSize(name: string): boolean {
  const trimmed = name.trim();
  return PLUS_SIZE_PATTERNS.some((re) => re.test(trimmed));
}

export function selectPlusSizes(
  sizeNames: string[],
): string[] {
  return sizeNames.filter(isPlusSize);
}
