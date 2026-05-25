# Tasks: Person Wallet / Advance Ledger + Database Migration

**Input**: Design documents from `specs/006-person-wallet/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — manual testing and `npm run build` validation for this phase.

**Organization**: Tasks grouped by user story for independent implementation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database setup

- [x] T001 Install Prisma CLI and PostgreSQL driver (`npm install prisma @prisma/client`)
- [x] T002 Create `.env` with `DATABASE_URL` pointing to local PostgreSQL
- [x] T003 Initialize Prisma (`npx prisma init`) — generates `prisma/schema.prisma`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Write complete `prisma/schema.prisma` with all entities: User, Person, WalletTransaction, Expense, Category, Budget (from data-model.md)
- [x] T005 Run `prisma migrate dev --name init` to create PostgreSQL schema and generate Prisma client
- [x] T006 [P] Create Prisma client singleton in `src/server/db.ts` (globalThis pattern)
- [x] T007 [P] Create Person and WalletTransaction types in `src/server/types.ts`
- [x] T008 Create person Zod schemas in `src/server/schemas/person.ts` (name validation, create/update schemas)
- [x] T009 Create wallet transaction Zod schemas in `src/server/schemas/wallet.ts` (credit, debit, monthly query schemas)
- [x] T010 Update expense Zod schemas in `src/server/schemas/expense.ts` to reference Category ID instead of enum string
- [x] T011 Create localStorage → PostgreSQL migration script in `src/lib/migration.ts` (reads localStorage JSON export, validates, inserts via Prisma)
- [x] T012 Create `scripts/migrate-from-localstorage.ts` runner that executes migration and logs results

**Checkpoint**: Foundation ready — database, Prisma, types, schemas, and migration script are all in place

---

## Phase 3: User Story 1 - Manage Persons and Record Daily Credits (Priority: P1) 🎯 MVP

**Goal**: User can add a person, record daily credit entries with varying amounts, and view them in a monthly grid

**Independent Test**: Add a person, navigate to their monthly credit grid, enter amounts for various days, confirm each entry is saved and visible in the grid

### Implementation for User Story 1

- [x] T013 [US1] Create person CRUD server actions in `src/server/actions/persons.ts` (createPerson, getPersons)
- [x] T014 [US1] Create credit entry server action in `src/server/actions/wallet.ts` (createCredit)
- [x] T015 [US1] Create monthly credits query in `src/server/actions/wallet.ts` (getMonthlyCredits)
- [x] T016 [US1] Create `app/_components/person-list.tsx` component (list persons with balances, add person form)
- [x] T017 [US1] Create `app/persons/page.tsx` page (person list route)
- [x] T018 [US1] Create `app/_components/monthly-grid.tsx` component (calendar grid showing daily credit amounts, month navigation, click-to-edit cells)
- [x] T019 [US1] Create `app/persons/[id]/page.tsx` page (person detail with monthly grid)
- [x] T020 [US1] Update `app/layout.tsx` to add "Persons" nav link to the navigation bar
- [x] T021 [US1] Implement empty state for person list (no persons message + CTA button)

**Checkpoint**: User Story 1 is fully functional — persons can be created, daily credits recorded, and viewed in the monthly grid

---

## Phase 4: User Story 2 - Record Debits (Deductions / Returns / Spending) (Priority: P2)

**Goal**: User can record debit entries with notes against a person; balance decreases by the debit amount

**Independent Test**: Create a person with credit entries, record a debit with notes, confirm balance decreases and debit appears in history

### Implementation for User Story 2

- [x] T022 [US2] Create debit entry server action in `src/server/actions/wallet.ts` (createDebit — requires notes, allows negative balance)
- [x] T023 [US2] Create `app/_components/debit-form.tsx` component (debit form with amount, date, notes fields; notes required validation)
- [x] T024 [US2] Create `app/persons/[id]/debits/page.tsx` page (debit entry route)

**Checkpoint**: User Story 2 is fully functional — debits can be recorded against any person, balance updates, overdraft allowed

---

## Phase 5: User Story 3 - View Person-wise Summary and Transaction History (Priority: P3)

**Goal**: User can view a summary dashboard per person with total credited, total debited, current balance, and full transaction history

**Independent Test**: Create a person with multiple credits and debits, navigate to summary view, confirm all totals and transaction list entries are accurate

### Implementation for User Story 3

- [x] T025 [US3] Create summary and history query in `src/server/actions/wallet.ts` (getPersonSummary — aggregates credits, debits, balance; returns transaction list)
- [x] T026 [US3] Create transaction delete server action in `src/server/actions/wallet.ts` (deleteTransaction — removes individual credit or debit, per FR-015)
- [x] T027 [US3] Create `app/_components/person-summary.tsx` component (shows totals, balance, transaction list with delete button per row, empty state for no transactions)
- [x] T028 [US3] Create `app/persons/[id]/summary/page.tsx` page (summary route)

**Checkpoint**: User Story 3 is fully functional — summary and transaction history viewable per person, individual transactions deletable

---

## Phase 6: User Story 4 - Manage Persons (Edit / Delete) (Priority: P3)

**Goal**: User can edit a person's name or delete a person (with all transactions)

**Independent Test**: Create a person, edit their name, then delete them — confirm removal of person and all transactions

### Implementation for User Story 4

- [ ] T029 [US4] Add edit person name support to `src/server/actions/persons.ts` (updatePerson)
- [ ] T030 [US4] Add delete person server action in `src/server/actions/persons.ts` (deletePerson — cascading hard delete in Prisma transaction, per clarification)
- [ ] T031 [US4] Add edit and delete UI to `app/_components/person-list.tsx` (inline edit name, delete with confirmation dialog)
- [ ] T032 [US4] Add unique name warning to person creation UI (duplicate names allowed but display warning per edge case)

**Checkpoint**: User Story 4 is fully functional — persons can be edited and deleted, all associated transactions removed on delete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Migration, dashboard updates, and cleanup

- [ ] T033 [P] Update existing expense server actions (`src/server/actions/add-expense.ts`, `src/server/actions/delete-expense.ts`) to write to PostgreSQL via Prisma (backward-compatible signatures)
- [ ] T034 Update existing expense components to use PostgreSQL-backed server actions (replace localStorage calls)
- [ ] T035 Update `app/page.tsx` (Dashboard) to show Person Wallet summary (total persons, total wallet balance) alongside existing expense data
- [ ] T036 Run localStorage migration script and verify data integrity (expense count, sum, category distribution match)
- [ ] T037 Remove or disable deprecated localStorage fallback code in `src/lib/storage.ts`
- [ ] T038 Run `npm run build` to verify no TypeScript or lint errors
- [ ] T039 Run `npm run lint` and fix any lint issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion — P1 MVP
- **User Story 2 (Phase 4)**: Depends on US1 completion (needs persons to exist)
- **User Story 3 (Phase 5)**: Depends on US1 + US2 completion (needs transactions for summary)
- **User Story 4 (Phase 6)**: Depends on US1 completion (needs persons to edit/delete)
- **Polish (Phase 7)**: Depends on all desired stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundational only — can start immediately after Phase 2
- **User Story 2 (P2)**: Depends on US1 — needs person creation and credit recording
- **User Story 3 (P3)**: Depends on US1 + US2 — needs transactions for meaningful summary display
- **User Story 4 (P3)**: Depends on US1 — needs persons to manage

### Parallel Opportunities

- T006 and T007 can run in parallel (different files, no overlap)
- All tasks within a phase marked [P] can run in parallel
- Once Foundational completes, US1 can start immediately
- US4 (edit/delete) can theoretically start alongside US2/US3 once US1 provides person list UI

---

## Parallel Example: User Story 1

```bash
# Launch Person and Wallet action files together:
Task: "Create person CRUD server actions in src/server/actions/persons.ts"
Task: "Create credit entry server action in src/server/actions/wallet.ts"

