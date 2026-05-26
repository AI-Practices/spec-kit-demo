# Implementation Plan: Excel Wallet Transactions

**Branch**: `008-excel-wallet-transactions` | **Date**: 2026-05-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-excel-wallet-transactions/spec.md`

## Summary

Add Excel import/export for Person Wallet transactions using a monthly ledger format. Users download a template, fill credits (daily vertical values) and debits (`=SUM(-amount1-amount2-...)` formulas), upload for preview/validation, and confirm import. Export produces the same format for offline editing and re-upload. Re-importing the same month replaces existing data.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Next.js 16.2.6 (App Router), React 19.2.4

**Primary Dependencies**: `xlsx` (SheetJS) for Excel read/write; existing: Prisma (PostgreSQL adapter), Tailwind CSS v4, Chart.js

**Storage**: PostgreSQL via Prisma (existing `WalletTransaction` model: id, userId, personId, type, amount, date, notes)

**Testing**: No test framework configured (project convention)

**Target Platform**: Web (Next.js App Router, server actions for data operations)

**Project Type**: Web application (Next.js feature enhancement)

**Performance Goals**:
- Import (parse + validate + insert) of 150 transactions completes in under 30 seconds
- Preview modal renders within 2 seconds of file upload
- Export generates file in under 5 seconds for a month of data

**Constraints**:
- Must use existing `Prisma`/`PostgreSQL` data layer (no new storage)
- Must use existing `ActionResult<T>` pattern for server action responses
- Must reuse existing `createCreditSchema`/`createDebitSchema` Zod schemas for row validation
- Must use existing `revalidatePath()` pattern for refresh after import
- `xlsx` library bundled size must not bloat initial page load (use dynamic import)

**Scale/Scope**: Single-user wallet application. Typical import: 1-150 transactions per month per person.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First | ✅ PASS | Spec exists (`spec.md`) with 4 user stories, 15 FRs, 7 SCs, 3 clarifications |
| II. Clean & Modular Code | ✅ PASS | New server actions + components will follow single-responsibility; no existing module will be bloated |
| III. TypeScript Discipline | ✅ PASS | All new interfaces and function signatures will have explicit types; `xlsx` types available via `@types/xlsx` |
| IV. Convention Over Configuration | ✅ PASS | Next.js 16 App Router server actions for data; React client components for interactive UI; Tailwind v4 for styling |
| V. Progressive Enhancement | ✅ PASS | Stories ordered P1 (template download + import) → P2 (validation errors + export); each independently testable |
| Technology Stack | ✅ PASS | `xlsx` added as dependency; all other tech from existing stack |
| Development Workflow | ✅ PASS | Plan → Tasks → Implement; no skip gates |

**Note on Constitution vs codebase**: The constitution states "No backend or database" but the codebase already has Prisma/PostgreSQL from the Person Wallet feature (spec 006). This is a known outdated constitution clause. The plan follows the actual architecture.

## Project Structure

### Documentation (this feature)

```text
specs/008-excel-wallet-transactions/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Created by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── server/
│   └── actions/
│       ├── import-transactions.ts   # Parse xlsx, validate, bulk insert (NEW)
│       ├── export-transactions.ts   # Query transactions, generate xlsx (NEW)
│       └── download-template.ts     # Generate empty template xlsx (NEW)
├── app/
│   └── _components/
│       ├── import-transactions.tsx  # Upload + preview modal (NEW)
│       ├── export-button.tsx        # Month picker + download trigger (NEW)
│       └── template-download.tsx    # Download template button (NEW)
└── lib/
    └── excel-utils.ts               # Shared: ledger format, formula parsing, cell mapping (NEW)
```

**Structure Decision**: Next.js App Router with server actions for data operations. New files follow existing naming conventions (`src/server/actions/`, `app/_components/`, `lib/`). Shared Excel logic extracted to `lib/excel-utils.ts` to avoid duplication between import, export, and template generation.

## Phase 0: Research & Unknowns

No NEEDS CLARIFICATION markers exist in the spec or technical context. The following technology decisions are documented in `research.md`:

- **Excel library**: SheetJS (xlsx) — industry standard, supports both read and write
- **Formula parsing**: Custom parser for `=SUM(-amount1-amount2-...)` pattern
- **Dynamic import**: `xlsx` loaded lazily in server actions (Next.js 16 bundler handles this)
- **Data refresh**: Existing `revalidatePath()` pattern sufficient per FR-009

## Phase 1: Design & Contracts

### Data Model

Key entities (detailed in `data-model.md`):

- **MonthlyLedger**: In-memory representation of a parsed sheet (month, year, rows)
- **LedgerRow**: Single row in the ledger (description, type: credit|debit, values by day, raw formula)
- **ParsedTransaction**: Individual credit or debit ready for preview/insert
- **ImportResult**: Summary of completed import (imported count, replaced count, replaced month)

### Interface Contracts

Detailed in `contracts/`:

- **Server Actions**: `importTransactions(formData: FormData): ActionResult<ImportResult>`, `exportTransactions(personId, month, year): Blob`, `downloadTemplate(month?, year?): Blob`
- **UI Component Props**: Standard React prop interfaces for import modal, export button, template download

### Quickstart

Key steps for implementation (detailed in `quickstart.md`):
1. Install `xlsx` dependency
2. Implement `lib/excel-utils.ts` (ledger format, formula parser, cell mapper)
3. Implement server actions (import, export, template)
4. Implement UI components (upload, preview modal, export button, template download)
5. Wire into existing person pages

## Post-Implementation Decisions

| Decision | Rationale | Files Affected |
|----------|-----------|----------------|
| **Amounts stored as rupees (not cents/paise)** | INR has no meaningful sub-unit in practice. Cents convention removed entirely. | `lib/format-amount.ts`, `lib/use-currency.ts`, `src/server/schemas/wallet.ts` |
| **Manual forms no longer multiply by 100** | Old `* 100` converted rupees → cents; no longer needed. | `app/_components/monthly-grid.tsx`, `app/_components/debit-form.tsx` |
| **Zero allowed as credit amount** | Enables clearing a day's credit entry. | `app/_components/monthly-grid.tsx`, `src/server/schemas/wallet.ts` |
| **Template debit example updated** | Changed from `=SUM(-5000-3000)` (cents) to `=SUM(-500-300)` (rupees). | `lib/excel-utils.ts` |
| **Old data accepted as-is** | Existing manual entries stored as cents will display 100× larger (e.g., 5000 → ₹5,000). No migration. | n/a |

## Complexity Tracking

No Constitution violations identified. Complexity is justified by feature requirements — no tracking needed.
