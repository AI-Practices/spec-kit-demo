import type { LegacyBudget } from "@/src/server/types";

const STORAGE_KEY = "budgets";
const listeners = new Set<() => void>();

let cached: { raw: string | null; data: LegacyBudget[] } | null = null;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBudgets(): LegacyBudget[] {
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
    const data = parsed as LegacyBudget[];
    cached = { raw, data };
    return data;
  } catch {
    cached = { raw: null, data: [] };
    return [];
  }
}

export function saveBudgets(budgets: LegacyBudget[]): void {
  try {
    const raw = JSON.stringify(budgets);
    localStorage.setItem(STORAGE_KEY, raw);
    cached = { raw, data: budgets };
    listeners.forEach((fn) => fn());
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      throw new Error("Storage is full. Please delete some expenses or budgets.");
    }
    throw err;
  }
}

export function setBudget(input: LegacyBudget): LegacyBudget {
  const budgets = getBudgets();
  const idx = budgets.findIndex(
    (b) => b.category === input.category && b.month === input.month,
  );
  if (idx >= 0) {
    budgets[idx] = input;
  } else {
    budgets.push(input);
  }
  saveBudgets(budgets);
  return input;
}

export function removeBudget(category: string, month: string): void {
  const budgets = getBudgets();
  const filtered = budgets.filter(
    (b) => !(b.category === category && b.month === month),
  );
  saveBudgets(filtered);
}
