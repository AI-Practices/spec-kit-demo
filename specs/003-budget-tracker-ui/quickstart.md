# Quickstart: Budget Tracker & UI Enhancement

**Date**: 2026-05-25

## Implementation Order

### Phase 1 — Budget Data Layer (FR-001–FR-005, FR-018)

1. Add `Budget` type to `src/server/types.ts` (reusing `Category`)
2. Create `src/server/schemas/budget.ts` with Zod schemas (mirroring `expense.ts`)
3. Create `src/lib/budget-storage.ts` (mirroring `storage.ts`, key: `"budgets"`)
4. Create `src/server/actions/set-budget.ts` (server action)
5. Create `src/server/actions/remove-budget.ts` (server action)

### Phase 2 — Budget Management UI (User Story 1)

1. Create `app/_components/budget-manager.tsx` — form to set/edit/remove budgets per category
2. Create `app/_components/month-picker.tsx` — navigate past/current/future months
3. Create `app/budgets/page.tsx` — dedicated budget page route
4. Update `app/layout.tsx` nav to add Budgets link

### Phase 3 — Dashboard Budget Progress (User Story 2)

1. Create `app/_components/dashboard-budgets.tsx` — fetches budgets + expenses, computes summaries
2. Create `app/_components/budget-progress-bar.tsx` — color-coded progress bar component
3. Update `app/_components/dashboard-stats.tsx` to embed budget section
4. Wire up reactivity: budget changes trigger re-render of dashboard

### Phase 4 — UI Polish Pass (User Story 3)

1. Add budget color tokens to `app/globals.css` (--budget-safe, --budget-warning, --budget-overspent)
2. Review and refine spacing, typography, and card styling across all pages
3. Add hover/focus transitions to interactive elements
4. Polish empty states and loading placeholders
5. Ensure consistency across light and dark modes

### Phase 5 — Budget Overview Page (User Story 4)

1. Expand `app/budgets/page.tsx` with full budget table (budget, spent, remaining, %)
2. Integrate month-picker for month switching
3. Compute BudgetSummary on render for each month

## Key Decisions

- **Budget storage**: Separate `localStorage` key (`"budgets"`) from expenses — data isolation without migration
- **Budget computation**: Derived on render (no stored running totals) — source of truth is always the expense records
- **Mid-month budgets**: Count expenses from the 1st of the month (retroactive)
- **Future months**: Budgets can be set for any month; display zero spending until expenses exist
- **Color scale**: Green (< 80%) → Amber (80-100%) → Red (> 100%)

## Files to Modify

| File | Change |
|------|--------|
| `src/server/types.ts` | Add `Budget` interface |
| `app/layout.tsx` | Add Budgets nav link |
| `app/page.tsx` | Embed budget section |
| `app/_components/dashboard-stats.tsx` | Add budget progress section |
| `app/globals.css` | Add budget color tokens |

## Files to Create

| File | Purpose |
|------|---------|
| `src/server/schemas/budget.ts` | Zod schemas for budget validation |
| `src/lib/budget-storage.ts` | Budget localStorage wrapper |
| `src/server/actions/set-budget.ts` | Server action to set/update budget |
| `src/server/actions/remove-budget.ts` | Server action to remove budget |
| `app/budgets/page.tsx` | Budget overview page |
| `app/_components/budget-manager.tsx` | Budget form component |
| `app/_components/month-picker.tsx` | Month navigation component |
| `app/_components/dashboard-budgets.tsx` | Dashboard budget section |
| `app/_components/budget-progress-bar.tsx` | Progress bar component |
