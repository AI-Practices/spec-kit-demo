# Implementation Plan: Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-05-25 | **Spec**: `specs/001-expense-tracker/spec.md`

**Input**: Feature specification from `/specs/001-expense-tracker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A single-user, client-persisted expense tracker built with Next.js 16 App Router. Users add, view, and delete expenses (amount in integer cents, date, category, description). Data stored in localStorage via a typed wrapper with Zod validation shared between server actions and client components. No auth or backend database.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)

**Primary Dependencies**: Next.js 16.2.6, React 19.2.4, Tailwind CSS v4, Zod (validation)

**Storage**: Client-side localStorage with typed wrapper pattern

**Testing**: None configured (no test framework installed — out of scope for this feature)

**Target Platform**: Web browser (modern desktop/mobile)

**Project Type**: Web application (Next.js App Router)

**Performance Goals**: Dashboard renders within 1s for up to 500 recorded expenses

**Constraints**: localStorage quota (~5-10MB per origin), no backend server, single-user, no auth

**Scale/Scope**: Personal expense tracker — single user, ~500 expenses max, predefined categories only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate Results: PASS

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First Development | ✅ PASS | Spec exists at `specs/001-expense-tracker/spec.md`; plan follows spec |
| II. Clean & Modular Code | ✅ PASS | Single-responsibility modules; separation of UI / validation / storage |
| III. TypeScript Discipline | ✅ PASS | Explicit types on all APIs; no `any`; strict mode enabled |
| IV. Convention Over Stack | ✅ PASS | Next.js 16 App Router + Tailwind v4 + React 19 — all in established stack |
| V. Progressive Enhancement | ✅ PASS | P1 (Add) → P2 (View/Dashboard) → P3 (Delete) ordering |

### Justified Deviations

| Deviation | Rationale |
|-----------|-----------|
| `src/server/` folder + server actions (constitution says "No backend or database") | Server actions are a Next.js App Router convention, not a separate backend. They run as serverless functions within the framework. Data persists client-side via localStorage — no external database is introduced. The `src/server/` directory houses validation schemas, types, and server-action functions. |

## Project Structure

### Documentation (this feature)

```text
specs/001-expense-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── globals.css
├── layout.tsx
├── page.tsx                          # Dashboard (Server Component)
├── expenses/
│   └── page.tsx                      # Expenses list (Server Component)
└── _components/
    ├── add-expense-form.tsx          # 'use client' – form, calls server action
    ├── expense-list.tsx              # 'use client' – displays expenses with delete
    ├── dashboard-stats.tsx           # 'use client' – total + top 5 recent
    └── empty-state.tsx               # 'use client' – zero-expense message + CTA

src/
├── server/
│   ├── actions/
│   │   ├── add-expense.ts            # 'use server' – validates, returns result
│   │   └── delete-expense.ts         # 'use server' – validates, returns result
│   ├── schemas/
│   │   └── expense.ts                # Zod schemas (shared validation)
│   └── types.ts                      # Expense, Category, action result types
└── lib/
    └── storage.ts                    # localStorage typed wrapper
```

**Structure Decision**: Single project with App Router convention. All server-side logic in `src/server/`. Client components co-located in `app/_components/`. Storage layer in `src/lib/`.

## Complexity Tracking

No constitution violations requiring justification beyond the one documented above.
