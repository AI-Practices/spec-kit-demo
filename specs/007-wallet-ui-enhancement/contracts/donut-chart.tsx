// Contract: DonutChart Component
//
// Client component that renders a donut chart from expense data.
// Categories below 5% of total are grouped into "Others".
// Shows tooltip on hover with label, amount (formatted), and percentage.
// Shows empty state when no expense data.
//
// Usage:
//   <DonutChart expenses={expenses} />
//
// Props:
//   expenses: Expense[] — raw expense data to derive chart segments from

import { Expense } from "@/src/server/types";

export interface DonutChartProps {
  expenses: Expense[];
}
