'use client';

import { useState, useEffect } from "react";
import { getPersonSummary, deleteTransaction } from "@/src/server/actions/wallet";
import type { PersonSummary as PersonSummaryType } from "@/src/server/types";

function formatAmount(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}

interface PersonSummaryViewProps {
  personId: string;
}

export default function PersonSummaryView({ personId }: PersonSummaryViewProps) {
  const [summary, setSummary] = useState<PersonSummaryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPersonSummary({ personId }).then((result) => {
      if (result.success) setSummary(result.data);
      setLoading(false);
    });
  }, [personId]);

  async function handleDelete(txId: string) {
    const result = await deleteTransaction({ id: txId });
    if (result.success) {
      const refreshed = await getPersonSummary({ personId });
      if (refreshed.success) setSummary(refreshed.data);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-zinc-500 dark:text-zinc-400">Loading summary...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-zinc-500 dark:text-zinc-400">Person not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 border border-zinc-200 rounded-lg dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Total Credited</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatAmount(summary.totalCredited)}</p>
        </div>
        <div className="p-4 border border-zinc-200 rounded-lg dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Total Debited</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatAmount(summary.totalDebited)}</p>
        </div>
        <div className="p-4 border border-zinc-200 rounded-lg dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Balance</p>
          <p className={`text-xl font-bold tabular-nums ${
            summary.balance >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}>
            {formatAmount(summary.balance)}
          </p>
        </div>
      </div>

      <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Transaction History</h3>

      {summary.transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-zinc-500 dark:text-zinc-400">No transactions yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {summary.transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                    tx.type === "credit"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {tx.type === "credit" ? "Credit" : "Debit"}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatAmount(tx.amount)}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {tx.date}
                </span>
                {tx.notes && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                    {tx.notes}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(tx.id)}
                className="px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:text-red-800 hover:bg-red-50 rounded dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
