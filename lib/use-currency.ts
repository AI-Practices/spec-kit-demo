"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCurrencyConfig,
  setCurrencyConfig as persistConfig,
  DEFAULT_CURRENCY,
} from "@/lib/currency-config";
import { formatAmount as formatAmountUtil } from "@/lib/format-amount";
import type { SupportedCurrency } from "@/lib/format-amount";

export interface UseCurrencyReturn {
  currencyCode: string;
  setCurrency: (code: string) => void;
  formatAmount: (cents: number) => string;
}

export function useCurrency(): UseCurrencyReturn {
  const [currencyCode, setCurrencyCode] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    setCurrencyCode(getCurrencyConfig().currencyCode);

    const handler = () => {
      setCurrencyCode(getCurrencyConfig().currencyCode);
    };
    window.addEventListener("currency-changed", handler);
    return () => window.removeEventListener("currency-changed", handler);
  }, []);

  const setCurrency = useCallback((code: string) => {
    persistConfig({ currencyCode: code });
  }, []);

  const formatAmount = useCallback(
    (cents: number) => formatAmountUtil(cents, currencyCode as SupportedCurrency),
    [currencyCode],
  );

  return { currencyCode, setCurrency, formatAmount };
}
