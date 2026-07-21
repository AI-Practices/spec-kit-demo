# Tasks: Excel Financial Summary Section

**Input**: Design documents from `/specs/009-excel-financial-summary/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test framework configured — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/` at repository root, `prisma/` for schema

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

No setup tasks needed — `xlsx` and Prisma are already installed from spec #008. The project is fully initialized.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 Add MonthlySummary model to prisma/schema.prisma with fields: id, userId, personId, month, year, monthlySavings, lastMonthRemaining, giveBackForExpenses, loanAmount, balanceForNextMonth, createdAt, updatedAt. Include relations to User and Person, @@unique([personId, month, year]), and indexes.
- [X] T002 Run Prisma migration: `npx prisma migrate dev --name add_monthly_summary`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Export Monthly Ledger with Summary Section (Priority: P1) 🎯 MVP

**Goal**: Exported Excel files include a financial summary section below daily entries with 5 auto-calculated rows using Excel formulas and currency formatting.

**Independent Test**: Export a month with known credit/debit data, open .xlsx, verify 5 summary rows exist with labels in order, confirm Monthly Savings = credits - debits, confirm formulas auto-calculate when values are edited in Excel.

### Implementation for User Story 1

- [ ] T003 [P] [US1] Add buildMonthlySavingsFormula() and buildGiveBackFormula() helper functions to lib/excel-utils.ts that generate Excel formula strings referencing daily entry cells above the summary section
- [ ] T004 [P] [US1] Add buildSummarySection() function to lib/excel-utils.ts that appends 5 summary rows (Monthly Savings, Last Month Remaining, Give Back for Daily Expenses, Loan Amount, Balance for Next Month) with formulas via `f` property and currency format via `z: '#,##0.00'` to an existing worksheet
- [ ] T005 [US1] Extend export-transactions.ts to query the previous month's MonthlySummary.balanceForNextMonth for lastMonthRemaining, then call buildSummarySection() after createMonthlyLedger() and return the enriched buffer

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 — Import with Summary Values Synced (Priority: P2)

**Goal**: Import reads the 5 summary row values from the uploaded Excel and upserts them into the MonthlySummary table, syncing dashboard totals and wallet balance.

**Independent Test**: Export a month, manually edit a value (e.g., loan amount), re-import, and verify the dashboard shows the updated value and recalculated balance.

### Implementation for User Story 2

- [ ] T006 [P] [US2] Add parseSummaryRows() function to lib/excel-utils.ts that reads computed cell values (`v` property) from the 5 summary rows and returns typed summary data (or null if no summary section found)
- [ ] T007 [US2] Extend import-transactions.ts to call parseSummaryRows() after parseWorkbook(), include summary data in preview response, and upsert MonthlySummary record on confirmed import (update person wallet balance using balanceForNextMonth)
- [ ] T008 [P] [US2] Extend download-template.ts to call buildSummarySection() with zero values after createTemplate() so the template includes an empty summary section
- [ ] T009 [US2] Add monthlySummary.deleteMany() to the deletePerson transaction in src/server/actions/persons.ts so summaries cascade when a person is deleted

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 — Manual Edit & Edge Cases (Priority: P3)

**Goal**: Users can manually override summary values in Excel, and the system handles missing/error summary rows gracefully during import.

**Independent Test**: Export a file, override a summary value with a manual number, delete a summary row, re-import, and verify the system uses provided values (or zeros for missing) without failing.

### Implementation for User Story 3

- [ ] T010 [US3] Handle manual override detection in parseSummaryRows() — read cell values as-is regardless of whether they come from formula results or manual entry
- [ ] T011 [P] [US3] Handle missing summary rows during import in import-transactions.ts — treat absent rows as zero and proceed without error (FR-015)
- [ ] T012 [P] [US3] Handle Excel error values (#REF!, #VALUE!, #DIV/0!) in summary cells during import — warn user with cell location and error type, treat as zero (FR-016)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T013 Document the xlsx Community Edition formatting limitation (bold, colors, alignment are Pro-only) in a README or inline comment for future reference
- [ ] T014 Verify round-trip fidelity: export → open in Excel → re-import, confirm summary values match original calculations (SC-003)
- [ ] T015 Confirm import gracefully handles edge cases: empty month, first month (lastMonthRemaining = 0), corrupted formula cells

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — empty phase (fully initialized from #008)
- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5) in priority order
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 for buildSummarySection (shared in excel-utils.ts), but parseSummaryRows can be written in parallel
- **User Story 3 (P3)**: Depends on US2 for import flow — extends existing import behavior

### Within Each User Story

- Shared library functions ([P] marked) before integration tasks
- Integration commits the story's full feature
- Story complete before moving to next priority

---

## Parallel Opportunities

- T003 and T004 can run in parallel (different helper functions in same file — low conflict risk if function order maintained)
- T006 and T008 can run in parallel (parseSummaryRows in excel-utils.ts, download-template.ts — unrelated files)
- T011 and T012 can run in parallel (different edge case handlers)
- All [P]-marked tasks within a phase are safe to parallelize

### Parallel Example: Phase 3 (User Story 1)

```bash
# Launch formula helpers together:
Task: "Add buildMonthlySavingsFormula() and buildGiveBackFormula() to lib/excel-utils.ts"
Task: "Add buildSummarySection() to lib/excel-utils.ts"

# Then integrate:
Task: "Extend export-transactions.ts to call buildSummarySection()"
```

### Parallel Example: Phase 4 (User Story 2)

```bash
# Launch parse and template together:
Task: "Add parseSummaryRows() to lib/excel-utils.ts"
Task: "Extend download-template.ts with empty summary section"

# Then integrate:
Task: "Extend import-transactions.ts to read and store summary values"
Task: "Add MonthlySummary cascade delete in persons.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (Prisma migration)
2. Complete Phase 3: User Story 1 (export summary section)
3. **STOP and VALIDATE**: Export a month's data, open in Excel, verify summary rows and formulas
4. Deploy/demo MVP if ready

### Incremental Delivery

1. Complete Foundational + US1 → Export with summary ready (MVP!)
2. Add US2 → Import reads and syncs summary values
3. Add US3 → Graceful handling of manual edits and edge cases
4. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies (or low-conflict same-file additions)
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Formatting limitation**: xlsx Community Edition v0.18.5 does NOT support bold text, fill colors, or cell alignment. FR-009, FR-011, FR-012 cannot be satisfied with the current library. Only number formats (currency) via `z` property are supported. See research.md for options (switch to exceljs, upgrade to Pro, or accept formulas-only).
