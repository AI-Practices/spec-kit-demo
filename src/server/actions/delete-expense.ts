'use server';

import { prisma } from "@/src/server/db";
import { deleteExpenseInputSchema } from "@/src/server/schemas/expense";
import type { ActionResult } from "@/src/server/types";
import { revalidatePath } from "next/cache";

const DEFAULT_USER_EMAIL = "admin@local.dev";

async function ensureUser(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL, name: "Default User" },
  });
  return user.id;
}

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
  try {
    const userId = await ensureUser();
    await prisma.expense.deleteMany({
      where: { id: parsed.data.id, userId },
    });
    revalidatePath("/");
    revalidatePath("/expenses");
    return { success: true, data: { id: parsed.data.id } };
  } catch (err) {
    return {
      success: false,
      errors: { _form: [err instanceof Error ? err.message : "Failed to delete expense"] },
    };
  }
}
