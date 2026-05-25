'use client';

import { useState, useEffect, useSyncExternalStore } from "react";
import { getExpenses } from "@/src/server/actions/get-expenses";
import { getPersons } from "@/src/server/actions/persons";
import { getBudgets, subscribe as subscribeBudgets } from "@/src/lib/budget-storage";
import type { Expense, PersonWithBalance, LegacyBudget } from "@/src/server/types";
import EmptyState from "@/app/_components/empty-state";
import DashboardBudgets from "@/app/_components/dashboard-budgets";

const serverSnapshotBudgets: LegacyBudget[] = [];

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardStats() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [persons, setPersons] = useState<PersonWithBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getExpenses(), getPersons()]).then(([expResult, personResult]) => {
      if (expResult.success) setExpenses(expResult.data);
      if (personResult.success) setPersons(personResult.data);
      setLoading(false);
    });
  }, []);

  const allBudgets = useSyncExternalStore(
    subscribeBudgets,
    () => getBudgets(),
    () => serverSnapshotBudgets,
  );

  const hasBudgetsForMonth = allBudgets.some((b) => b.month === getCurrentMonth());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-zinc-500 dark:text-zinc-400">Loading dashboard...</p>
      </div>
    );
  }

  if (expenses.length === 0 && !hasBudgetsForMonth && persons.length === 0) {
    return <EmptyState />;
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recent = sorted.slice(0, 5);

  const totalWalletBalance = persons.reduce((sum, p) => sum + p.balance, 0);

  return (
    <div className="space-y-6">
      <DashboardBudgets />

      {persons.length > 0 && (
        <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700/50">
          <p className="text-sm text-zinc-500 mb-1 dark:text-zinc-400">Person Wallet</p>
          <div className="flex items-baseline gap-4">
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Persons</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{persons.length}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Total Balance</p>
              <p className={`text-xl font-bold tabular-nums ${
                totalWalletBalance >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formatAmount(totalWalletBalance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {expenses.length > 0 && (
        <>
          <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700/50">
            <p className="text-sm text-zinc-500 mb-1 dark:text-zinc-400">Total Spending</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{formatAmount(total)}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-800 mb-3 dark:text-zinc-200">
              Recent Expenses
            </h2>
            <div className="space-y-2">
              {recent.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg dark:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-900 min-w-[72px] dark:text-zinc-100">
                      {formatAmount(expense.amount)}
                    </span>
                    <span className="text-sm text-zinc-500 min-w-[88px] dark:text-zinc-400">
                      {expense.date}
                    </span>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-700 rounded dark:bg-zinc-700 dark:text-zinc-300">
                      {expense.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
