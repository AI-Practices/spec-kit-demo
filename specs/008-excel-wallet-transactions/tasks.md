---

description: "Task list for Excel Wallet Transactions feature implementation"

---

# Tasks: Excel Wallet Transactions

**Input**: Design documents from `/specs/008-excel-wallet-transactions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test framework is configured. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router (`app/`, `src/`) at repository root
- Server actions in `src/server/actions/`
- Client components in `app/_components/`
- Shared libs in `lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and initialize project structure

- [x] T001 Install `xlsx` dependency via `npm install xlsx`
- [x] T002 [P] Create `lib/excel-utils.ts` placeholder (function signatures and types only, no implementation)

**Checkpoint**: Dependencies and file structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared Excel utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement `parseSheetName(name: string): { month: number; year: number } | null` in `lib/excel-utils.ts` — validates `May-2026` format, returns month number (1-12) and year
- [x] T004 [P] Implement `parseDebitFormula(formula: string): number[]` in `lib/excel-utils.ts` — parses `=SUM(-4100-900-1020)` → `[4100, 900, 1020]`; returns empty array for invalid patterns
- [x] T005 [P] Implement `buildMonthSheetName(month: number, year: number): string` in `lib/excel-utils.ts` — converts numeric month/year to `May-2026` format
- [x] T006 Export all utility types (`MonthlyLedger`, `LedgerRow`, `ParsedTransaction`, `ImportResult`, `ImportError`) from `lib/excel-utils.ts` per data-model.md

**Checkpoint**: `lib/excel-utils.ts` provides parse, validate, and format functions that all stories consume

---

## Phase 3: User Story 1 - Download Monthly Ledger Template (Priority: P1) 🎯 MVP

**Goal**: Users can download an `.xlsx` template with the correct monthly ledger headers, example credit rows, and example debit formula rows.

**Independent Test**: Click "Download Template", open the downloaded file in Excel/Sheets, verify sheet name matches current month, headers are correct (Description, Day 1-31, Total), and example rows are present.

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement `createTemplate(month: number, year: number): Buffer` in `lib/excel-utils.ts` — generates workbook with sheet named per `buildMonthSheetName`, headers in row 1, one example credit row and one example debit formula row
- [x] T008 [US1] Implement `download-template.ts` server action at `src/server/actions/download-template.ts` — accepts optional month/year, defaults to current month, returns Excel file as `Blob`
- [x] T009 [US1] Implement `template-download.tsx` component at `app/_components/template-download.tsx` — `'use client'` button that calls downloadTemplate and triggers file download
- [x] T010 [US1] Wire Template Download button into person pages — add `<TemplateDownload />` to `app/persons/page.tsx` and `app/persons/[id]/summary/page.tsx`

**Checkpoint**: Template downloads correctly, opens in Excel/Sheets, matches the required ledger format

---

## Phase 4: User Story 2 - Import with Preview and Validation (Priority: P1)

**Goal**: Users upload a completed Excel ledger, see a preview of all parsed transactions, and confirm the import. Successfully imported data replaces any existing data for that month and triggers UI refresh.

**Independent Test**: Upload a valid Excel file, verify preview modal shows correct credits and debits with dates and amounts, click Import, verify transactions appear in database and transaction history.

### Implementation for User Story 2

- [x] T011 [P] [US2] Implement `parseWorkbook(fileBuffer: Buffer): MonthlyLedger` in `lib/excel-utils.ts` — reads `.xlsx` buffer, iterates rows, classifies as credit (daily values) or debit (`=SUM` formula), returns `MonthlyLedger` with validated `LedgerRow[]`
- [x] T012 [P] [US2] Implement `ledgerToTransactions(ledger: MonthlyLedger, personId: string): ParsedTransaction[]` in `lib/excel-utils.ts` — converts credit row cells (one per non-empty day cell) and debit formula amounts (one per parsed value) into `ParsedTransaction` array with dates, amounts (converted to cents), descriptions
- [x] T013 [US2] Implement `import-transactions.ts` server action at `src/server/actions/import-transactions.ts` — two-phase: first call parses/validates and returns preview; second call (with `confirmed=true`) executes `prisma.$transaction([deleteMany for person+month, createMany for new transactions])`
- [x] T014 [US2] Implement `import-transactions.tsx` component at `app/_components/import-transactions.tsx` — `'use client'` with file upload area (drag-and-drop + click, `.xlsx`/`.xls` only), preview modal showing parsed transactions grouped by type with amounts/dates/descriptions, confirm and cancel buttons, loading states
- [x] T015 [US2] Add sheet selector dropdown to `import-transactions.tsx` — when parsed workbook has multiple sheets, show dropdown listing all month-named sheets for user selection before preview
- [x] T016 [US2] Wire Import button into person summary page — add `<ImportTransactions personId={person.id} onImportComplete={refresh} />` to `app/persons/[id]/summary/page.tsx`
- [x] T017 [US2] Implement refresh on import success — call `revalidatePath()` in the import server action for `/persons/[id]`, `/persons/[id]/summary`, and `/` routes; trigger parent component re-fetch via `onImportComplete` callback

