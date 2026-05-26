// Contract: Currency Configuration Persistence
//
// Manages the user's currency preference in localStorage.
// Provides get/set/subscribe for reactive updates across components.
//
// Usage:
//   const { currencyCode, setCurrency } = useCurrency();
//   // or raw:
//   getCurrencyConfig() → { currencyCode: "INR" }
//   setCurrencyConfig({ currencyCode: "USD" })

export interface CurrencyConfig {
  currencyCode: string;
}

export const SUPPORTED_CURRENCIES = ["INR", "USD"] as const;
export const DEFAULT_CURRENCY = "INR";
export const STORAGE_KEY = "currency-preference";

export function getCurrencyConfig(): CurrencyConfig {
  if (typeof window === "undefined") {
    return { currencyCode: DEFAULT_CURRENCY };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        typeof parsed.currencyCode === "string" &&
        SUPPORTED_CURRENCIES.includes(parsed.currencyCode as any)
      ) {
        return parsed as CurrencyConfig;
      }
    }
  } catch {}
  return { currencyCode: DEFAULT_CURRENCY };
}

export function setCurrencyConfig(config: CurrencyConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
