export interface MonthlyLedger {
  sheetName: string;
  month: number;
  year: number;
  rows: LedgerRow[];
}

export interface LedgerRow {
  description: string;
  type: "credit" | "debit";
  dailyValues: (number | null)[];
  rawFormula: string | null;
  rowIndex: number;
}

export interface ParsedTransaction {
  type: "credit" | "debit";
  amount: number;
  date: string;
  notes: string | null;
  cellRef: string;
}

export interface ImportResult {
  importedCount: number;
  replaced: boolean;
  replacedMonth: string | null;
  sheetName: string;
  warnings: string[];
}

export interface ImportError {
  cellRef: string;
  message: string;
  type: "error" | "warning";
}

export interface ImportErrors {
  errors: ImportError[];
  totalErrors: number;
}

import * as XLSX from "xlsx";

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const MONTH_ABBR: string[] = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function parseSheetName(name: string): { month: number; year: number } | null {
  const trimmed = name.trim();
  const match = trimmed.match(/^([A-Za-z]+)[-\s](\d{4})$/);
  if (!match) return null;
  const month = MONTH_NAMES[match[1].toLowerCase()];
  if (!month) return null;
  const year = parseInt(match[2], 10);
  if (year < 1900 || year > 2100) return null;
  return { month, year };
}

export function parseDebitFormula(formula: string): number[] {
  const trimmed = formula.trim();
  const match = trimmed.match(/^=?\s*SUM\((.+)\)\s*$/i);
  if (!match) return [];
  const inner = match[1].trim();
  if (!inner) return [];
  if (!inner.startsWith("-")) return [];
  const parts = inner.split("-").filter(Boolean);
  const amounts: number[] = [];
  for (const part of parts) {
    const num = parseFloat(part);
    if (isNaN(num) || num <= 0) return [];
    amounts.push(num);
  }
  return amounts;
}

export function buildMonthSheetName(month: number, year: number): string {
  if (month < 1 || month > 12) return "";
  return `${MONTH_ABBR[month - 1]}-${year}`;
}

const DAY_LABELS = [
  "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th",
  "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th",
  "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th",
  "31st",
];

