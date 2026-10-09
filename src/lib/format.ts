/**
 * Formats an amount of money for display, following the visitor's locale:
 * "720 kr" on sv, "SEK 720" on en. Whole amounts drop the decimals.
 */
export function formatMoney(
  amount: number,
  locale: string,
  currency = "SEK",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    trailingZeroDisplay: "stripIfInteger",
  }).format(amount);
}
