# Research: Excel Financial Summary Section

**Phase 0 output** — resolves technical unknowns from the implementation plan.

## 1. xlsx Formula Writing

**Decision**: Use the `f` property on cell objects to write real Excel formulas, with the computed cached value in `v`.

**Rationale**: SheetJS xlsx supports writing formulas via the `f` property on a `CellObject`. When a cell has `f` set, Excel evaluates the formula when the file is opened. The `v` property stores the cached/computed value that import reads.

**Correct pattern**:
```typescript
ws[cellRef] = {
  t: "n",
  f: "=SUM(B2:B31)",  // formula for Excel to evaluate
  v: 1500              // cached value computed on export (read during import)
};
```

**Key finding**: The existing code in `createTemplate()` and `createMonthlyLedger()` writes formula text as string cells (`{ t: "s", v: "=SUM(-500-300)" }`), which means Excel treats the formula as plain text rather than evaluating it. The summary section should use the correct `{ t: "n", f: "...", v: ... }` pattern.

**Alternatives considered**:
- Writing hard-coded values only (no formulas) — rejected because spec FR-008 requires auto-recalculation on edit
- Using string cells with formula text (current buggy approach) — rejected; Excel won't evaluate

## 2. xlsx Cell Formatting (Bold, Colors, Alignment)

**Decision**: SheetJS Community Edition v0.18.5 does **not** support custom cell styles (bold, fill colors, alignment). These features require the paid Pro version.

**Rationale**: The xlsx Community Edition's `write_sty_xml` function always writes exactly 1 font (Calibri 12pt, non-bold) and 2 fills (none, gray125). The `get_cell_style` function always references `fontId: 0` and `fillId: 0`. Custom font bold, background colors, and cell alignment are Pro-only features.

**What IS supported in Community Edition**:
| Feature | How |
|---------|-----|
| Number formats (currency, decimals) | `cell.z = '₹#,##0.00'` |
| Column widths | `ws['!cols'] = [{ wch: 20 }]` |
| Row heights | `ws['!rows'] = [{ hpt: 20 }]` |

**What is NOT supported** (Pro-only):
- Bold text (FR-009)
- Fill/background colors for highlight (FR-011)
- Left/right alignment (FR-012)

**Options to satisfy formatting requirements**:

| Option | Pros | Cons |
|--------|------|------|
| A. Accept formulas + number formats only | Zero dependency changes; simplest implementation | Spec FR-009/FR-011/FR-012 cannot be satisfied as written |
| B. Switch to `exceljs` | Full formatting support (bold, fills, alignment, fonts, borders); MIT license | Requires replacing `xlsx` usage; different API; potential breaking change with existing code |
| C. Upgrade to SheetJS Pro | Same API — minimal code changes; full formatting support | Paid license; per-developer pricing |

**Recommendation**: Option A for initial implementation (functional formulas + currency format works), with formatting deferred if needed. The formulas auto-calculate and the currency formatting is visible — these are the core functional requirements.

## 3. Per-Month Summary Storage

**Decision**: Create a new `MonthlySummary` Prisma model with `@@unique([personId, month, year])` constraint and upsert semantics.

**Rationale**:
- No existing model stores aggregated monthly data (balance is computed live via `aggregate()`)
- Each person can have one summary per month — composite unique key enforces this
- `loanAmount` is a manually entered summary field only (per spec FR-005), not stored as individual transactions
- `balanceForNextMonth` is the carryover value used as `lastMonthRemaining` for the following month

**Proposed fields**:
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK to User |
| `personId` | String | FK to Person |
| `month` | Int | 1-12 |
| `year` | Int | e.g., 2026 |
| `monthlySavings` | Int | total credits - total debits (can be negative) |
| `lastMonthRemaining` | Int | previous month's balanceForNextMonth |
| `giveBackForExpenses` | Int | sum of all debits (negative) |
| `loanAmount` | Int | manually entered (negative) |
| `balanceForNextMonth` | Int | final net |

**Alternatives considered**:
- No new model; compute all summary values live from transactions — rejected because `lastMonthRemaining` needs persistence and `loanAmount` is manually entered
- Add summary fields to `Person` model — rejected because summaries are per-month, not per-person

## 4. Existing Code Structure

**Decision**: Extend existing modules — no new files at the top level.

**Rationale**:
- `lib/excel-utils.ts` already has `createTemplate()`, `parseWorkbook()`, `createMonthlyLedger()` — add `buildSummarySection()` and `parseSummaryRows()`
- `src/server/actions/export-transactions.ts` — extend to call `buildSummarySection()` and query previous month's summary
- `src/server/actions/import-transactions.ts` — extend to call `parseSummaryRows()` and upsert `MonthlySummary`
- `src/server/actions/download-template.ts` — extend to include empty summary rows

## 5. Summary Sync During Import

**Decision**: Read computed cell values (`v` property, not formula string `f`) from summary rows during import. Use upsert to store/update the `MonthlySummary` record.

**Rationale**: When xlsx reads a file, it populates `v` with the cached computed value. The `f` property contains the formula string but is not needed for import. This aligns with spec FR-013.
