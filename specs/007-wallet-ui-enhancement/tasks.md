---

description: "Task list for Currency Support, Analytics Charts & UI Redesign"
---

# Tasks: Wallet UI Enhancement

**Input**: Design documents from `specs/007-wallet-ui-enhancement/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test framework is configured — manual testing only per spec's Independent Test criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `app/` (Next.js App Router), `lib/`, `src/`
- Paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install chart.js and react-chartjs-2 dependencies via `npm install chart.js react-chartjs-2`
- [X] T002 [P] Create `lib/` directory with module structure for new shared utilities

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utility modules that ALL user stories depend on — must be complete before any story can begin

- [X] T003 [P] Create centralized `formatAmount` utility in `lib/format-amount.ts` using `Intl.NumberFormat` with locale-per-currency (en-IN for INR lakh/crore, en-US for USD thousand/million)
- [X] T004 [P] Create `getCurrencyConfig` / `setCurrencyConfig` persistence module in `lib/currency-config.ts` (localStorage key `"currency-preference"`, default INR)
- [X] T005 [P] Create `useCurrency` React hook in `lib/use-currency.ts` wrapping currency config + formatAmount with cross-component reactivity via custom event broadcasting
- [X] T006 [P] Create `buildChartDataset` data transform in `lib/chart-data.ts` — groups expenses by category, computes percentages, aggregates categories <5% into "Others" segment

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Configure and View Preferred Currency (Priority: P1) 🎯 MVP

**Goal**: All amounts display in Indian Rupee (₹) with lakh/crore grouping by default. User can switch currency via nav control, all visible amounts update immediately, preference persists across sessions.

**Independent Test**: Open app and verify all amounts display with ₹ symbol; switch currency in nav and confirm all amounts update; reload page and verify preference persisted.

### Implementation for User Story 1

**Step 3a — CurrencySelector UI + Integration**

- [X] T007 [P] [US1] Create `CurrencySelector` dropdown component in `app/_components/currency-selector.tsx` with INR/USD options, using `useCurrency` hook
- [X] T008 [US1] Integrate `CurrencySelector` into root layout in `app/layout.tsx` (add to nav bar alongside ThemeToggle)

**Step 3b — Replace all duplicated formatAmount with centralized utility**

- [X] T009 [P] [US1] Replace local `formatAmount` in `app/_components/dashboard-stats.tsx` with centralized `formatAmount` from `lib/format-amount.ts` via `useCurrency` hook
- [X] T010 [P] [US1] Replace local `formatAmount` in `app/_components/budget-manager.tsx` with centralized utility
- [X] T011 [P] [US1] Replace local `formatAmount` in `app/_components/expense-list.tsx` with centralized utility
- [X] T012 [P] [US1] Replace local `formatAmount` in `app/_components/dashboard-budgets.tsx` with centralized utility
- [X] T013 [P] [US1] Replace local `formatAmount` in `app/_components/monthly-grid.tsx` with centralized utility
- [X] T014 [P] [US1] Replace local `formatAmount` in `app/_components/person-list.tsx` with centralized utility
- [X] T015 [P] [US1] Replace local `formatAmount` in `app/_components/person-summary.tsx` with centralized utility
- [X] T016 [P] [US1] Replace local `formatAmount` in `app/_components/budget-progress-bar.tsx` with centralized utility (no-op — component only shows percentages, no amount formatting)

**Checkpoint**: Currency display with INR default + switching works across all pages — MVP is testable independently

---

## Phase 4: User Story 2 - Fix Amount Input Appending Instead of Replacing (Priority: P1)

**Goal**: Typing in any amount field replaces existing value rather than appending digits — behaves like a standard numeric input.

**Independent Test**: Open any transaction form, enter an amount, then type a new amount — field shows only the latest value, not concatenated.

### Implementation for User Story 2

- [X] T017 [P] [US2] Fix amount input in `app/_components/debit-form.tsx` — add `onFocus={(e) => e.target.select()}` to the amount input
- [X] T018 [P] [US2] Fix amount input in `app/_components/budget-manager.tsx` — add `onFocus={(e) => e.target.select()}` to the amount input
- [X] T019 [P] [US2] Fix amount input in `app/_components/monthly-grid.tsx` — add `onFocus={(e) => e.target.select()}` to the editing amount input
(T019 extended: also applied `onFocus` fix to `app/_components/add-expense-form.tsx` to cover all four forms per FR-005)

**Checkpoint**: All transaction forms now replace on new input — independently testable

---

## Phase 5: User Story 3 - View Analytics with Donut Charts (Priority: P2)

**Goal**: Dashboard shows a donut chart breaking down expenses by category, with tooltips and "Others" grouping for categories below 5%.

**Independent Test**: Add expenses across multiple categories, view dashboard — donut chart renders with correct proportions and "Others" segment for minor categories.

### Implementation for User Story 3

- [X] T020 [P] [US3] Create `DonutChart` client component in `app/_components/donut-chart.tsx` using chart.js Doughnut chart with `next/dynamic` + `ssr: false`, using `buildChartDataset` from `lib/chart-data.ts`, with tooltip showing label/amount/percentage and empty state via `EmptyState` component
- [X] T021 [US3] Integrate `DonutChart` into `app/_components/dashboard-stats.tsx` — render chart section using expense data from existing `useEffect` fetch, wrapped in responsive card

**Checkpoint**: Dashboard analytics with donut chart operational — independently testable without US1/US2

---

## Phase 6: User Story 4 - Experience Modernized App UI (Priority: P2)

**Goal**: Fintech-style interface with Indigo accent (#4F46E5), Green (#22C55E)/Red (#EF4444)/Cyan (#06B6D4) semantic colors, light background (#F8FAFC), elevated cards with consistent spacing.

**Independent Test**: Visually inspect each page against design tokens — cards use consistent border-radius/shadow/padding, accent color on interactive elements, semantic colors on financial data.

### Implementation for User Story 4

**Step 6a — Design tokens**

- [X] T022 [US4] Update `app/globals.css` with new color tokens — add `--color-accent` (indigo), `--color-positive` (green), `--color-negative` (red), `--color-chart-cyan`, `--color-accent-hover` to `:root` and `.dark`; change `--background` to `#F8FAFC` in light mode; add tokens to `@theme inline` block for Tailwind utility usage

