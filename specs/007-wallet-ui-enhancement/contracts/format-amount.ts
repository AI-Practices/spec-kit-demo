// Contract: Amount Formatting Utility
//
// Centralized function to format integer cents into locale-aware currency strings.
// Replaces 6 duplicated implementations across the codebase.
//
// Usage:
//   formatAmount(10050)           → "₹10,050.00"  (cent display: ₹100.50)
//   formatAmount(10050, "USD")   → "$10,050.00"
//   formatAmount(100000, "INR")  → "₹1,00,000.00" (lakh grouping)

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
