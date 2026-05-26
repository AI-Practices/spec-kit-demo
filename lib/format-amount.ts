export type SupportedCurrency = "INR" | "USD";

const CURRENCY_LOCALE_MAP: Record<SupportedCurrency, string> = {
  INR: "en-IN",
  USD: "en-US",
};

export function formatAmount(
  amount: number,
  currencyCode: SupportedCurrency = "INR",
): string {
  const locale = CURRENCY_LOCALE_MAP[currencyCode] ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
