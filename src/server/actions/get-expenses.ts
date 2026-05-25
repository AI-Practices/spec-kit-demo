'use server';

import { prisma } from "@/src/server/db";
import type { ActionResult, Expense, Category } from "@/src/server/types";

const DEFAULT_USER_EMAIL = "admin@local.dev";

async function ensureUser(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL, name: "Default User" },
  });
  return user.id;
}

export async function getExpenses(): Promise<ActionResult<Expense[]>> {
  try {
    const userId = await ensureUser();
    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
    });
    return {
      success: true,
      data: expenses.map((e) => ({
        id: e.id,
        amount: e.amount,
        date: e.date.toISOString().slice(0, 10),
        category: e.category.name as Category,
        description: e.description,
      })),
    };
  } catch (err) {
    return {
      success: false,
      errors: { _form: [err instanceof Error ? err.message : "Failed to fetch expenses"] },
    };
  }
}
