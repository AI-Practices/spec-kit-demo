'use server';

import { prisma } from "@/src/server/db";
import { addExpenseInputSchema } from "@/src/server/schemas/expense";
import type { ActionResult, Expense, Category } from "@/src/server/types";
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
  try {
    const userId = await ensureUser();
    const category = await prisma.category.findUnique({
      where: { userId_name: { userId, name: parsed.data.category } },
    });
    if (!category) {
      return { success: false, errors: { category: ["Invalid category"] } };
    }
    const expense = await prisma.expense.create({
      data: {
        userId,
        categoryId: category.id,
        amount: parsed.data.amount,
        date: new Date(parsed.data.date),
        description: parsed.data.description,
      },
    });
    revalidatePath("/");
    revalidatePath("/expenses");
    return {
      success: true,
      data: {
        id: expense.id,
        amount: expense.amount,
        date: expense.date.toISOString().slice(0, 10),
        category: parsed.data.category as Category,
        description: expense.description,
      },
    };
  } catch (err) {
    return {
      success: false,
      errors: { _form: [err instanceof Error ? err.message : "Failed to add expense"] },
    };
  }
}
