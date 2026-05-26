'use client';

import { useState, useEffect, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { getExpenses } from "@/src/server/actions/get-expenses";
import { getPersons } from "@/src/server/actions/persons";
import { getBudgets, subscribe as subscribeBudgets } from "@/src/lib/budget-storage";
import type { Expense, PersonWithBalance, LegacyBudget } from "@/src/server/types";
import EmptyState from "@/app/_components/empty-state";
import DashboardBudgets from "@/app/_components/dashboard-budgets";
import { useCurrency } from "@/lib/use-currency";
import { buildChartDataset } from "@/lib/chart-data";

const DonutChart = dynamic(
  () => import("@/app/_components/donut-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-8">
        <p className="text-sm text-zinc-400">Loading chart...</p>
      </div>
    ),
  },
);

const serverSnapshotBudgets: LegacyBudget[] = [];

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardStats() {
  const { formatAmount } = useCurrency();
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

  const chartData = buildChartDataset(expenses);

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recent = sorted.slice(0, 5);

  const totalWalletBalance = persons.reduce((sum, p) => sum + p.balance, 0);

  return (
    <div className="space-y-6">
      <DashboardBudgets />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {persons.length > 0 && (
          <div className="p-4 border border-border rounded-lg bg-surface shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
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
                      ? "text-positive"
                      : "text-negative"
                  }`}>
                  {formatAmount(totalWalletBalance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {expenses.length > 0 && (
          <div className="p-4 border border-border rounded-lg bg-surface shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
            <p className="text-sm text-zinc-500 mb-1 dark:text-zinc-400">Total Spending</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{formatAmount(total)}</p>
          </div>
        )}

        {expenses.length > 0 && (
          <div className="p-4 border border-border rounded-lg bg-surface shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
            <p className="text-sm text-zinc-500 mb-3 dark:text-zinc-400">Spending by Category</p>
            {chartData ? (
              <div className="max-w-xs mx-auto">
                <DonutChart data={chartData} formatAmount={formatAmount} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-zinc-400 dark:text-zinc-500">No category data to display</p>
              </div>
            )}
          </div>
        )}
      </div>

      {expenses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 mb-3 dark:text-zinc-200">
            Recent Expenses
          </h2>
          <div className="space-y-2">
            {recent.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface shadow-sm dark:bg-zinc-800 dark:border-zinc-700"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-900 min-w-[72px] dark:text-zinc-100">
                    {formatAmount(expense.amount)}
                  </span>
                  <span className="text-sm text-zinc-500 min-w-[88px] dark:text-zinc-400">
                    {expense.date}
                  </span>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-chart-cyan/10 text-chart-cyan rounded">
                      {expense.category}
                    </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
