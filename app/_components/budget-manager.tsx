'use client';

import { useState, useEffect, useSyncExternalStore } from "react";
import { getExpenses } from "@/src/server/actions/get-expenses";
import { setBudget as setBudgetAction } from "@/src/server/actions/set-budget";
import { removeBudget as removeBudgetAction } from "@/src/server/actions/remove-budget";
import { getBudgets, setBudget as saveBudget, removeBudget as removeBudgetFromStorage, subscribe } from "@/src/lib/budget-storage";
import { CATEGORY_LABELS } from "@/src/server/types";
import type { LegacyBudget, Expense } from "@/src/server/types";
import MonthPicker from "@/app/_components/month-picker";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const serverSnapshotBudgets: LegacyBudget[] = [];

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
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    getExpenses().then((result) => {
      if (result.success) setExpenses(result.data);
    });
  }, []);

  const allBudgets = useSyncExternalStore(
    subscribe,
    () => getBudgets(),
    () => serverSnapshotBudgets,
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

  async function handleEditBudget(budget: LegacyBudget) {
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

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthStr));

  const summaries = CATEGORY_LABELS.map((cat) => {
    const budget = monthBudgets.find((b) => b.category === cat);
    const spent = monthExpenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    if (!budget) {
      return { category: cat, budgetAmount: null, spent, remaining: null, percentage: null, status: "none" as const };
    }
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const status = percentage >= 100 ? "overspent" : percentage >= 80 ? "warning" : "safe";
    return { category: cat, budgetAmount: budget.amount, spent, remaining, percentage, status };
  });

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
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-800 dark:border-zinc-600 dark:focus:ring-zinc-500"
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
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-800 dark:border-zinc-600 dark:focus:ring-zinc-500"
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
          className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-500"
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
              className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
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
                  className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveBudget(budget.category)}
                  className="text-xs font-medium text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-800 mb-4 dark:text-zinc-200">
          Monthly Overview
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-2 pr-4 font-medium text-zinc-500 dark:text-zinc-400">Category</th>
                <th className="text-right py-2 px-2 font-medium text-zinc-500 dark:text-zinc-400">Budget</th>
                <th className="text-right py-2 px-2 font-medium text-zinc-500 dark:text-zinc-400">Spent</th>
                <th className="text-right py-2 px-2 font-medium text-zinc-500 dark:text-zinc-400">Remaining</th>
                <th className="text-right py-2 pl-2 font-medium text-zinc-500 dark:text-zinc-400">Used</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.category} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 pr-4 text-zinc-900 dark:text-zinc-100">{s.category}</td>
                  <td className="text-right py-3 px-2 text-zinc-700 dark:text-zinc-300">
                    {s.budgetAmount !== null ? formatAmount(s.budgetAmount) : "Not set"}
                  </td>
                  <td className="text-right py-3 px-2 text-zinc-700 dark:text-zinc-300">{formatAmount(s.spent)}</td>
                  <td className={`text-right py-3 px-2 ${s.remaining !== null && s.remaining < 0 ? "text-[var(--budget-overspent)] font-medium" : "text-zinc-700 dark:text-zinc-300"}`}>
                    {s.remaining !== null ? formatAmount(s.remaining) : "-"}
                  </td>
                  <td className={`text-right py-3 pl-2 ${s.status === "warning" ? "text-[var(--budget-warning)]" : s.status === "overspent" ? "text-[var(--budget-overspent)]" : "text-zinc-700 dark:text-zinc-300"}`}>
                    {s.percentage !== null ? `${Math.round(s.percentage)}%` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
