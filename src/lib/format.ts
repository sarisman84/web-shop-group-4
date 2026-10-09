/** Formats an amount of money for display, following the visitor's locale. */
export function formatMoney(
  amount: number,
  locale: string,
  currency = "SEK",
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amount,
  );
}
