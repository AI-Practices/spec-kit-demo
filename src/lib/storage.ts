import type { Expense } from "@/src/server/types";

const STORAGE_KEY = "expenses";
const listeners = new Set<() => void>();

let cached: { raw: string | null; data: Expense[] } | null = null;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (cached && cached.raw === raw) return cached.data;
    if (raw === null) {
      cached = { raw: null, data: [] };
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cached = { raw, data: [] };
      return [];
    }
    const data = parsed as Expense[];
    cached = { raw, data };
    return data;
  } catch {
    cached = { raw: null, data: [] };
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    const raw = JSON.stringify(expenses);
    localStorage.setItem(STORAGE_KEY, raw);
    cached = { raw, data: expenses };
    listeners.forEach((fn) => fn());
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      throw new Error("Storage is full. Please delete some expenses.");
    }
    throw err;
  }
}

export function addExpense(input: Expense): Expense {
  const expenses = getExpenses();
  expenses.push(input);
  saveExpenses(expenses);
  return input;
}

export function removeExpense(id: string): void {
  const expenses = getExpenses();
  const filtered = expenses.filter((e) => e.id !== id);
  saveExpenses(filtered);
}
