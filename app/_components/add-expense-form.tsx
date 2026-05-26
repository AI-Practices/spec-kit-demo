'use client';

import { useState } from "react";
import { addExpense as addExpenseAction } from "@/src/server/actions/add-expense";
import { CATEGORY_LABELS } from "@/src/server/types";
import type { Category } from "@/src/server/types";

export default function AddExpenseForm({
  onExpenseAdded,
}: {
  onExpenseAdded?: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  async function handleSubmit(formData: FormData) {
    setErrors(null);

    const result = await addExpenseAction({
      amount: parseInt(formData.get("amount") as string, 10) * 100,
      date: formData.get("date") as string,
      category: formData.get("category") as Category,
      description: formData.get("description") as string,
    });

    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    setAmount("");
    setDate("");
    setCategory("");
    setDescription("");
    onExpenseAdded?.();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      id="add-expense-form"
      action={handleSubmit}
      className="space-y-4 mb-8 p-4 border border-border rounded-lg bg-surface shadow-sm dark:bg-zinc-800 dark:border-zinc-700"
    >
      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1 dark:text-zinc-300">
          Amount (₹)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent dark:bg-zinc-800 dark:border-zinc-600"
        />
        {errors?.amount && (
          <p className="text-sm text-negative mt-1 dark:text-negative">{errors.amount[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1 dark:text-zinc-300">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          max={today}
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent dark:bg-zinc-800 dark:border-zinc-600"
        />
        {errors?.date && (
          <p className="text-sm text-negative mt-1 dark:text-negative">{errors.date[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1 dark:text-zinc-300">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent dark:bg-zinc-800 dark:border-zinc-600"
        >
          <option value="">Select a category</option>
          {CATEGORY_LABELS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors?.category && (
          <p className="text-sm text-negative mt-1 dark:text-negative">{errors.category[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1 dark:text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent dark:bg-zinc-800 dark:border-zinc-600"
        />
        {errors?.description && (
          <p className="text-sm text-negative mt-1 dark:text-negative">{errors.description[0]}</p>
        )}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-accent text-white text-sm font-medium rounded transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent dark:bg-accent dark:text-white dark:hover:bg-accent-hover"
      >
        Add Expense
      </button>
    </form>
  );
}
