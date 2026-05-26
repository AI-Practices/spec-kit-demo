"use client";

import { useState } from "react";
import { exportTransactions } from "@/src/server/actions/export-transactions";

interface ExportButtonProps {
  personId: string;
}

export default function ExportButton({ personId }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  async function handleExport() {
    setLoading(true);
    try {
      const blob = await exportTransactions(personId, month, year);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ledger-${month}-${year}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
        className="border border-zinc-300 rounded px-2 py-1 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            {new Date(2000, m - 1).toLocaleString("default", { month: "short" })}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="w-20 border border-zinc-300 rounded px-2 py-1 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
        min={2000}
        max={2100}
      />
      <button
        onClick={handleExport}
        disabled={loading}
        className="px-3 py-1.5 text-sm font-medium text-white bg-accent rounded transition-colors hover:bg-accent-hover disabled:bg-zinc-300 disabled:cursor-not-allowed dark:disabled:bg-zinc-600"
      >
        {loading ? "Exporting..." : "Export"}
      </button>
    </div>
  );
}
