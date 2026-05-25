import { prisma } from "../server/db";
import { CATEGORY_LABELS } from "../server/types";
import type { Expense } from "../server/types";

const DEFAULT_USER_EMAIL = "admin@local.dev";
const DEFAULT_USER_NAME = "Default User";

export interface MigrationResult {
  totalRecords: number;
  importedRecords: number;
  skippedRecords: number;
  errors: string[];
}

export async function migrateFromLocalStorage(expenses: Expense[]): Promise<MigrationResult> {
  const result: MigrationResult = {
    totalRecords: expenses.length,
    importedRecords: 0,
    skippedRecords: 0,
    errors: [],
  };

  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: {
      email: DEFAULT_USER_EMAIL,
      name: DEFAULT_USER_NAME,
    },
  });

  const existingCategories = await prisma.category.findMany({
    where: { userId: user.id },
  });

  if (existingCategories.length === 0) {
    await prisma.category.createMany({
      data: CATEGORY_LABELS.map((name) => ({
        userId: user.id,
        name,
        type: "expense",
      })),
    });
  }

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
  });

  const categoryMap = new Map(categories.map((c: { name: string; id: string }) => [c.name, c.id]));

  for (const expense of expenses) {
    try {
      const categoryId = categoryMap.get(expense.category);
      if (!categoryId) {
        result.skippedRecords++;
        result.errors.push(`Unknown category "${expense.category}" for expense ${expense.id}`);
        continue;
      }

      await prisma.expense.create({
        data: {
          id: expense.id,
          userId: user.id,
          categoryId,
          amount: expense.amount,
          date: new Date(expense.date),
          description: expense.description,
        },
      });

      result.importedRecords++;
    } catch (err) {
      result.skippedRecords++;
      result.errors.push(`Failed to import expense ${expense.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  await prisma.$disconnect();
  return result;
}
