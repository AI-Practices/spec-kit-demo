// Contract: Chart Data Transform
//
// Pure function that derives a ChartDataset from raw Expense[] data.
// Handles the "Others" grouping logic (categories < 5% of total).
//
// Usage:
//   const dataset = buildChartDataset(expenses);
//   if (dataset === null) → render empty state
//   else → pass labels/values/colors/percentages to Doughnut chart

import { Expense } from "@/src/server/types";

export interface ChartSegment {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export interface ChartDataset {
  segments: ChartSegment[];
  total: number;
}

const CATEGORY_COLORS = [
  "#4F46E5", // Indigo
  "#22C55E", // Green
  "#06B6D4", // Cyan
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#14B8A6", // Teal
];

const OTHERS_COLOR = "#9CA3AF"; // Gray for "Others" segment
const THRESHOLD_PERCENTAGE = 5;

export function buildChartDataset(expenses: Expense[]): ChartDataset | null {
  if (expenses.length === 0) return null;

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  if (total === 0) return null;

  // Group by category
  const categoryMap = new Map<string, number>();
  for (const expense of expenses) {
    categoryMap.set(
      expense.category,
      (categoryMap.get(expense.category) ?? 0) + expense.amount,
    );
  }

  const entries = Array.from(categoryMap.entries());
  const major: { label: string; value: number; percentage: number }[] = [];
  let othersSum = 0;

  for (const [label, value] of entries) {
    const percentage = (value / total) * 100;
    if (percentage < THRESHOLD_PERCENTAGE) {
      othersSum += value;
    } else {
      major.push({ label, value, percentage });
    }
  }

  const segments: ChartSegment[] = major.map((m, i) => ({
    label: m.label,
    value: m.value,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    percentage: m.percentage,
  }));

  if (othersSum > 0) {
    const othersPercentage = (othersSum / total) * 100;
    segments.push({
      label: "Others",
      value: othersSum,
      color: OTHERS_COLOR,
      percentage: othersPercentage,
    });
  }

  return { segments, total };
}
