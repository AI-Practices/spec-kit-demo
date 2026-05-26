'use client';

import { useState } from "react";
import { createDebit } from "@/src/server/actions/wallet";

interface DebitFormProps {
  personId: string;
  personName: string;
}

export default function DebitForm({ personId, personName }: DebitFormProps) {
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);
    setSuccess(false);

    const result = await createDebit({
      personId,
      amount: parseInt(amount, 10),
      date,
      notes,
    });

    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    setAmount("");
    setDate("");
    setNotes("");
    setSuccess(true);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Record Debit for {personName}
      </h2>

      {success && (
        <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded mb-4 dark:bg-emerald-900/30 dark:text-emerald-400">
          Debit recorded successfully.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-zinc-200 rounded-lg dark:border-zinc-700">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1 dark:text-zinc-300">
            Amount (cents)
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={(e) => e.target.select()}
            required
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-800 dark:border-zinc-600 dark:focus:ring-zinc-500"
          />
          {errors?.amount && (
            <p className="text-sm text-red-600 mt-1 dark:text-red-400">{errors.amount[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1 dark:text-zinc-300">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-800 dark:border-zinc-600 dark:focus:ring-zinc-500"
          />
          {errors?.date && (
            <p className="text-sm text-red-600 mt-1 dark:text-red-400">{errors.date[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1 dark:text-zinc-300">
            Notes / Reason
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            rows={3}
            placeholder="Why is this amount being deducted?"
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-800 dark:border-zinc-600 dark:focus:ring-zinc-500"
          />
          {errors?.notes && (
            <p className="text-sm text-red-600 mt-1 dark:text-red-400">{errors.notes[0]}</p>
          )}
          {errors?._form && (
            <p className="text-sm text-red-600 mt-1 dark:text-red-400">{errors._form[0]}</p>
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-500"
        >
          Record Debit
        </button>
      </form>
    </div>
  );
}
