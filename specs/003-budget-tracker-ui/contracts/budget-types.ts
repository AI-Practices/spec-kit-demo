import type { Category } from "@/src/server/types";

export interface Budget {
  id: string;
  category: Category;
  amount: number;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  category: Category;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "safe" | "warning" | "overspent";
}

export type BudgetAction =
  | { type: "set"; category: Category; amount: number; month: string }
  | { type: "remove"; category: Category; month: string };
