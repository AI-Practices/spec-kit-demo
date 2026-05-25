---

description: "Tasks for Dark Mode UI feature implementation"

---

# Tasks: Dark Mode UI for Expense Tracker

**Input**: Design documents from `/specs/002-dark-mode-ui/`

**Prerequisites**: plan.md, spec.md

**Tests**: No test framework is configured — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Single project at repository root
- All client components under `app/_components/`
- Theme toggle component in `app/_components/`

---

## Phase 1: Theme Infrastructure (Shared Setup)

**Purpose**: Configure Tailwind v4 dark mode variant and CSS custom properties. Create the theme toggle component that manages light/dark/system state.

- [ ] T001 Update `app/globals.css` — add `@variant dark (&:where(.dark, .dark *))` to switch Tailwind's `dark:` variant to class-based strategy, define dark-mode CSS custom properties for backgrounds, surfaces, borders, text, form controls, and error states used across all components

- [ ] T002 [P] Create theme-toggle client component in `app/_components/theme-toggle.tsx` — `'use client'` component that:
  - Reads persisted theme preference from localStorage key `"theme"` on mount
  - Manages three states: `"light"`, `"dark"`, `"system"`
  - Applies/removes `.dark` class on `<html>` element based on state
  - Listens for `matchMedia('prefers-color-scheme: dark')` changes when in `"system"` mode
  - Persists choice to localStorage on change
  - Renders a visible toggle control (e.g., three-state button or icon toggle) in the nav bar
  - Falls back to system preference gracefully when localStorage is unavailable

**Checkpoint**: Theme infrastructure ready — class-based dark mode works, toggle component exists but not yet wired.

---

## Phase 2: User Story 1 — System-Led Dark Mode (Priority: P1)

**Goal**: When the user's OS is in dark mode, the entire expense tracker renders with a dark color scheme. No manual action needed.

**Independent Test**: Toggle system appearance between light and dark while viewing any page — all components switch correctly without a page reload.

### Implementation for User Story 1

- [ ] T003 [US1] Update `app/layout.tsx` — add `dark:` Tailwind classes to nav bar (background, border, link text colors) and page body wrapper

- [ ] T004 [P] [US1] Update `app/_components/add-expense-form.tsx` — add `dark:` Tailwind classes: form container border, input/select/textarea backgrounds (`dark:bg-zinc-800`) and borders (`dark:border-zinc-600`), label text (`dark:text-zinc-300`), button background (`dark:bg-zinc-100 dark:text-zinc-900`) and hover, error message background (`dark:bg-red-900/30`) and text (`dark:text-red-400`)

- [ ] T005 [P] [US1] Update `app/_components/expense-list.tsx` — add `dark:` Tailwind classes: row container borders (`dark:border-zinc-700`), amount text (`dark:text-zinc-100`), date text (`dark:text-zinc-400`), category badge background (`dark:bg-zinc-700`) and text (`dark:text-zinc-300`), description text (`dark:text-zinc-400`), delete button colors and hover

- [ ] T006 [P] [US1] Update `app/_components/dashboard-stats.tsx` — add `dark:` Tailwind classes: total card background (`dark:bg-zinc-800`) and border (`dark:border-zinc-700`), "Total Spending" label (`dark:text-zinc-400`), total amount (`dark:text-zinc-100`), section heading (`dark:text-zinc-200`), row container borders (`dark:border-zinc-700`), amount/text colors

- [ ] T007 [P] [US1] Update `app/_components/empty-state.tsx` — add `dark:` Tailwind classes: heading text (`dark:text-zinc-200`), description text (`dark:text-zinc-400`), CTA button background (`dark:bg-zinc-100 dark:text-zinc-900`) and hover

- [ ] T008 [US1] Update `app/page.tsx` and `app/expenses/page.tsx` — add `dark:` Tailwind classes to page-level elements: headings (`dark:text-zinc-100`), wrapper divs

**Checkpoint**: System-led dark mode fully functional — every component adapts to OS preference. Manual toggle not yet wired.

---

## Phase 3: User Story 2 — Manual Dark Mode Toggle (Priority: P2)

**Goal**: A visible toggle in the nav bar lets users switch between Light, Dark, and System modes. Choice persists across sessions.

**Independent Test**: Click the toggle to switch to Dark mode, refresh the page — app stays dark. Switch to Light mode while OS is in dark mode — app stays light. Switch to System — app follows OS preference.

### Implementation for User Story 2

- [ ] T009 [US2] Update `app/layout.tsx` — import and render `<ThemeToggle />` component in the navigation bar next to existing nav links

- [ ] T010 [US2] Wire theme-toggle persistence — verify that theme-toggle reads from localStorage on mount and writes on change. Handle the edge case where `"system"` mode requires listening to `matchMedia` changes and updating the `.dark` class in real time

**Checkpoint**: Manual toggle is fully functional and persists. All three modes (Light, Dark, System) work correctly.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality and fix any issues.

- [ ] T011 Run `npm run lint` and fix any ESLint errors in dark mode files

- [ ] T012 Run `npm run build` and fix any build errors

- [ ] T013 Verify the app renders correctly in both light and dark modes — check every page and component visually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Theme Infrastructure (Phase 1)**: No dependencies — can start immediately
- **System-Led Dark Mode (Phase 2)**: Depends on Phase 1 (T001 for `@variant dark`)
- **Manual Toggle (Phase 3)**: Depends on Phase 1 (T002 for theme-toggle component) and Phase 2 (dark: classes on layout)
- **Polish (Phase 4)**: Depends on all phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 — no dependencies on other stories
- **User Story 2 (P2)**: Depends on Phase 1 (theme-toggle exists) — builds on top of US1's dark: class work

### Within Each Phase

- Infrastructure before components
- Classes before wiring
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

| Phase | Parallel Tasks |
|-------|---------------|
| Phase 1 (Infrastructure) | T001 and T002 can run in parallel |
| Phase 2 (US1) | T003 sequential (layout); T004-T008 all parallel within US1 |
| Phase 3 (US2) | T009 sequential; T010 follows |
| Phase 4 (Polish) | T011, T012, T013 sequential |

---

## Parallel Example: Phase 1 Infrastructure

```bash
# Both infrastructure tasks are independent:
Task: "Update globals.css with @variant dark and CSS vars"
Task: "Create theme-toggle client component"
```

## Parallel Example: Phase 2 System-Led Dark Mode

```bash
# All component updates are independent — different files:
Task: "Update add-expense-form.tsx with dark: classes"
Task: "Update expense-list.tsx with dark: classes"
Task: "Update dashboard-stats.tsx with dark: classes"
Task: "Update empty-state.tsx with dark: classes"
Task: "Update page files with dark: classes"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Theme Infrastructure
2. Complete Phase 2: System-Led Dark Mode
3. **STOP and VALIDATE**: Toggle OS dark mode, verify all components render correctly
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Phase 1 → Theme infrastructure ready
2. Add System-Led Dark Mode (US1) → Test independently → **MVP!**
3. Add Manual Toggle (US2) → Test independently → full dark mode support
4. Polish → production-ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No test framework is installed — tests are not included
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
