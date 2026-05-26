"use server";

import { prisma } from "@/src/server/db";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { parseWorkbook, ledgerToTransactions, parseSheetName } from "@/lib/excel-utils";
import type { ActionResult } from "@/src/server/types";
import type { ParsedTransaction, ImportResult, ImportErrors } from "@/lib/excel-utils";

export type ImportPreview = {
  preview: ParsedTransaction[];
  sheetName: string;
  month: number;
  year: number;
  availableSheets: string[];
};

const DEFAULT_USER_EMAIL = "admin@local.dev";

async function ensureUser(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL, name: "Default User" },
  });
  return user.id;
}

export async function importTransactions(
  formData: FormData,
): Promise<ActionResult<ImportResult | ImportPreview | ImportErrors>> {
  const file = formData.get("file") as File | null;
  const personId = formData.get("personId") as string | null;
  const confirmed = formData.get("confirmed") === "true";

  if (!file) {
    return { success: false, errors: { _form: ["No file provided"] } };
  }
  if (!personId) {
    return { success: false, errors: { _form: ["Person ID is required"] } };
  }
  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    return { success: false, errors: { file: ["Only .xlsx and .xls files are supported"] } };
  }

  let buffer: Buffer;
  try {
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
  } catch {
    return { success: false, errors: { file: ["Failed to read file"] } };
  }

  const selectedSheet = formData.get("sheetName") as string | null;

  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buffer, { type: "buffer" });
  } catch {
    return { success: false, errors: { file: ["Failed to read Excel file. The file may be corrupted."] } };
  }

  const availableSheets = wb.SheetNames.filter((name) => parseSheetName(name) !== null);
  if (availableSheets.length === 0) {
    return {
      success: false,
      errors: { file: ["No sheets with valid Month-Year names found in the file"] },
    };
  }

  const targetSheet = selectedSheet && availableSheets.includes(selectedSheet) ? selectedSheet : availableSheets[0];

  let preview: ParsedTransaction[];
  let sheetName: string;
  let month: number;
  let year: number;

  try {
    const ledger = parseWorkbook(buffer, targetSheet);
    sheetName = ledger.sheetName;
    month = ledger.month;
    year = ledger.year;
    preview = ledgerToTransactions(ledger, personId);
  } catch (err) {
    return {
      success: false,
      errors: {
        file: [err instanceof Error ? err.message : "Failed to parse Excel file"],
      },
    };
  }

  if (preview.length === 0) {
    return {
      success: false,
      errors: { file: ["No valid transactions found in the file"] },
    };
  }

  if (confirmed) {
    try {
      const userId = await ensureUser();
      const person = await prisma.person.findUnique({ where: { id: personId, userId } });
      if (!person) {
        return { success: false, errors: { _form: ["Person not found"] } };
      }

      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      const { count: deletedCount } = await prisma.walletTransaction.deleteMany({
        where: {
          personId,
          userId,
          date: { gte: startDate, lte: endDate },
        },
      });

      const created = await prisma.walletTransaction.createMany({
        data: preview.map((tx) => ({
          userId,
          personId,
          type: tx.type,
          amount: tx.amount,
          date: new Date(tx.date),
          notes: tx.notes ?? null,
        })),
      });

      revalidatePath(`/persons/${personId}`);
      revalidatePath(`/persons/${personId}/summary`);
      revalidatePath("/persons");

      return {
        success: true,
        data: {
          importedCount: created.count,
          replaced: deletedCount > 0,
          replacedMonth: deletedCount > 0 ? `${sheetName}` : null,
          sheetName,
          warnings: [],
        },
      };
    } catch (err) {
      return {
        success: false,
        errors: { _form: [err instanceof Error ? err.message : "Failed to import transactions"] },
      };
    }
  }

  return {
    success: true,
    data: { preview, sheetName, month, year, availableSheets },
  };
}
