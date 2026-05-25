'use server';

import { removeBudgetInputSchema } from "@/src/server/schemas/budget";
import type { ActionResult } from "@/src/server/types";

export async function removeBudget(
  input: unknown,
): Promise<ActionResult<{ category: string; month: string }>> {
  const parsed = removeBudgetInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  return {
    success: true,
    data: { category: parsed.data.category, month: parsed.data.month },
  };
}
