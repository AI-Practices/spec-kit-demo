# Server Action Contracts: Excel Wallet Transactions

## Overview

Server actions follow the existing `ActionResult<T>` pattern from the codebase.

## Actions

### `importTransactions(formData: FormData): ActionResult<ImportResult | ImportErrors>`

**Purpose**: Parse an uploaded Excel file, validate transactions, and bulk-insert on user confirmation.

**Input**:
- `formData`: Must contain:
  - `file`: Excel file (`.xlsx`, `.xls`)
  - `personId`: Target person UUID
  - `sheetName`: Selected sheet name for multi-sheet files
  - `confirmed`: Set to `"true"` on second call after user confirms preview
  - `previewId`: Opaque preview ID from the first parse call

**Behavior**:
1. First call (no `confirmed`): Parse + validate, return preview data (transactions + errors/warnings)
2. Second call (`confirmed=true`): Execute insert (delete existing + bulk create), return `ImportResult`

**Returns**:
- `{ success: true, data: ImportResult }` on successful import
- `{ success: false, errors: { validation: ImportErrors } }` on validation failure
- `{ success: false, errors: { file: string[] } }` on file parse failure

**Errors**:
- Invalid file format
- Missing required fields (personId)
- Validation errors (bad formulas, non-numeric cells, out-of-range days)
- Sheet not found in workbook

---

### `exportTransactions(personId: string, month: number, year: number): Blob`

**Purpose**: Generate an Excel file for a person's transactions in a given month.

**Input**:
- `personId`: Person UUID
- `month`: Month number (1-12)
- `year`: Year (e.g., 2026)

**Behavior**:
- Query all credit and debit transactions for person + month range
- Group credits by description + day into ledger rows
- Group debits by description + date into `=SUM(...)` formula rows
- Generate `.xlsx` buffer matching the ledger format

**Returns**: Excel file as `Blob` with MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Errors**:
- Person not found
- No transactions for the period (returns empty template)

---

### `downloadTemplate(month?: number, year?: number): Blob`

**Purpose**: Generate a blank Excel template for the current (or specified) month.

**Input**:
- `month`: Optional. Defaults to current month.
- `year`: Optional. Defaults to current year.

**Behavior**:
- Create sheet named `<MonthAbbr>-<Year>` (e.g., `May-2026`)
- Row 1: Headers (Description, Day 1-31, Total)
- Row 2: Example credit row (demonstrates daily values)
- Row 3: Example debit formula row (demonstrates `=SUM(...)` format)
- Apply currency symbol to Total header based on user preference

**Returns**: Excel file as `Blob`

---

## Type Definitions

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };

interface ImportResult {
  importedCount: number;
  replaced: boolean;
  replacedMonth: string | null;
  sheetName: string;
  warnings: string[];
}

interface ImportError {
  cellRef: string;
  message: string;
  type: 'error' | 'warning';
}

interface ImportErrors {
  errors: ImportError[];
  totalErrors: number;
}
```