# Launch components together (different files):
Task: "Create person-list.tsx component"
Task: "Create monthly-grid.tsx component"

# Launch pages together:
Task: "Create app/persons/page.tsx"
Task: "Create app/persons/[id]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup — Prisma + PostgreSQL configured
2. Complete Phase 2: Foundational — schema, migrations, types, schemas
3. Complete Phase 3: User Story 1 — persons and daily credits
4. **STOP and VALIDATE**: Test US1 independently — add person, record credits, view grid
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Database foundation ready
2. Add User Story 1 → Persons + credits → **MVP!**
3. Add User Story 2 → Debits complete the ledger
4. Add User Story 3 → Summary and history views
5. Add User Story 4 → Full CRUD management
6. Polish → Migration, dashboard, cleanup

### Migration Timing

- The localStorage → PostgreSQL migration should be the last step before the full switch-over
- All existing functionality (expense tracker) continues working via localStorage until Phase 7
- The migration script validates and imports existing data just before the switch

---

## Notes

- [P] tasks = different files, no dependencies
- [US1-4] labels map tasks to specific user stories for traceability
- Each user story should be independently completable and testable
- Commit after each logical group of tasks
- Stop at any checkpoint to validate story independently
- No test framework is installed — validation via manual testing and `npm run build`
- Existing expense tracker functionality must remain working until migration in Phase 7
