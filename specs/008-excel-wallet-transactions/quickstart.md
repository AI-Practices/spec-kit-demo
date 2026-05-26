# Quickstart: Excel Wallet Transactions

Implementation steps ordered by dependency.

## Step 1: Install Dependency

```bash
npm install xlsx
npm install --save-dev @types/xlsx  # if needed
```

## Step 2: Shared Utilities (`lib/excel-utils.ts`)

Implement:
- `parseSheetName(name: string): { month: number; year: number } | null` — validate and parse `May-2026` format
- `parseDebitFormula(formula: string): number[]` — parse `=SUM(-4100-900-1020)` → `[4100, 900, 1020]`
- `buildMonthSheetName(month: number, year: number): string` — generate `May-2026` from numbers
- `createMonthlyLedger(transactions: WalletTransaction[], month: number, year: number): Workbook` — build Excel from DB data
- `createTemplate(month: number, year: number): Workbook` — build empty template with headers + example rows

## Step 3: Server Actions

### `src/server/actions/download-template.ts`
- Accept optional month/year, default to current
- Generate blank workbook via `createTemplate`
- Return as `Blob`

### `src/server/actions/import-transactions.ts`
- Parse uploaded `FormData` for file, personId, sheetName, confirmed flag
- First call: read workbook, iterate rows, classify as credit/debit, validate each cell, return preview
- Second call: `prisma.$transaction([deleteMany for month, createMany for new])`
- Use existing Zod schemas for individual transaction validation
- Handle multi-sheet by showing dropdown (store preview state)

### `src/server/actions/export-transactions.ts`
- Query `WalletTransaction` by personId + date range (month start/end)
- Separate credits and debits
- Group credits by description + day column
- Group debits by description + date → `=SUM(...)` formula
- Generate workbook via `createMonthlyLedger`
- Return as `Blob`

## Step 4: UI Components

### `app/_components/import-transactions.tsx`
- `'use client'`
- File upload area accepting `.xlsx`/`.xls`
- Preview modal with parsed transaction list
- Error/warning display
- Sheet selector (multi-sheet support)
- Confirm/cancel buttons

### `app/_components/export-button.tsx`
- `'use client'`
- Month picker + export trigger
- Loading state during generation

### `app/_components/template-download.tsx`
- `'use client'`
- Single click-to-download button

## Step 5: Integration

- Add Import button to person summary page (`/persons/[id]/summary/page.tsx`)
- Add Export button to person summary page
- Add Template Download button to persons list page (`/persons/page.tsx`) or person nav
- Wire `onImportComplete` to trigger re-fetch of balance/transactions/charts

## Step 6: Verify

- Download template — opens in Excel with correct headers
- Upload completed template — preview shows correct transactions
- Confirm import — data appears in database, UI refreshes
- Re-upload same month — data replaced, no duplicates
- Upload with errors — clear error display, no partial import
- Export — downloads matching template format
- Export → re-import — round-trip fidelity
