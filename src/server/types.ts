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

export interface Person {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type PersonWithBalance = Person & { balance: number };

export interface WalletTransaction {
  id: string;
  userId: string;
  personId: string;
  type: "credit" | "debit";
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: "monthly" | "weekly" | "yearly";
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LegacyBudget {
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
