"use server";

import { revalidatePath } from "next/cache";
import { setBudgetInputSchema, removeBudgetInputSchema } from "./budget-schema";
import type { Budget, ActionResult } from "@/src/server/types";
import { crypto } from "node:crypto";

interface StorageModule {
  setBudget: (budget: Budget) => Budget;
  removeBudget: (category: string, month: string) => void;
  getExpenses: () => Expense[];
}

interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
}

export async function setBudgetAction(
  prev: unknown,
  formData: FormData,
): Promise<ActionResult<Budget>> {
  const raw = {
    category: formData.get("category"),
    amount: formData.get("amount") ? Number(formData.get("amount")) : undefined,
    month: formData.get("month"),
  };

  const parsed = setBudgetInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: Object.fromEntries(
        parsed.error.errors.map((e) => [e.path.join("."), e.message]),
      ),
    };
  }

  const { default: storage } = await import("./budget-storage");
  const now = new Date().toISOString();

  const budget: Budget = {
    id: crypto.randomUUID(),
    category: parsed.data.category,
    amount: parsed.data.amount,
    month: parsed.data.month,
    createdAt: now,
    updatedAt: now,
  };

  storage.setBudget(budget);
  revalidatePath("/");
  revalidatePath("/budgets");
  return { success: true, data: budget };
}

export async function removeBudgetAction(
  prev: unknown,
  formData: FormData,
): Promise<ActionResult<null>> {
  const raw = {
    category: formData.get("category"),
    month: formData.get("month"),
  };

  const parsed = removeBudgetInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: Object.fromEntries(
        parsed.error.errors.map((e) => [e.path.join("."), e.message]),
      ),
    };
  }

  const { default: storage } = await import("./budget-storage");
  storage.removeBudget(parsed.data.category, parsed.data.month);
  revalidatePath("/");
  revalidatePath("/budgets");
  return { success: true, data: null };
}

export function computeBudgetSummaries(
  budgets: Budget[],
  expenses: Expense[],
  month: string,
): Array<{
  category: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "safe" | "warning" | "overspent";
}> {
  const monthExpenses = expenses.filter((e) => e.date.startsWith(month));

  return budgets
    .filter((b) => b.month === month)
    .map((budget) => {
      const spent = monthExpenses
        .filter((e) => e.category === budget.category)
        .reduce((sum, e) => sum + e.amount, 0);

      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const status =
        percentage >= 100 ? "overspent" : percentage >= 80 ? "warning" : "safe";

      return {
        category: budget.category,
        budgetAmount: budget.amount,
        spent,
        remaining,
        percentage,
        status,
      };
    });
}
