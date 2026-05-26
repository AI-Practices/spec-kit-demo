'use client';

import { useState, useEffect } from "react";
import { createCredit, getMonthlyCredits } from "@/src/server/actions/wallet";
import { useCurrency } from "@/lib/use-currency";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthlyGridProps {
  personId: string;
  personName: string;
}

export default function MonthlyGrid({ personId, personName }: MonthlyGridProps) {
  const { formatAmount } = useCurrency();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMonthlyCredits({ personId, year, month }).then((result) => {
      if (result.success) {
        setEntries(result.data.entries);
        setTotal(result.data.total);
      }
      setLoading(false);
    });
  }, [personId, year, month]);

  function prevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  function dateKey(day: number): string {
    const y = year;
    const m = String(month).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function handleCellClick(day: number) {
    const key = dateKey(day);
    setEditing(key);
    setEditValue("");
  }

  async function handleSave(day: number) {
    const key = dateKey(day);
    const amount = parseInt(editValue, 10);
    if (isNaN(amount) || amount <= 0) {
      setEditing(null);
      return;
    }
    const result = await createCredit({
      personId,
      amount: amount * 100,
      date: key,
    });
    setEditing(null);
    if (result.success) {
      const refreshed = await getMonthlyCredits({ personId, year, month });
      if (refreshed.success) {
        setEntries(refreshed.data.entries);
        setTotal(refreshed.data.total);
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, day: number) {
    if (e.key === "Enter") {
      handleSave(day);
    } else if (e.key === "Escape") {
      setEditing(null);
    }
  }

  const cells: React.ReactNode[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="p-2" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(day);
    const isEditing = editing === key;
    const amount = entries[key];

    cells.push(
      <div
        key={key}
        className="p-2 border border-border rounded min-h-[60px] cursor-pointer hover:bg-accent/5 transition-colors"
        onClick={() => !isEditing && handleCellClick(day)}
      >
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">{day}</div>
        {isEditing ? (
          <input
            type="number"
            min="1"
            step="1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={() => handleSave(day)}
            onKeyDown={(e) => handleKeyDown(e, day)}
            className="w-full text-xs border border-zinc-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-accent dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-sm font-medium text-positive">
            {amount ? formatAmount(amount) : ""}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {personName} &mdash; Monthly Credits
        </h2>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1 text-sm border border-zinc-300 rounded transition-colors hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent dark:border-zinc-600 dark:text-zinc-300"
        >
          &larr; Prev
        </button>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {new Date(year, month - 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={nextMonth}
          className="px-3 py-1 text-sm border border-zinc-300 rounded transition-colors hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent dark:border-zinc-600 dark:text-zinc-300"
        >
          Next &rarr;
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map((name) => (
              <div
                key={name}
                className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 py-1"
              >
                {name}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{cells}</div>
          <div className="mt-4 text-right">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Monthly total:{" "}
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {formatAmount(total)}
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Click a day cell to enter or edit a credit amount (₹). Press Enter or click away to save.
          </p>
        </>
      )}
    </div>
  );
}
