'use server';

import { prisma } from "@/src/server/db";
import { createCreditSchema, createDebitSchema, monthlyCreditsSchema } from "@/src/server/schemas/wallet";
import type { ActionResult, WalletTransaction } from "@/src/server/types";
import { revalidatePath } from "next/cache";

const DEFAULT_USER_EMAIL = "admin@local.dev";

async function ensureUser(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: {
      email: DEFAULT_USER_EMAIL,
      name: "Default User",
    },
  });
  return user.id;
}

function serializeTx(tx: {
  id: string; userId: string; personId: string;
  type: string; amount: number; date: Date;
  notes: string | null; createdAt: Date;
}): WalletTransaction {
  return {
    id: tx.id,
    userId: tx.userId,
    personId: tx.personId,
    type: tx.type as "credit" | "debit",
    amount: tx.amount,
    date: tx.date.toISOString().slice(0, 10),
    notes: tx.notes,
    createdAt: tx.createdAt.toISOString(),
  };
}

export async function createCredit(
  input: unknown
): Promise<ActionResult<WalletTransaction>> {
  const parsed = createCreditSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  try {
    const userId = await ensureUser();
    const person = await prisma.person.findUnique({
      where: { id: parsed.data.personId, userId },
    });
    if (!person) {
      return { success: false, errors: { _form: ["Person not found"] } };
    }
    const tx = await prisma.walletTransaction.create({
      data: {
        userId,
        personId: parsed.data.personId,
        type: "credit",
        amount: parsed.data.amount,
        date: new Date(parsed.data.date),
        notes: parsed.data.notes ?? null,
      },
    });
    revalidatePath(`/persons/${parsed.data.personId}`);
    revalidatePath("/persons");
    return { success: true, data: serializeTx(tx) };
  } catch (err) {
    return {
      success: false,
      errors: { _form: [err instanceof Error ? err.message : "Failed to create credit"] },
    };
  }
}

export async function createDebit(
  input: unknown
): Promise<ActionResult<WalletTransaction>> {
  const parsed = createDebitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  try {
    const userId = await ensureUser();
    const person = await prisma.person.findUnique({
      where: { id: parsed.data.personId, userId },
    });
    if (!person) {
      return { success: false, errors: { _form: ["Person not found"] } };
    }
    const tx = await prisma.walletTransaction.create({
      data: {
        userId,
        personId: parsed.data.personId,
        type: "debit",
        amount: parsed.data.amount,
        date: new Date(parsed.data.date),
        notes: parsed.data.notes,
      },
    });
    revalidatePath(`/persons/${parsed.data.personId}`);
    revalidatePath(`/persons/${parsed.data.personId}/debits`);
    revalidatePath("/persons");
    return { success: true, data: serializeTx(tx) };
  } catch (err) {
    return {
      success: false,
      errors: { _form: [err instanceof Error ? err.message : "Failed to create debit"] },
    };
  }
}

export async function getMonthlyCredits(
  input: unknown
): Promise<ActionResult<{ entries: Record<string, number>; total: number }>> {
  const parsed = monthlyCreditsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  try {
    const userId = await ensureUser();
    const { personId, year, month } = parsed.data;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    const transactions = await prisma.walletTransaction.findMany({
      where: {
        personId,
        userId,
        type: "credit",
        date: { gte: start, lte: end },
      },
    });
    const entries: Record<string, number> = {};
    let total = 0;
    for (const tx of transactions) {
      const dateKey = tx.date.toISOString().slice(0, 10);
      entries[dateKey] = (entries[dateKey] ?? 0) + tx.amount;
      total += tx.amount;
    }
    return { success: true, data: { entries, total } };
  } catch (err) {
    return {
      success: false,
      errors: { _form: [err instanceof Error ? err.message : "Failed to fetch monthly credits"] },
    };
  }
}
