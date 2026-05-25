'use client';

import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg className="w-16 h-16 mb-4 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
      <h2 className="text-xl font-semibold text-zinc-800 mb-2 dark:text-zinc-200">No expenses yet</h2>
      <p className="text-zinc-500 mb-6 dark:text-zinc-400">
        Start tracking your spending by adding your first expense.
      </p>
      <Link
        href="/expenses"
        className="inline-block px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-500"
      >
        Add Your First Expense
      </Link>
    </div>
  );
}
