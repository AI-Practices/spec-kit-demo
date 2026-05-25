'use server';

import { setBudgetInputSchema } from "@/src/server/schemas/budget";
import type { ActionResult, Category, LegacyBudget } from "@/src/server/types";

export async function setBudget(
  input: unknown,
): Promise<ActionResult<LegacyBudget>> {
  const parsed = setBudgetInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const now = new Date().toISOString();

  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      category: parsed.data.category as Category,
      amount: parsed.data.amount,
      month: parsed.data.month,
      createdAt: now,
      updatedAt: now,
    },
  };
}
