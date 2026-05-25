---

description: "Tasks for Expense Tracker feature implementation"

---

# Tasks: Expense Tracker

**Input**: Design documents from `/specs/001-expense-tracker/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test framework is configured — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project at repository root
- All server-side logic under `src/server/`
- All client components under `app/_components/`
- Storage layer under `src/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and configure existing files for the expense tracker feature.

- [x] T001 Create directory structure for expense tracker feature: `mkdir -p app/expenses app/_components src/server/actions src/server/schemas src/lib`

- [x] T002 [P] Update app/layout.tsx — set metadata title to "Expense Tracker", update description, add basic nav links between Dashboard and Expenses

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, validation schemas, and storage layer that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 [P] Create shared types in `src/server/types.ts` — `Category` type (union of 8 predefined labels), `Expense` interface (id, amount, date, category, description), server action response types (`ActionResult<T>` with success/data or success/errors)

- [x] T004 [P] Create Zod validation schemas in `src/server/schemas/expense.ts` — `expenseSchema` for full expense input (amount: positive int, date: YYYY-MM-DD no future, category: enum, description: min 1 char max 200), `addExpenseInputSchema` (subset without id), `deleteExpenseInputSchema` (id required)

- [x] T005 [P] Create localStorage typed wrapper in `src/lib/storage.ts` — `getExpenses(): Expense[]`, `saveExpenses(expenses: Expense[])`, `addExpense(input: Expense): Expense` (appends + saves), `removeExpense(id: string): void` (filters + saves). Handle missing key, JSON parse errors, quota errors.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Add a New Expense (Priority: P1) 🎯 MVP

**Goal**: User fills in amount (cents), date, category, and description; the expense is validated, saved to localStorage, and appears immediately in the expenses list.

**Independent Test**: Open the app, navigate to /expenses, fill in all 4 fields with valid data, submit. Confirm the expense entry appears in the list below the form.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create add-expense server action in `src/server/actions/add-expense.ts` — `'use server'` function that takes `AddExpenseInput`, validates with Zod schema, returns `ActionResult<Expense>` (success with generated UUID on valid, error map on invalid)

- [x] T007 [US1] Create expenses page route in `app/expenses/page.tsx` — Server Component that renders the page heading ("Expenses") and the add-expense-form + expense-list client components inside a wrapper layout

- [x] T008 [US1] Create add-expense-form client component in `app/_components/add-expense-form.tsx` — `'use client'` form with fields: amount (number input, cents), date (date input, max=today), category (select dropdown of 8 options), description (textarea). On submit: calls server action → if valid, saves to localStorage via `addExpense()` and resets form → if errors, displays per-field validation messages. Handle quota error with user-friendly message.

**Checkpoint**: At this point, User Story 1 is fully functional — user can add expenses and see them persisted.

---

## Phase 4: User Story 2 — View Expenses and Dashboard (Priority: P2)

**Goal**: User sees all expenses sorted by most recent first in the expenses list. Dashboard shows total spending and the 5 most recent expenses. Empty state displayed when no expenses exist.

**Independent Test**: Add 3+ expenses via the form, navigate to the Dashboard (/) — verify total equals sum of all expenses and the 5 most recent are shown. Navigate to /expenses — verify all expenses listed sorted by date descending.

### Implementation for User Story 2

- [x] T009 [P] [US2] Create empty-state client component in `app/_components/empty-state.tsx` — `'use client'` component showing "No expenses yet" message, a simple illustration (could be an SVG or emoji-based graphic), and a "Add Your First Expense" button linking to /expenses

- [x] T010 [P] [US2] Create expense-list client component in `app/_components/expense-list.tsx` — `'use client'` component that reads expenses from localStorage via `getExpenses()`, sorts by date descending, and renders each expense row showing: formatted amount ($X.XX), date (YYYY-MM-DD), category badge, and description. Empty state delegates to `empty-state` component when the list is empty.

- [x] T011 [P] [US2] Create dashboard-stats client component in `app/_components/dashboard-stats.tsx` — `'use client'` component that reads expenses from localStorage, computes total sum (displayed as $X.XX), and renders the top 5 most recent expenses in a compact list. Empty state delegates to `empty-state` component.

- [x] T012 [US2] Update `app/page.tsx` — replace default Next.js content with the dashboard layout: render `dashboard-stats` component, add link to /expenses page. Use `empty-state` fallback when no expenses exist.

- [x] T013 [US2] Update `app/expenses/page.tsx` — integrate `expense-list` component below the add form. Pass a refresh mechanism so the list re-renders after a new expense is added (e.g., increment a key counter or use `useSyncExternalStore` pattern).

**Checkpoint**: User Stories 1 AND 2 are both functional — user can add, view, and see dashboard totals.

---

## Phase 5: User Story 3 — Delete an Expense (Priority: P3)

**Goal**: User removes an expense from the list. The expense disappears, and the dashboard totals update accordingly.

**Independent Test**: Add an expense, note the total on the dashboard. Delete the expense from the list. Confirm it is removed from the list and the dashboard total decreases by the deleted amount.

### Implementation for User Story 3

- [x] T014 [P] [US3] Create delete-expense server action in `src/server/actions/delete-expense.ts` — `'use server'` function that takes `{ id: string }`, validates with Zod schema, returns `ActionResult<{ id: string }>`

