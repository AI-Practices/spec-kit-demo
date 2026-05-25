export type Category =
  | "Food & Dining"
  | "Transportation"
  | "Housing"
  | "Utilities"
  | "Entertainment"
  | "Shopping"
  | "Health"
  | "Other";

export const CATEGORY_LABELS: Category[] = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Other",
];

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: Category;
  description: string;
}

export interface Budget {
  id: string;
  category: Category;
  amount: number;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };
