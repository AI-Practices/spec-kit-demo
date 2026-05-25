'use server';

import { deleteExpenseInputSchema } from "@/src/server/schemas/expense";
import type { ActionResult } from "@/src/server/types";

export async function deleteExpense(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = deleteExpenseInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  return {
    success: true,
    data: { id: parsed.data.id },
  };
}
