'use client';

import { getExpenses } from "@/src/lib/storage";
import type { Expense } from "@/src/server/types";
import EmptyState from "@/app/_components/empty-state";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ExpenseList() {
  const expenses: Expense[] = getExpenses().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (expenses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-900 min-w-[72px]">
              {formatAmount(expense.amount)}
            </span>
            <span className="text-sm text-zinc-500 min-w-[88px]">
              {expense.date}
            </span>
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-700 rounded">
              {expense.category}
            </span>
            <span className="text-sm text-zinc-600 truncate max-w-[240px]">
              {expense.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
