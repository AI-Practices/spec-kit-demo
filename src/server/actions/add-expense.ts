'use server';

import { addExpenseInputSchema } from "@/src/server/schemas/expense";
import type { ActionResult, Expense } from "@/src/server/types";

export async function addExpense(
  input: unknown
): Promise<ActionResult<Expense>> {
  const parsed = addExpenseInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  return {
    success: true,
    data: { ...parsed.data, id: crypto.randomUUID() } as Expense,
  };
}
