"use client";

import { useCurrency } from "@/lib/use-currency";
import { SUPPORTED_CURRENCIES } from "@/lib/currency-config";

export default function CurrencySelector() {
  const { currencyCode, setCurrency } = useCurrency();

  return (
    <select
      value={currencyCode}
      onChange={(e) => setCurrency(e.target.value)}
      className="text-sm border border-zinc-300 rounded px-2 py-1 bg-white dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label="Select currency"
    >
      {SUPPORTED_CURRENCIES.map((code) => (
        <option key={code} value={code}>
          {code === "INR" ? "₹ INR" : "$ USD"}
        </option>
      ))}
    </select>
  );
}
