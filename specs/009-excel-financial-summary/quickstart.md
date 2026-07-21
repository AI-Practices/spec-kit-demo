# Quickstart: Excel Financial Summary Section

## Prerequisites

- `xlsx` package already installed (spec #008)
- Prisma client set up with PostgreSQL
- Existing `WalletTransaction` model and data

## Implementation Steps

### 1. Prisma Migration

Add the `MonthlySummary` model to `prisma/schema.prisma` (see `data-model.md`).

```bash
npx prisma migrate dev --name add_monthly_summary
```

The Prisma client auto-regenerates to `src/generated/prisma/`.

### 2. Extend `lib/excel-utils.ts`

Add these new exports:
- `buildSummarySection(ws, totalCredits, totalDebits, lastMonthRemaining, lastDataRow)` — appends 5 summary rows with formulas
- `parseSummaryRows(ws)` — reads summary row values from an imported sheet
- Formula helper functions for Monthly Savings and Give Back

All value cells use `z: '#,##0.00'` for currency format.

### 3. Extend Export Server Action

In `src/server/actions/export-transactions.ts`:
1. Query the previous month's `MonthlySummary` to get `balanceForNextMonth` → `lastMonthRemaining`
2. After `createMonthlyLedger()`, call `buildSummarySection()`
3. Return the enriched buffer

### 4. Extend Import Server Action

In `src/server/actions/import-transactions.ts`:
1. After `parseWorkbook()`, call `parseSummaryRows()` to extract summary values
2. Include summary data in the preview response
3. On confirmed import, upsert `MonthlySummary` record
4. Extend `ImportResult` type to include summary data

### 5. Extend Template Download

In `src/server/actions/download-template.ts`:
1. After `createTemplate()`, call `buildSummarySection()` with zero values
2. Return the enriched template

### 6. Extend Person Delete Cascade

In `src/server/actions/persons.ts`, add `monthlySummary.deleteMany()` to the `deletePerson` transaction.

### 7. Verify Round-Trip

1. Export a month with transactions → verify summary rows appear with correct formulas
2. Open in Excel → verify formulas auto-calculate
3. Re-import the exported file → verify summary values sync to dashboard
4. Edit a value in Excel, re-import → verify updated values sync

## Key Files

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add `MonthlySummary` model |
| `lib/excel-utils.ts` | Add `buildSummarySection`, `parseSummaryRows`, formula helpers |
| `src/server/actions/export-transactions.ts` | Query previous summary + append summary section |
| `src/server/actions/import-transactions.ts` | Parse summary rows + upsert on confirmed import |
| `src/server/actions/download-template.ts` | Include empty summary section |
| `src/server/actions/persons.ts` | Add cascade delete for MonthlySummary |
