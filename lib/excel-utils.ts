export interface FlatLedger {
  sheetName: string;
  month: number;
  year: number;
  entries: FlatLedgerEntry[];
}

export interface FlatLedgerEntry {
  type: "credit" | "debit";
  amount: number;
  rawFormula: string | null;
  cellRef: string;
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
  const inner = match[1];
  if (!inner) return [];
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
  ws[debitCellRef] = { t: "s", v: "=SUM(-5000-3000)" };

  ws["!cols"] = [{ wch: 20 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
