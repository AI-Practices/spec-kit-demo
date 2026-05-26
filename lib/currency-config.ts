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
        (SUPPORTED_CURRENCIES as readonly string[]).includes(parsed.currencyCode)
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
  window.dispatchEvent(new CustomEvent("currency-changed", { detail: config }));
}
