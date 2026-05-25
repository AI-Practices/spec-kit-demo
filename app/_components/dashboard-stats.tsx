'use client';

import { getExpenses } from "@/src/lib/storage";
import EmptyState from "@/app/_components/empty-state";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DashboardStats() {
  const allExpenses = getExpenses();

  if (allExpenses.length === 0) {
    return <EmptyState />;
  }

  const total = allExpenses.reduce((sum, e) => sum + e.amount, 0);

  const sorted = [...allExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recent = sorted.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50">
        <p className="text-sm text-zinc-500 mb-1">Total Spending</p>
        <p className="text-3xl font-bold text-zinc-900">{formatAmount(total)}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-800 mb-3">
          Recent Expenses
        </h2>
        <div className="space-y-2">
          {recent.map((expense) => (
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
