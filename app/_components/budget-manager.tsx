'use client';

import { useState, useCallback } from "react";
import { useSyncExternalStore } from "react";
import { setBudget as setBudgetAction } from "@/src/server/actions/set-budget";
import { removeBudget as removeBudgetAction } from "@/src/server/actions/remove-budget";
import { getBudgets, setBudget as saveBudget, removeBudget as removeBudgetFromStorage, subscribe } from "@/src/lib/budget-storage";
import { CATEGORY_LABELS } from "@/src/server/types";
import type { Budget } from "@/src/server/types";
import MonthPicker from "@/app/_components/month-picker";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const serverSnapshot: Budget[] = [];

function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function toMonthString(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export default function BudgetManager() {
  const [year, setYear] = useState(() => getCurrentYearMonth().year);
  const [month, setMonth] = useState(() => getCurrentYearMonth().month);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  const allBudgets = useSyncExternalStore(
    subscribe,
    () => getBudgets(),
    () => serverSnapshot,
  );

  const monthStr = toMonthString(year, month);
  const monthBudgets = allBudgets.filter((b) => b.month === monthStr);

  async function handleSetBudget(formData: FormData) {
    setErrors(null);
    const rawCategory = formData.get("category") as string;
    const rawAmount = formData.get("amount") as string;
    const result = await setBudgetAction({
      category: rawCategory,
      amount: parseInt(rawAmount, 10),
      month: monthStr,
    });
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    try {
      saveBudget(result.data);
      setCategory("");
      setAmount("");
    } catch (e) {
      setErrors({ storage: [(e as Error).message] });
    }
  }

  async function handleEditBudget(budget: Budget) {
    setCategory(budget.category);
    setAmount(String(budget.amount));
  }

  async function handleRemoveBudget(budgetCategory: string) {
    setErrors(null);
    const result = await removeBudgetAction({
      category: budgetCategory,
      month: monthStr,
    });
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    removeBudgetFromStorage(budgetCategory, monthStr);
  }

  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Budgets</h2>
        <MonthPicker year={year} month={month} onChange={handleMonthChange} />
      </div>

      <form
        action={handleSetBudget}
        className="p-4 border border-zinc-200 rounded-lg space-y-4 dark:border-zinc-700"
      >
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1 dark:text-zinc-300">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-600"
          >
            <option value="">Select a category</option>
            {CATEGORY_LABELS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors?.category && (
            <p className="text-sm text-red-600 mt-1 dark:text-red-400">{errors.category[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1 dark:text-zinc-300">
            Monthly Budget (cents)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-600"
          />
          {errors?.amount && (
            <p className="text-sm text-red-600 mt-1 dark:text-red-400">{errors.amount[0]}</p>
          )}
        </div>

        {errors?.storage && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded dark:bg-red-900/30 dark:text-red-400">
            {errors.storage[0]}
          </p>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {category && monthBudgets.some((b) => b.category === category) ? "Update Budget" : "Set Budget"}
        </button>
      </form>

      {monthBudgets.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Budgets for {monthStr}
          </h3>
          {monthBudgets.map((budget) => (
            <div
              key={budget.id}
              className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg dark:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-700 rounded dark:bg-zinc-700 dark:text-zinc-300">
                  {budget.category}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatAmount(budget.amount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditBudget(budget)}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveBudget(budget.category)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