**Checkpoint**: Full import flow works end-to-end — upload, parse, preview, confirm, data stored, UI refreshes

---

## Phase 5: User Story 3 - Import with Validation Errors (Priority: P2)

**Goal**: Users see clear, structured error messages when uploading invalid files (bad formulas, non-numeric cells, missing sheets, out-of-range days). All errors block import until fixed.

**Independent Test**: Upload files with various errors (bad formula `=SUM(-abc)`, text in credit cell, missing month sheet) and confirm each produces a specific error message identifying the cell location and issue.

### Implementation for User Story 3

- [x] T018 [US3] Implement `validateTransactions(transactions: ParsedTransaction[]): ImportError[]` in `lib/excel-utils.ts` — validates each transaction against `createCreditSchema`/`createDebitSchema` rules (positive amounts, non-empty debit notes, valid dates within month) and returns structured errors with `cellRef` and `message`
- [x] T019 [US3] Enhance `import-transactions.ts` server action to return structured `ImportErrors` on validation failure — errors grouped by type (formula, cell value, missing sheet, date mismatch) with cell references
- [x] T020 [US3] Enhance `import-transactions.tsx` preview modal to display errors inline — error list grouped by category, each showing `cellRef` and human-readable message, with "Import" disabled when errors exist
- [x] T021 [US3] Add out-of-range day warning display to `import-transactions.tsx` — when parsed file has day values in non-existent days (e.g., Day 31 in April), show warning count in preview but allow import to proceed (skip warned cells)
- [x] T022 [US3] Handle edge case: formula with only zeros or positive numbers — validate as errors (debits must be negative/non-zero), show cell-level error message
- [x] T023 [US3] Handle edge case: missing month sheet or unrecognized sheet name format — validate during parse step, return early error listing expected vs found sheets
- [x] T024 [US3] Handle edge case: corrupted `.xlsx` or non-Excel file — catch `xlsx` parse error, return user-friendly error message in preview

**Checkpoint**: All validation error types produce clear cell-level messages; out-of-range days produce warnings but allow import; corrupted files handled gracefully

---

## Phase 6: User Story 4 - Export Transactions as Monthly Ledger (Priority: P2)

**Goal**: Users export their existing transactions for a selected month as an Excel file matching the ledger format. The exported file can be re-imported without changes (round-trip fidelity).

**Independent Test**: Export for a person/month with known data, open file, verify all credits appear as daily amounts in correct day columns, all debits appear as `=SUM(...)` formulas, no data lost on re-import.

### Implementation for User Story 4

- [x] T025 [P] [US4] Implement `createMonthlyLedger(transactions: ParsedTransaction[], month: number, year: number): Buffer` in `lib/excel-utils.ts` — groups credits by description+day, debits by description+date into `=SUM(...)` formulas; generates workbook matching the template format
- [x] T026 [US4] Implement `export-transactions.ts` server action at `src/server/actions/export-transactions.ts` — accepts `personId`, `month`, `year`; queries transactions for that person+month via Prisma; separates credits and debits; calls `createMonthlyLedger`; returns Excel file as `Blob`
- [x] T027 [US4] Implement `export-button.tsx` component at `app/_components/export-button.tsx` — `'use client'` button with month/year picker, triggers download of exported Excel file, shows loading state during generation
- [x] T028 [US4] Wire Export button into person summary page — add `<ExportButton personId={person.id} />` to `app/persons/[id]/summary/page.tsx`
- [x] T029 [US4] Handle edge case: empty month export — when no transactions exist for the selected month, export an empty template with correct headers (same as template download)

