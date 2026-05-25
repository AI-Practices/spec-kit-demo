---

description: "Task list for Budget Tracker & UI Enhancement feature implementation"

---

# Tasks: Budget Tracker & UI Enhancement

**Input**: Design documents from `/specs/003-budget-tracker-ui/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No test framework is installed. No test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `app/` at repository root
- **Web app**: Next.js App Router with `app/` directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the existing project is ready for feature development

- [x] T001 Verify project dependencies are installed and dev server starts with `npm install && npm run dev`

**Checkpoint**: Project runs without errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data types, schemas, and storage that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Add `Budget` interface to `src/server/types.ts`
- [x] T003 [P] Create budget Zod schemas in `src/server/schemas/budget.ts`
- [x] T004 [P] Create budget localStorage wrapper in `src/lib/budget-storage.ts`
- [x] T005 [P] Add budget color CSS custom properties to `app/globals.css`

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Set Monthly Budgets Per Category (Priority: P1) 🎯 MVP

**Goal**: User sets a monthly spending limit for each expense category. Budgets are persisted, and the user can view, edit, or remove any budget at any time.

**Independent Test**: Navigate to `/budgets`, set a budget amount for a category, confirm it appears as saved. Refresh the page — budget must persist. Edit the amount, confirm update. Remove the budget, confirm disappearance. Try negative/zero amount — validation error shown, budget not saved.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create `set-budget` server action in `src/server/actions/set-budget.ts`
- [x] T007 [P] [US1] Create `remove-budget` server action in `src/server/actions/remove-budget.ts`
- [x] T008 [P] [US1] Create month-picker component in `app/_components/month-picker.tsx`
- [x] T009 [US1] Create budget-manager component in `app/_components/budget-manager.tsx` (depends on T006, T007, T008)
- [x] T010 [US1] Create budgets page route at `app/budgets/page.tsx` (depends on T009)
- [x] T011 [US1] Add Budgets nav link in `app/layout.tsx` (depends on T010)

**Checkpoint**: User Story 1 is fully functional — budgets can be set, edited, removed, and persist across refreshes

---

## Phase 4: User Story 2 — View Budget Progress on Dashboard (Priority: P2)

**Goal**: User sees a visual overview of spending against budgets on the dashboard. Each budgeted category shows a color-coded progress bar (green/amber/red). Overspend amounts are displayed.

**Independent Test**: Set a budget for a category (via US1), add expenses in that category, confirm the progress bar updates proportionally on the dashboard. Test all three color tiers: under 80% (green), 80–100% (amber), over 100% (red with overspend amount).

### Implementation for User Story 2

- [x] T012 [P] [US2] Create budget-progress-bar component in `app/_components/budget-progress-bar.tsx`
- [x] T013 [US2] Create dashboard-budgets component in `app/_components/dashboard-budgets.tsx` (depends on T012)
- [x] T014 [US2] Update dashboard-stats to embed budget section in `app/_components/dashboard-stats.tsx`
- [x] T015 [US2] Wire budget reactivity so dashboard re-renders when budgets or expenses change

**Checkpoint**: User Story 2 is fully functional — dashboard shows budget progress bars that update with expenses

---

## Phase 5: User Story 3 — Visually Enhanced Interface (Priority: P3)

**Goal**: The entire app receives a visual polish pass — improved spacing, typography, card styling, hover effects, transitions, and layout refinement. Consistent look across all screens in light and dark mode.

**Independent Test**: Visually inspect every screen (dashboard, expenses, budgets). Verify consistent spacing/typography/cards. Hover over buttons/links — smooth transitions appear. Resize browser — layout adapts. Toggle dark mode — all elements remain readable.

### Implementation for User Story 3

- [ ] T016 [P] [US3] Refine spacing, typography, and card styling across all pages for a cohesive visual rhythm
- [ ] T017 [P] [US3] Add smooth hover/focus transitions (color, opacity, transform) to all interactive elements
- [ ] T018 [P] [US3] Polish empty states and loading placeholders across all components
- [ ] T019 [US3] Verify and adjust visual consistency in both light and dark modes across all screens

**Checkpoint**: User Story 3 is complete — all pages share consistent modern styling with smooth interactions

---

## Phase 6: User Story 4 — Monthly Budget Overview Page (Priority: P4)

**Goal**: User visits a dedicated budget page showing all categories with budget, current spending, remaining amount, and percentage used — all for the selected month. Month switching enables historical review.

**Independent Test**: Navigate to `/budgets`, verify all categories are displayed with budget/spent/remaining/percentage columns. Switch months — data updates to show that month's budgets and expenses. Overspent categories show negative remaining values highlighted in red.

### Implementation for User Story 4

- [ ] T020 [P] [US4] Compute BudgetSummary on render in `app/budgets/page.tsx` by joining budgets with expenses by category and month
- [ ] T021 [P] [US4] Integrate month-picker component for month switching on the budget page
- [ ] T022 [US4] Build full budget summary table with budget, spent, remaining, and percentage columns (depends on T020, T021)

**Checkpoint**: User Story 4 is complete — dedicated budget page provides a full monthly financial snapshot

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and quality assurance

- [ ] T023 Run `npm run build` to verify no build errors
- [ ] T024 Run `npm run lint` to verify no linting errors

**Checkpoint**: Build succeeds with no errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Foundational phase completion
  - User stories proceed sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — Depends on US1 for budget data, uses expense data from existing storage
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — Independent of budget features; purely visual
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) — Depends on US1 for budget management UI, US2 for progress bar component

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All US1 tasks marked [P] can run in parallel (server actions, month-picker component)
- All US2 tasks marked [P] can run sequentially (progress bar → dashboard-budgets → integration)
- All US3 tasks marked [P] can run in parallel (styling, transitions, empty states)
- All US4 tasks marked [P] can run in parallel (BudgetSummary logic, month-picker integration)

---

## Parallel Example: User Story 1

```bash
# Launch all independent US1 tasks together:
Task: "Create set-budget server action in src/server/actions/set-budget.ts"
Task: "Create remove-budget server action in src/server/actions/remove-budget.ts"
Task: "Create month-picker component in app/_components/month-picker.tsx"
```

## Parallel Example: User Story 3

```bash
# Launch all independent US3 tasks together:
Task: "Refine spacing, typography, and card styling across all pages"
Task: "Add hover/focus transitions to all interactive elements"
Task: "Polish empty states and loading placeholders"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Set budgets) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Dashboard progress) → Test independently → Deploy/Demo
4. Add User Story 3 (Visual polish) → Test independently → Deploy/Demo
5. Add User Story 4 (Budget overview page) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (budget management)
   - Developer B: User Story 3 (visual polish — independent of budget)
3. When US1 is done:
   - Developer A: User Story 2 (dashboard progress)
   - Developer B: User Story 4 (budget overview page)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No test framework installed — tests are out of scope
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
