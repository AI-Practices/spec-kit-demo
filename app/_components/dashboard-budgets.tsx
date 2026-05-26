'use client';

import { useState, useEffect, useSyncExternalStore } from "react";
import { getExpenses } from "@/src/server/actions/get-expenses";
import { getBudgets, subscribe as subscribeBudgets } from "@/src/lib/budget-storage";
import type { LegacyBudget, Expense } from "@/src/server/types";
import Link from "next/link";
import BudgetProgressBar from "@/app/_components/budget-progress-bar";
import { useCurrency } from "@/lib/use-currency";

const serverSnapshotBudgets: LegacyBudget[] = [];

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function computeSummaries(budgets: LegacyBudget[], expenses: Expense[], month: string) {
  const monthExpenses = expenses.filter((e) => e.date.startsWith(month));
  return budgets
    .filter((b) => b.month === month)
    .map((budget) => {
      const spent = monthExpenses
        .filter((e) => e.category === budget.category)
        .reduce((sum, e) => sum + e.amount, 0);
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const status = percentage >= 100 ? "overspent" : percentage >= 80 ? "warning" : "safe";
      return {
        category: budget.category,
        budgetAmount: budget.amount,
        spent,
        remaining,
        percentage,
        status: status as "safe" | "warning" | "overspent",
      };
    });
}

export default function DashboardBudgets() {
  const { formatAmount } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    getExpenses().then((result) => {
      if (result.success) setExpenses(result.data);
    });
  }, []);

  const allBudgets = useSyncExternalStore(
    subscribeBudgets,
    () => getBudgets(),
    () => serverSnapshotBudgets,
  );

  const month = getCurrentMonth();
  const summaries = computeSummaries(allBudgets, expenses, month);

  if (summaries.length === 0) {
    return (
      <div className="p-4 border border-border rounded-lg bg-surface shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No budgets set for this month.{" "}
          <Link href="/budgets" className="text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors">
            Set a budget
          </Link>{" "}
          to track your spending.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Budget Progress
      </h2>
      <div className="space-y-3">
        {summaries.map((s) => (
          <div
            key={s.category}
            className="p-3 border border-border rounded-lg bg-surface shadow-sm dark:bg-zinc-800 dark:border-zinc-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {s.category}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatAmount(s.spent)} / {formatAmount(s.budgetAmount)}
              </span>
            </div>
            <BudgetProgressBar percentage={s.percentage} status={s.status} />
            {s.status === "overspent" && (
              <p className="text-xs text-[var(--budget-overspent)] mt-1 font-medium">
                Overspent by {formatAmount(Math.abs(s.remaining))}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
