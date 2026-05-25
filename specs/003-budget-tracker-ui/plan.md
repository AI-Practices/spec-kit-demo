# Implementation Plan: Budget Tracker & UI Enhancement

**Branch**: `003-budget-tracker-ui` | **Date**: 2026-05-25 | **Spec**: `specs/003-budget-tracker-ui/spec.md`

**Input**: Feature specification from `/specs/003-budget-tracker-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A single-user, client-persisted budget tracker built on top of the existing expense tracker. Users set monthly spending budgets per expense category, view color-coded progress bars on the dashboard, and access a dedicated budget page for detailed monthly overviews. The entire app receives a visual polish pass for a cohesive, modern feel. Data stored in localStorage via the existing typed wrapper pattern with Zod validation. No auth or backend database.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)

**Primary Dependencies**: Next.js 16.2.6, React 19.2.4, Tailwind CSS v4, Zod (validation)

**Storage**: Client-side localStorage with typed wrapper pattern (extending existing `src/lib/storage.ts`)

**Testing**: None configured (no test framework installed — out of scope for this feature)

**Target Platform**: Web browser (modern desktop/mobile)

**Project Type**: Web application (Next.js App Router)

**Performance Goals**: Dashboard budget section renders within 1s for up to 10 budgeted categories; month switching completes within 1s

**Constraints**: localStorage quota (~5-10MB per origin), no backend server, single-user, no auth

**Scale/Scope**: Personal tracker — single user, up to 8 budgeted categories, budgets for any month (past/current/future)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate Results: PASS

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First Development | ✅ PASS | Spec exists at `specs/003-budget-tracker-ui/spec.md`; plan follows spec |
| II. Clean & Modular Code | ✅ PASS | Single-responsibility modules; budget storage/validation/UI separated |
| III. TypeScript Discipline | ✅ PASS | Explicit types on all APIs; no `any`; strict mode enabled; Zod schemas shared |
| IV. Convention Over Configuration | ✅ PASS | Next.js 16 App Router + Tailwind v4 + React 19 + Zod — all in established stack |
| V. Progressive Enhancement | ✅ PASS | P1 (Set budgets) → P2 (Dashboard progress) → P3 (UI polish) → P4 (Budget page) ordering |

### Justified Deviations

None.

## Project Structure

### Documentation (this feature)

```text
specs/003-budget-tracker-ui/
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
├── globals.css                          # Budget color tokens (green/amber/red)
├── layout.tsx                           # Updated nav with Budgets link
├── page.tsx                             # Dashboard — adds budget section
├── expenses/
│   └── page.tsx                         # Unchanged
├── budgets/
│   └── page.tsx                         # Budget overview page (Server Component)
└── _components/
    ├── add-expense-form.tsx             # Unchanged
    ├── expense-list.tsx                 # Unchanged
    ├── dashboard-stats.tsx              # Updated — add budget progress section
    ├── dashboard-budgets.tsx            # 'use client' — budget progress bars on dashboard
    ├── budget-manager.tsx              # 'use client' — set/edit/remove budgets
    ├── budget-progress-bar.tsx          # 'use client' — single progress bar with color tiers
    ├── month-picker.tsx                 # 'use client' — navigate past/current/future months
    ├── empty-state.tsx                  # Unchanged (but style-polished)
    └── theme-toggle.tsx                 # Unchanged

src/
├── server/
│   ├── actions/
│   │   ├── add-expense.ts              # Unchanged
│   │   ├── delete-expense.ts           # Unchanged
│   │   ├── set-budget.ts               # 'use server' — validates, saves budget
│   │   └── remove-budget.ts            # 'use server' — validates, removes budget
│   ├── schemas/
│   │   ├── expense.ts                  # Unchanged
│   │   └── budget.ts                   # Zod schemas for budget validation
│   └── types.ts                        # Add Budget type, Category reused
└── lib/
    ├── storage.ts                      # Unchanged (expenses)
    └── budget-storage.ts               # Budget-specific localStorage wrapper
```

**Structure Decision**: Follows the same App Router + client/server component pattern as the existing expense tracker. Budget components co-located in `app/_components/`. Budget storage in `src/lib/budget-storage.ts` (separate from expense storage for data isolation). Budget schemas and server actions in `src/server/`.

## Complexity Tracking

No constitution violations requiring justification.
