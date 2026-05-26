// Contract: useCurrency React Hook
//
// Reactive hook that wraps getCurrencyConfig / setCurrencyConfig.
// Re-renders components when the currency changes.
// Uses a custom event to broadcast changes across components.
//
// Usage:
//   const { currencyCode, setCurrency, formatAmount } = useCurrency();
//   formatAmount(10050) → "₹10,050.00"  (respects current currency)

export interface UseCurrencyReturn {
  currencyCode: string;
  setCurrency: (code: string) => void;
  formatAmount: (cents: number) => string;
}