**Step 6b — Apply theme to dashboard components**

- [X] T023 [P] [US4] Apply new theme to `app/_components/dashboard-stats.tsx` — update card styles (shadow, border-radius, padding), apply accent button/indicator colors, use semantic positive/negative colors
- [X] T024 [P] [US4] Apply new theme to `app/_components/dashboard-budgets.tsx` and `app/_components/budget-progress-bar.tsx` — update card/bar styling with new tokens

**Step 6c — Apply theme to form components**

- [X] T025 [P] [US4] Apply new theme to form components (`app/_components/add-expense-form.tsx`, `app/_components/debit-form.tsx`, `app/_components/budget-manager.tsx`) — use `bg-accent` for primary buttons, `text-positive`/`text-negative` for indicators, indigo focus rings

**Step 6d — Apply theme to list/display components**

- [X] T026 [P] [US4] Apply new theme to list and display components (`app/_components/expense-list.tsx`, `app/_components/person-list.tsx`, `app/_components/person-summary.tsx`) — update card containers, category badges with cyan accent, positive/negative for balances

**Step 6e — Apply theme to page layouts and navigation**

- [X] T027 [P] [US4] Apply new theme to page layouts (`app/budgets/page.tsx`, `app/expenses/page.tsx`, `app/persons/page.tsx`, `app/page.tsx`) — update page wrapper styling, section headings
- [X] T028 [P] [US4] Apply new theme to navigation and utility components (`app/layout.tsx` nav links, `app/_components/person-nav.tsx`, `app/_components/month-picker.tsx`, `app/_components/theme-toggle.tsx`) — use accent color for active nav links, updated button styles

**Checkpoint**: UI redesign applied across all pages — consistent fintech-style appearance

---

## Phase 7: User Story 5 - Responsive Dashboard on All Devices (Priority: P3)

**Goal**: Dashboard and all feature pages adapt layout to mobile (≤640px), tablet (641–1024px), and desktop (≥1025px) without horizontal scroll or overlapping elements.

**Independent Test**: Resize browser to 375px, 768px, and 1280px — layout adapts without overflow or overlap.

### Implementation for User Story 5

