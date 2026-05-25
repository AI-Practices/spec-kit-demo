'use client';

import BudgetManager from "@/app/_components/budget-manager";

export default function BudgetsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-zinc-100">Budgets</h1>
      <BudgetManager />
    </div>
  );
}
