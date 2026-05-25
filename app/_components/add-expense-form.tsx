'use client';

import { useState } from "react";
import { addExpense as addExpenseAction } from "@/src/server/actions/add-expense";
import { addExpense as addExpenseToStorage } from "@/src/lib/storage";
import { CATEGORY_LABELS } from "@/src/server/types";
import type { Category } from "@/src/server/types";

export default function AddExpenseForm({
  onExpenseAdded,
}: {
  onExpenseAdded?: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErrors(null);
    setQuotaError(null);

    const amount = parseInt(formData.get("amount") as string, 10);
    const date = formData.get("date") as string;
    const category = formData.get("category") as Category;
    const description = formData.get("description") as string;

    const result = await addExpenseAction({ amount, date, category, description });

    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    try {
      addExpenseToStorage(result.data);
    } catch (e) {
      setQuotaError((e as Error).message);
      return;
    }

    const form = document.getElementById("add-expense-form") as HTMLFormElement;
    form?.reset();
    onExpenseAdded?.();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      id="add-expense-form"
      action={handleSubmit}
      className="space-y-4 mb-8 p-4 border border-zinc-200 rounded-lg"
    >
      {quotaError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {quotaError}
        </p>
      )}

      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">
          Amount (cents)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          required
          className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
        />
        {errors?.amount && (
          <p className="text-sm text-red-600 mt-1">{errors.amount[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          max={today}
          required
          className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
        />
        {errors?.date && (
          <p className="text-sm text-red-600 mt-1">{errors.date[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
        >
          <option value="">Select a category</option>
          {CATEGORY_LABELS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors?.category && (
          <p className="text-sm text-red-600 mt-1">{errors.category[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
        />
        {errors?.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description[0]}</p>
        )}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded hover:bg-zinc-800"
      >
        Add Expense
      </button>
    </form>
  );
}