- [x] T015 [US3] Integrate delete in `app/_components/expense-list.tsx` — add a "Delete" button per expense row. On click: calls delete-expense server action → on success, removes expense from localStorage via `removeExpense()` → list re-renders without the deleted expense. Show a brief confirmation before deleting (optional but good UX).

**Checkpoint**: All user stories functional.

---

## Phase 5b: Dark Mode UI (Priority: P1 — System Dark Mode)

**Goal**: User sees the entire app in a dark color scheme when their OS is in dark mode, or when they manually toggle the theme. All components, forms, and navigation adapt correctly.

**Spec**: `specs/002-dark-mode-ui/spec.md`

**Independent Test**: Toggle OS appearance between light/dark — every page and component switches correctly. Use the manual theme toggle to override and persist preference.

### Implementation Tasks

- [ ] T019 [P] [US4] Update `app/globals.css` — configure Tailwind v4 dark variant to use class-based strategy (`@variant dark (&:where(.dark, .dark *))`) and define `dark:` CSS custom properties for all surfaces, borders, text, and error states used across the app

- [ ] T020 [P] [US4] Create theme-toggle client component in `app/_components/theme-toggle.tsx` — `'use client'` component that manages theme state (light/dark/system). On mount: reads persisted preference from localStorage, applies `.dark` class to `<html>` based on preference or system media query. Listens for `matchMedia('prefers-color-scheme: dark')` changes when in "system" mode. Exposes a UI toggle (three-state button or dropdown) in the nav bar. Persists choice to localStorage key `"theme"`.

- [ ] T021 [US4] Update `app/layout.tsx` — integrate `<ThemeToggle />` component into the navigation bar next to existing nav links

- [ ] T022 [P] [US4] Update `app/_components/add-expense-form.tsx` — add `dark:` Tailwind classes: form container border, input/select/textarea backgrounds and borders, label text, button background and hover, error message text and background

- [ ] T023 [P] [US4] Update `app/_components/expense-list.tsx` — add `dark:` Tailwind classes: row container borders, amount/text colors, category badge background and text, delete button colors and hover

- [ ] T024 [P] [US4] Update `app/_components/dashboard-stats.tsx` — add `dark:` Tailwind classes: total card background and border, heading text, row container borders, amount/text colors

- [ ] T025 [P] [US4] Update `app/_components/empty-state.tsx` — add `dark:` Tailwind classes: heading and description text, CTA button background and hover

- [ ] T026 [US4] Update `app/page.tsx` and `app/expenses/page.tsx` — add `dark:` Tailwind classes to page-level structural elements (headings, wrapper divs)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality and fix any issues.

- [ ] T016 Run `npm run lint` and fix any ESLint errors

- [ ] T017 Run `npm run build` and fix any build errors

- [ ] T018 Verify the app runs with `npm run dev` and all 3 user stories work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - Stories proceed sequentially in priority order (P1 → P2 → P3)
- **Dark Mode (Phase 5b)**: Depends on all user stories (Phase 3-5) being complete — touches all UI components
- **Polish (Phase 6)**: Depends on all user stories and Phase 5b being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational — operates on same localStorage data as US1 but is independently testable
- **User Story 3 (P3)**: Can start after Foundational — integrates delete button into expense-list created in US2

### Within Each Phase

- Models/types before services
- Services before UI
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

| Phase | Parallel Tasks |
|-------|---------------|
| Phase 1 (Setup) | T002 parallel with T001 (T001 must complete first for directories to exist, so T002 is [P] only after T001) |
| Phase 2 (Foundational) | T003, T004, T005 can all run in parallel |
| Phase 3 (US1) | T006 parallel with T007 |
| Phase 4 (US2) | T009, T010, T011 can all run in parallel |
| Phase 5 (US3) | T014 is standalone |
| Phase 5b (Dark Mode) | T019-T020 parallel; T021 depends on T020; T022-T026 parallel with each other and T021 |
| Phase 6 (Polish) | T016, T017, T018 sequential |

---

## Parallel Example: Phase 2 Foundational

```bash
# All foundational files are independent and can be created together:
Task: "Create shared types in src/server/types.ts"
Task: "Create Zod schemas in src/server/schemas/expense.ts"
Task: "Create localStorage wrapper in src/lib/storage.ts"
```

## Parallel Example: Phase 4 User Story 2

```bash
# All UI components for US2 are independent:
Task: "Create empty-state client component in app/_components/empty-state.tsx"
Task: "Create expense-list client component in app/_components/expense-list.tsx"
Task: "Create dashboard-stats client component in app/_components/dashboard-stats.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Add Expense)
4. **STOP and VALIDATE**: Open /expenses, add an expense, confirm it appears
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Add Expense) → Test independently → **MVP!**
3. Add User Story 2 (View/Dashboard) → Test independently → adds dashboard value
4. Add User Story 3 (Delete) → Test independently → adds delete capability
5. Polish → production-ready

### Single Developer Strategy

1. Sequential execution in priority order (P1 → P2 → P3)
2. Within each phase: parallel where possible to save time
3. Validate at every checkpoint before proceeding

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No test framework is installed — tests are not included
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
