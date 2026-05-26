'use client';

import { useState, useEffect } from "react";
import { getExpenses } from "@/src/server/actions/get-expenses";
import { deleteExpense as deleteExpenseAction } from "@/src/server/actions/delete-expense";
import type { Expense } from "@/src/server/types";
import EmptyState from "@/app/_components/empty-state";
import { useCurrency } from "@/lib/use-currency";

export default function ExpenseList() {
  const { formatAmount } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExpenses().then((result) => {
      if (result.success) {
        const sorted = [...result.data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setExpenses(sorted);
      }
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    const result = await deleteExpenseAction({ id });
    if (result.success) {
      const refreshed = await getExpenses();
      if (refreshed.success) {
        const sorted = [...refreshed.data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setExpenses(sorted);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-zinc-500 dark:text-zinc-400">Loading expenses...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
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
            <span className="text-sm text-zinc-600 truncate max-w-[240px] dark:text-zinc-400">
              {expense.description}
            </span>
          </div>
          <button
            onClick={() => handleDelete(expense.id)}
            className="px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:text-red-800 hover:bg-red-50 rounded dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
