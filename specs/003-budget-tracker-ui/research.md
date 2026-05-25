# Research: Budget Tracker & UI Enhancement

**Phase**: 0 (Outline & Research)
**Date**: 2026-05-25
**Spec**: `specs/003-budget-tracker-ui/spec.md`

## Overview

No NEEDS CLARIFICATION markers existed in the spec. All technical decisions are derived from the established project stack and the existing expense tracker implementation. This document confirms decisions and documents rationale.

## Technical Decisions

### Storage Pattern

- **Decision**: Extend the existing localStorage typed wrapper pattern to budgets
- **Rationale**: The project already has a proven `src/lib/storage.ts` pattern with cached reads, subscription-based reactivity, and quota error handling. Budgets follow the same pattern with a new storage key (`budgets`).
- **Alternatives considered**: IndexedDB (overkill for <50 budget entries), in-memory only (no persistence).

### Validation

- **Decision**: Zod schemas shared between server actions and client, same pattern as expenses
- **Rationale**: The existing `src/server/schemas/expense.ts` establishes this pattern well. A new `budget.ts` schema mirrors it.
- **Alternatives considered**: Manual validation (already have the Zod dependency, no reason to avoid it).

### Budget-Period Computation

- **Decision**: Budget progress is computed on render by filtering expenses by month+year and category, then summing amounts
- **Rationale**: Budgets and expenses are independent data stores. Budget progress is a derived view (Budget Summary entity in spec) — no need to store computed values.
- **Alternatives considered**: Storing running totals (diverges from source of truth, stale risk).

### UI Enhancement Approach

- **Decision**: Use existing Tailwind v4 utility classes + CSS custom properties; no new design system
- **Rationale**: Constitution mandates Convention Over Configuration with Tailwind v4. The existing `globals.css` already has CSS variables for surfaces, borders, and error states — extend this pattern with budget-specific colors (amber warning, green safe, red overspend).
- **Alternatives considered**: shadcn/ui component library (not in stack, would add dependency), custom CSS modules (Tailwind utility classes suffice).

### Budget Color Scale

- **Decision**: Three-tier color scale: green (under 80%), amber (80-100%), red (over 100%)
- **Rationale**: Industry standard for budget progress (Mint, YNAB, etc.). Intuitive and accessible with proper contrast ratios.
- **Alternatives considered**: Single color with percentage text (less visual impact), gradient scale (more complex, harder to read at a glance).

### Month Selection

- **Decision**: Full date-range selector (past, current, future months) — per user clarification
- **Rationale**: User confirmed budgets can be set for any month. Implementation uses a month picker component that navigates month-by-month.
- **Alternatives considered**: Current-month-only (rejected by user), current + past only (rejected by user).

### Budget Retroactivity

- **Decision**: Mid-month budgets count expenses from the 1st of that month — per user clarification
- **Rationale**: User confirmed full-month retroactive comparison. Budget progress shows "you budgeted $500, spent $300 so far this month" regardless of when the budget was created.
- **Alternatives considered**: Creation-date-forward (rejected by user).