- [ ] T029 [P] [US5] Update `app/page.tsx` dashboard with responsive grid layout — change container from `max-w-2xl` to `max-w-7xl` with responsive padding, apply `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6` for card layout
- [ ] T030 [P] [US5] Update navigation in `app/layout.tsx` for mobile — ensure nav links remain accessible without overlap on screens down to 320px; add responsive padding classes
- [ ] T031 [P] [US5] Update detail page wrappers (`app/budgets/page.tsx`, `app/expenses/page.tsx`, `app/persons/page.tsx`, and person sub-pages) with responsive container padding — `mx-auto max-w-2xl px-4 sm:px-6 lg:px-8`

**Checkpoint**: Responsive layout functional at all breakpoints — all pages scroll-free from 320px to 1920px

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verify consistency, run lint, final validation

- [ ] T032 Verify all amount displays across every component use the centralized `formatAmount` utility — no remaining `$` hardcoded strings or duplicated formatters
- [ ] T033 Run `npm run lint` and `npm run build` — fix any TypeScript or ESLint errors
- [ ] T034 Run quickstart.md validation — verify all manual test scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–7)**: All depend on Foundational
  - US1 (P1) and US2 (P1) are independent — can be done in parallel
  - US3 (P2) depends on US1 (needs centralized formatAmount for tooltip currency)
  - US4 (P2) depends on US1 + US2 (needs formatAmount + input fix to be re-themed)
  - US5 (P3) depends on US4 (responsive builds on new theme structure)
- **Polish (Phase 8)**: Depends on all stories complete

### User Story Dependencies

- **US1 (Currency)**: Can start after Foundational — No dependencies on other stories
- **US2 (Input Fix)**: Can start after Foundational — Fully independent
- **US3 (Donut Chart)**: Depends on US1 (for currency-aware tooltip amounts); independent of US2, US4, US5
- **US4 (UI Redesign)**: Depends on US1 + US2 (styling changes incorporate centralized formatAmount + fixed inputs); independent of US3
- **US5 (Responsive)**: Depends on US4 (responsive grid styling built on new theme); independent of US3

### Within Each User Story

- All [P]-marked tasks within a story can run in parallel
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T002–T006 (Phase 1–2): All marked [P], fully parallel
- T007 + T009–T016 (US1): CurrencySelector component + all formatAmount replacements are file-independent
- T017–T019 (US2): All three files are independent — fully parallel
- T020–T021 (US3): DonutChart component creation independent of integration
- T023–T028 (US4): All theme applications are file-independent — fully parallel
- T029–T031 (US5): All responsive updates are file-independent — fully parallel
- US1 + US2 can be implemented in parallel by different developers

---

## Parallel Example: User Story 1

```bash
# Launch CurrencySelector + all formatAmount replacements together:
Task: "Create CurrencySelector in app/_components/currency-selector.tsx"
Task: "Replace formatAmount in app/_components/dashboard-stats.tsx"
Task: "Replace formatAmount in app/_components/budget-manager.tsx"
Task: "Replace formatAmount in app/_components/expense-list.tsx"
Task: "Replace formatAmount in app/_components/dashboard-budgets.tsx"
Task: "Replace formatAmount in app/_components/monthly-grid.tsx"
Task: "Replace formatAmount in app/_components/person-list.tsx"
Task: "Replace formatAmount in app/_components/person-summary.tsx"
Task: "Replace formatAmount in app/_components/budget-progress-bar.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install chart.js deps)
2. Complete Phase 2: Foundational (formatAmount, currency-config, useCurrency)
3. Complete Phase 3: User Story 1 (CurrencySelector + formatAmount replacements across all 8 components)
4. **STOP and VALIDATE**: All amounts display in ₹ with lakh/crore grouping; switching currency works
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Currency) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Input Fix) → Test independently → Deploy/Demo (each form tested individually)
4. Add US3 (Donut Chart) → Test independently → Deploy/Demo
5. Add US4 (UI Redesign) → Test independently → Deploy/Demo
6. Add US5 (Responsive) → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (Currency) — 9 file changes
   - Developer B: US2 (Input Fix) — 3 small changes
   - (US2 completes quickly, then Developer B joins Developer A for US1)
3. US3 (Chart) can start once US1's formatAmount utility is available
4. US4 (Theme) starts once US1 + US2 are stable
5. US5 (Responsive) starts after US4

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No test framework exists — testing is manual per the Independent Test criteria
- Chart library install is in Phase 1 Setup — don't defer to US3 phase
- Add `onFocus` select-all only to controlled inputs (debit-form, budget-manager, monthly-grid). Add-expense-form uses uncontrolled input which already replaces correctly.
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
