import type { Expense } from "@/src/server/types";

const STORAGE_KEY = "expenses";

export function getExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Expense[];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
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
