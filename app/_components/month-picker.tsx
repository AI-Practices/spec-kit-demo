'use client';

import { useCallback } from "react";

function formatMonth(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function MonthPicker({
  year,
  month,
  onChange,
}: {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}) {
  const prev = useCallback(() => {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  }, [year, month, onChange]);

  const next = useCallback(() => {
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  }, [year, month, onChange]);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={prev}
        className="px-3 py-1 text-sm font-medium border border-zinc-300 rounded transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-accent dark:border-zinc-600 dark:hover:bg-zinc-700"
        aria-label="Previous month"
      >
        &larr;
      </button>
      <span className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 min-w-[180px] text-center">
        {formatMonth(year, month)}
      </span>
      <button
        type="button"
        onClick={next}
        className="px-3 py-1 text-sm font-medium border border-zinc-300 rounded transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-accent dark:border-zinc-600 dark:hover:bg-zinc-700"
        aria-label="Next month"
      >
        &rarr;
      </button>
    </div>
  );
}
