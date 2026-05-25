'use client';

import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl mb-4">📋</span>
      <h2 className="text-xl font-semibold text-zinc-800 mb-2">No expenses yet</h2>
      <p className="text-zinc-500 mb-6">
        Start tracking your spending by adding your first expense.
      </p>
      <Link
        href="/expenses"
        className="inline-block px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded hover:bg-zinc-800"
      >
        Add Your First Expense
      </Link>
    </div>
  );
}
