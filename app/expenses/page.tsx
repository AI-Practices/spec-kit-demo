'use client';

import { useState } from "react";
import AddExpenseForm from "@/app/_components/add-expense-form";
import ExpenseList from "@/app/_components/expense-list";

export default function ExpensesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-zinc-100">Expenses</h1>
      <AddExpenseForm onExpenseAdded={() => setRefreshKey((k) => k + 1)} />
      <ExpenseList key={refreshKey} />
    </div>
  );
}