**Checkpoint**: Export generates correct ledger format; re-importing exported file passes validation and produces identical records

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Integration verification, edge case hardening, and final validation

- [x] T030 Install `@types/xlsx` if needed and verify no type errors with `npm run lint`
- [x] T031 Verify all three new components are wired into pages and accessible from the person navigation flow
- [x] T032 Verify currency handling: amounts display in user's preferred currency in preview modal and template Total header
- [x] T033 Verify re-import behavior: uploading a second file for the same person+month replaces data (no duplicates)
- [x] T034 Run `npm run lint` and fix any lint errors across all new files
- [x] T035 Run `npm run build` and verify no build errors
- [x] T036 Review all new files for clean code, explicit TypeScript types, and consistent naming

## Phase 8: Cents-to-Rupees Conversion

**Purpose**: Remove cents/paise convention — amounts stored and displayed as whole rupees

- [x] T037 Remove `cents / 100` division from `lib/format-amount.ts` — amounts treated as rupees
- [x] T038 Rename `cents` parameter to `amount` in `lib/use-currency.ts` to match
- [x] T039 Remove `(cents)` from validation messages in `src/server/schemas/wallet.ts`
- [x] T040 Remove `* 100` multiplier from `app/_components/monthly-grid.tsx` credit entry
- [x] T041 Remove `* 100` multiplier from `app/_components/debit-form.tsx` debit entry
- [x] T042 Update template example formula `=SUM(-5000-3000)` → `=SUM(-500-300)` in `lib/excel-utils.ts`
- [x] T043 Allow zero as credit amount — change `<= 0` → `< 0` guard and `.positive()` → `.nonnegative()` in schema
- [x] T044 Fix grid display for zero amounts — use `!== undefined` check instead of falsy check
- [x] T045 Run `npm run lint` and `npm run build` — clean

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - Phase 3 (US1): No dependency on other stories — can be first story implemented
  - Phase 4 (US2): No dependency on US1 — independent story
  - Phase 5 (US3): Depends on US2 (same import components enhanced with error handling)
  - Phase 6 (US4): No dependency on US1-3 — independent story
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Standalone — can start after Foundational. No story dependencies.
- **US2 (P1)**: Standalone — can start after Foundational. No story dependencies.
- **US3 (P2)**: Depends on US2 (enhances same import-transactions.ts and import-transactions.tsx).
- **US4 (P2)**: Standalone — can start after Foundational. No story dependencies.

### Within Each User Story

- Models/types before implementation
- Server actions before UI components
- Core implementation before integration
- Story complete when acceptance scenarios pass

### Parallel Opportunities

- T001 (npm install) and T002 (placeholder file) can run in parallel
- T003, T004, T005 (different utility functions) can run in parallel within Phase 2
- US1 (Phase 3) and US2 (Phase 4) can run in parallel after Foundational
- US4 (Phase 6) can run in parallel with US1 (Phase 3) and US2 (Phase 4)
- T025 and T026 (export implementation) can run in parallel

---

## Parallel Example: Phase 2

```bash
# Launch all foundational utilities in parallel:
Task: "Implement parseSheetName in lib/excel-utils.ts"
Task: "Implement parseDebitFormula in lib/excel-utils.ts"
Task: "Implement buildMonthSheetName in lib/excel-utils.ts"
```

## Parallel Example: Phases 3 + 4 + 6 (After Foundational)

```bash
# US1 + US2 + US4 launch in parallel (independent stories):
Task: "Implement createTemplate + download-template.ts + template-download.tsx"
Task: "Implement parseWorkbook + import-transactions.ts + import-transactions.tsx"
Task: "Implement createMonthlyLedger + export-transactions.ts + export-button.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Template Download)
4. **STOP and VALIDATE**: Download template, verify format
5. Deploy/demo if ready (template download is useful standalone)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Template Download) → Deploy/Demo (MVP)
3. Add User Story 2 (Import with Preview) → Deploy/Demo
4. Add User Story 3 (Validation Errors) → Deploy/Demo
5. Add User Story 4 (Export) → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (Template) + US4 (Export)
   - Developer B: US2 (Import)
3. After US2 done:
   - Developer A/B: US3 (Validation) — enhances US2 components
4. Polish together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No test tasks — no test framework configured in the project
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
