# Interface Contracts: Server Actions

## Extended Existing Actions

### `exportTransactions(personId, month, year) → Promise<Blob>`

**Changes**: After generating the ledger sheet via `createMonthlyLedger()`, call `buildSummarySection(ws, ledger, previousMonthSummary)` to append the 5 summary rows with formulas.

**New query**: Before building, query the previous month's `MonthlySummary` record to get `balanceForNextMonth` → used as `lastMonthRemaining`.

**Contract**:
```typescript
async function exportTransactions(
  personId: string,
  month: number,
  year: number
): Promise<Blob>
```

### `importTransactions(formData: FormData) → ActionResult<ImportResult>`

**Changes**: After `parseWorkbook()` and `ledgerToTransactions()`, call `parseSummaryRows(ws)` to extract the 5 summary row values. Include summary data in the preview response. On confirmed import, upsert the `MonthlySummary` record.

**Contract**:
```typescript
async function importTransactions(
  formData: FormData
): Promise<ActionResult<ImportResult>>
```

**Extended `ImportResult`**:
```typescript
interface ImportResult {
  imported: number;
  replaced: boolean;
  replacedMonth: string | null;
  summary: {
    monthlySavings: number;
    lastMonthRemaining: number;
    giveBackForExpenses: number;
    loanAmount: number;
    balanceForNextMonth: number;
  } | null;
}
```

### `downloadTemplate(month?, year?) → ActionResult<{data: string, filename: string}>`

**Changes**: Append 5 empty summary rows with formulas at the bottom of the template sheet.

**Contract**: No signature change.

## New Helper Modules

### `lib/excel-utils.ts` — New Exports

```typescript
/**
 * Appends summary rows below the last data row in the worksheet.
 * Rows: Monthly Savings, Last Month Remaining, Give Back for Daily Expenses,
 *       Loan Amount, Balance for Next Month.
 * Uses Excel formulas (f property) for auto-calculation.
 * Requires number format (z) for currency display.
 */
function buildSummarySection(
  ws: XLSX.WorkSheet,
  totalCredits: number,
  totalDebits: number,
  lastMonthRemaining: number,
  lastDataRow: number
): void

/**
 * Extracts summary row values from a parsed worksheet.
 * Reads the computed value (v property) from each summary cell.
 * Returns null if no summary section is found.
 */
function parseSummaryRows(
  ws: XLSX.WorkSheet
): {
  monthlySavings: number;
  lastMonthRemaining: number;
  giveBackForExpenses: number;
  loanAmount: number;
  balanceForNextMonth: number;
} | null

/**
 * Builds the formula string for Monthly Savings row.
 * References the credit and debit rows above.
 */
function buildMonthlySavingsFormula(
  creditRows: number[],
  debitRows: number[],
  totalCol: number
): string

/**
 * Builds the formula string for Give Back for Daily Expenses.
 * References total debit amounts.
 */
function buildGiveBackFormula(
  debitRows: number[],
  totalCol: number
): string
```
