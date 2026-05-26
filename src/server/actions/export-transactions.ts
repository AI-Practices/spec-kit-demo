"use server";

import { prisma } from "@/src/server/db";
import { createMonthlyLedger } from "@/lib/excel-utils";
import type { ParsedTransaction } from "@/lib/excel-utils";

const DEFAULT_USER_EMAIL = "admin@local.dev";

async function ensureUser(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL, name: "Default User" },
  });
  return user.id;
}

export async function exportTransactions(
  personId: string,
  month: number,
  year: number,
): Promise<Blob> {
  const userId = await ensureUser();

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const transactions = await prisma.walletTransaction.findMany({
    where: {
      personId,
      userId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  const parsed: ParsedTransaction[] = transactions.map((tx) => {
    const dateStr =
      tx.date instanceof Date
        ? tx.date.toISOString().split("T")[0]
        : String(tx.date).split("T")[0];
    return {
      type: tx.type as "credit" | "debit",
      amount: tx.amount,
      date: dateStr,
      notes: tx.notes,
      cellRef: "",
    };
  });

  const buffer = createMonthlyLedger(parsed, month, year);

  return new Blob([new Uint8Array(buffer)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
