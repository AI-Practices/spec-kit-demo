'use client';

export default function BudgetProgressBar({
  percentage,
  status,
}: {
  percentage: number;
  status: "safe" | "warning" | "overspent";
}) {
  const barWidth = Math.min(percentage, 100);

  const colorMap: Record<string, string> = {
    safe: "bg-[var(--budget-safe)]",
    warning: "bg-[var(--budget-warning)]",
    overspent: "bg-[var(--budget-overspent)]",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-zinc-200 rounded-full h-2.5 dark:bg-zinc-700">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${colorMap[status]}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <span className="text-xs font-medium text-zinc-500 min-w-[40px] text-right dark:text-zinc-400">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}
