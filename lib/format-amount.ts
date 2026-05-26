export type SupportedCurrency = "INR" | "USD";

const CURRENCY_LOCALE_MAP: Record<SupportedCurrency, string> = {
  INR: "en-IN",
  USD: "en-US",
};

export function formatAmount(
  cents: number,
  currencyCode: SupportedCurrency = "INR",
): string {
  const amount = cents / 100;
  const locale = CURRENCY_LOCALE_MAP[currencyCode] ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
