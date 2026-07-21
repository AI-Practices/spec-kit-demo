# Implementation Plan: Excel Financial Summary Section

**Branch**: `009-excel-financial-summary` | **Date**: 2026-05-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-excel-financial-summary/spec.md`

## Summary

Add a financial summary section (Monthly Savings, Last Month Remaining, Give Back for Daily Expenses, Loan Amount, Balance for Next Month) at the bottom of the monthly ledger Excel sheet. Export writes the summary rows with Excel formulas for auto-calculation, bold formatting, currency style, and highlighted cells. Import reads the summary row values and syncs them to dashboard/report totals.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Next.js 16.2.6 (App Router), React 19.2.4

**Primary Dependencies**: `xlsx` (SheetJS) — already installed from spec #008; Prisma (PostgreSQL adapter)

**Storage**: PostgreSQL via Prisma — requires a new `MonthlySummary` model or extension of existing schema to store per-person per-month summary values

**Testing**: No test framework configured (project convention)

**Target Platform**: Web (Next.js App Router, server actions for data operations)

**Project Type**: Web application (Next.js feature enhancement, extending #008)

**Performance Goals**:
- Export with summary section generates in under 5 seconds for a month of data (no meaningful overhead beyond existing export)
- Import summary sync completes within 2 seconds of import confirmation

**Constraints**:
- Must use existing `xlsx` library (already installed) — no new Excel dependencies
- Must preserve Excel formulas on export — summary cells written as formula strings (not hard-coded values)
- Must read computed cell values on import — the `xlsx` library's cached value (`v` property) is authoritative, not the formula string
- Summary section must be positioned 2+ rows below the last daily entry to avoid overlap
- Must extend or work alongside the existing import/export server actions from spec #008

**Scale/Scope**: Single-user wallet application. Typical month: 1-150 transactions. Summary rows are always 5 rows regardless of transaction count.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First | ✅ PASS | Spec exists (`spec.md`) with 3 user stories, 20 FRs, 6 SCs, 2 clarifications resolved |
| II. Clean & Modular Code | ✅ PASS | Extends existing `lib/excel-utils.ts` and server actions; summary logic isolated in dedicated module |
| III. TypeScript Discipline | ✅ PASS | All new interfaces and function signatures will have explicit types |
| IV. Convention Over Configuration | ✅ PASS | Next.js 16 App Router server actions; `xlsx` for Excel; Prisma/PostgreSQL for storage |
| V. Progressive Enhancement | ✅ PASS | Stories ordered P1 (export summary) → P2 (import sync) → P3 (manual edit); each independently testable |
| Technology Stack | ✅ PASS | No new dependencies; `xlsx` and Prisma already in stack |
| Development Workflow | ✅ PASS | Plan → Tasks → Implement; no skip gates |

**Note on Constitution vs codebase**: The constitution states "No backend or database" but the codebase already has Prisma/PostgreSQL from the Person Wallet feature (spec 006). This is a known outdated constitution clause, same as noted in spec #008. The plan follows the actual architecture.

## Project Structure

### Documentation (this feature)

```text
specs/009-excel-financial-summary/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── server/
│   └── actions/
│       ├── import-transactions.ts   # EXTEND: read summary rows + sync values
│       ├── export-transactions.ts   # EXTEND: append summary section with formulas
│       └── download-template.ts     # EXTEND: include empty summary section in template
├── lib/
│   └── excel-utils.ts               # EXTEND: add summary generation, parsing, cell formatting
└── app/
    └── _components/
        ├── import-transactions.tsx  # EXTEND: show summary values in import preview
        └── export-button.tsx        # NO CHANGE (export handler extended internally)
```

**Structure Decision**: Same pattern as spec #008. Summary logic added to `lib/excel-utils.ts` as shared functions (`buildSummarySection`, `parseSummaryRows`). Server actions extended to call these functions. No new UI components — summary appears in import preview modal.

## Complexity Tracking

No Constitution violations identified. Complexity is proportional to the 5-row summary addition.

## Phase 0: Research & Unknowns

No NEEDS CLARIFICATION markers remain in the spec. The following technology research tasks are needed:

1. **xlsx formula writing**: How to write cells with Excel formulas (`f` property) vs cached values (`v` property)
2. **xlsx cell formatting**: How to apply bold, currency format, fill colors, and alignment in SheetJS
3. **Per-month summary storage**: Design for storing 5 summary values per person per month in Prisma

These are documented in `research.md`.

## Phase 1: Design & Contracts

### Data Model

New Prisma model `MonthlySummary` with per-person per-month summary values. Detailed in `data-model.md`.

### Interface Contracts

Extended server action return types to include summary data. Detailed in `contracts/`.

### Quickstart

1. Install xlsx (already installed from #008)
2. Extend `lib/excel-utils.ts` with summary section helpers
3. Extend server actions (export: append summary; import: read + sync)
4. Extend import preview to show summary values
5. Run Prisma migration for `MonthlySummary` model (if new model is chosen)

### Agent Context

Update `AGENTS.md` plan reference to point to `specs/009-excel-financial-summary/plan.md`.