export function createTemplate(month: number, year: number): Buffer {
  const sheetName = buildMonthSheetName(month, year);

  const rows: (string | number)[][] = [["Day", sheetName]];

  for (const label of DAY_LABELS) {
    rows.push([label, ""]);
  }

  rows.push(["Given Back Amount", ""]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  const debitCellRef = XLSX.utils.encode_cell({ r: rows.length - 1, c: 1 });
  ws[debitCellRef] = { t: "s", v: "=SUM(-500-300)" };

  ws["!cols"] = [{ wch: 20 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function parseWorkbook(fileBuffer: Buffer, sheetName?: string): MonthlyLedger {
  const wb = XLSX.read(fileBuffer, { type: "buffer" });
  const targetSheet = sheetName ?? wb.SheetNames[0];
  if (!wb.SheetNames.includes(targetSheet)) {
    throw new Error(`Sheet "${targetSheet}" not found. Available sheets: ${wb.SheetNames.join(", ")}`);
  }
  const sheet = wb.Sheets[targetSheet];
  const parsed = parseSheetName(targetSheet);
  if (!parsed) throw new Error(`Sheet name "${targetSheet}" does not match Month-Year format`);

  const rows: LedgerRow[] = [];
  const range = sheet["!ref"];
  if (!range) {
    return { sheetName: targetSheet, month: parsed.month, year: parsed.year, rows: [] };
  }
  const ref = XLSX.utils.decode_range(range);

  for (let r = ref.s.r + 1; r <= ref.e.r; r++) {
    const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
    const cellB = sheet[XLSX.utils.encode_cell({ r, c: 1 })];
    const desc = cellA?.v?.toString()?.trim() ?? "";
    const rawVal = cellB?.v;

    if (!desc && (rawVal === undefined || rawVal === null || rawVal === "")) continue;

    const dayMatch = desc.match(/^(\d{1,2})(st|nd|rd|th)$/);
    const formula = rawVal?.toString()?.trim() ?? "";

    if (typeof rawVal === "number" && rawVal > 0) {
      const daily = new Array(31).fill(null) as (number | null)[];
      if (dayMatch) {
        const day = parseInt(dayMatch[1], 10);
        if (day >= 1 && day <= 31) daily[day - 1] = rawVal;
      }
      rows.push({
        description: desc,
        type: "credit",
        dailyValues: daily,
        rawFormula: null,
        rowIndex: r,
      });
    } else if (formula.startsWith("=SUM")) {
      rows.push({
        description: desc,
        type: "debit",
        dailyValues: [],
        rawFormula: formula,
        rowIndex: r,
      });
    }
  }

  return { sheetName: targetSheet, month: parsed.month, year: parsed.year, rows };
}

export function createMonthlyLedger(
  transactions: ParsedTransaction[],
  month: number,
  year: number,
): Buffer {
  const sheetName = buildMonthSheetName(month, year);
  const daysInMonth = new Date(year, month, 0).getDate();

  if (transactions.length === 0) {
    return createTemplate(month, year);
  }

  const credits = transactions.filter((t) => t.type === "credit");
  const debits = transactions.filter((t) => t.type === "debit");

  const creditByDay: Record<number, number> = {};
  for (const c of credits) {
    const day = parseInt(c.date.split("-")[2], 10);
    if (day >= 1 && day <= daysInMonth) {
      creditByDay[day] = (creditByDay[day] || 0) + c.amount;
    }
  }

  const debitByDesc: Record<string, number[]> = {};
  for (const d of debits) {
    const desc = d.notes || "Debit";
    if (!debitByDesc[desc]) debitByDesc[desc] = [];
    debitByDesc[desc].push(d.amount);
  }

  const rows: (string | number)[][] = [];
  rows.push(["Day", sheetName]);

  for (let day = 1; day <= daysInMonth; day++) {
    const label = DAY_LABELS[day - 1];
    const amount = creditByDay[day];
    rows.push([label, amount != null ? amount : ""]);
  }

  for (const [desc, amounts] of Object.entries(debitByDesc)) {
    const formula = `=SUM(${amounts.map((a) => `-${a}`).join("")})`;
    rows.push([desc, formula]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 20 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function validateTransactions(
  transactions: ParsedTransaction[],
  month: number,
  year: number,
  sheetName: string,
): ImportError[] {
  const errors: ImportError[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (const tx of transactions) {
    const dateMatch = tx.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) {
      const txYear = parseInt(dateMatch[1], 10);
      const txMonth = parseInt(dateMatch[2], 10);
      const txDay = parseInt(dateMatch[3], 10);

      if (txYear !== year || txMonth !== month) {
        errors.push({
          cellRef: tx.cellRef,
          message: `Date "${tx.date}" is outside the expected month ${sheetName}`,
          type: "error",
        });
      }

      if (txDay < 1 || txDay > daysInMonth) {
        errors.push({
          cellRef: tx.cellRef,
          message: `Day ${txDay} is out of range for ${sheetName} (month has ${daysInMonth} days)`,
          type: "warning",
        });
      }
    }

    if (tx.type === "credit") {
      if (tx.amount < 0) {
        errors.push({
          cellRef: tx.cellRef,
          message: `Credit amount must be 0 or more, got ${tx.amount}`,
          type: "error",
        });
      }
    }

    if (tx.type === "debit") {
      if (tx.amount <= 0) {
        errors.push({
          cellRef: tx.cellRef,
          message: `Debit amount must be positive, got ${tx.amount}`,
          type: "error",
        });
      }
      if (!tx.notes || tx.notes.trim() === "") {
        errors.push({
          cellRef: tx.cellRef,
          message: "Debit must have a non-empty description/notes",
          type: "error",
        });
      }
    }
  }

  return errors;
}

export function ledgerToTransactions(
  ledger: MonthlyLedger,
  personId: string,
): ParsedTransaction[] {
  void personId;
  const transactions: ParsedTransaction[] = [];
  const monthStr = String(ledger.month).padStart(2, "0");
  const lastDay = new Date(ledger.year, ledger.month, 0).getDate();

  for (const row of ledger.rows) {
    if (row.type === "credit") {
      for (let day = 0; day < 31; day++) {
        const amount = row.dailyValues[day];
        if (amount !== null && amount > 0) {
          const dayStr = String(day + 1).padStart(2, "0");
          transactions.push({
            type: "credit",
            amount: Math.round(amount),
            date: `${ledger.year}-${monthStr}-${dayStr}`,
            notes: row.description || null,
            cellRef: `${ledger.sheetName}!${XLSX.utils.encode_cell({ r: row.rowIndex, c: day + 1 })}`,
          });
        }
      }
    } else if (row.type === "debit") {
      const amounts = parseDebitFormula(row.rawFormula || "");
      const debitDate = `${ledger.year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
      for (const amount of amounts) {
        transactions.push({
          type: "debit",
          amount: Math.round(amount),
          date: debitDate,
          notes: row.description || null,
          cellRef: `${ledger.sheetName}!${XLSX.utils.encode_cell({ r: row.rowIndex, c: 0 })}`,
        });
      }
    }
  }

  return transactions;
}
