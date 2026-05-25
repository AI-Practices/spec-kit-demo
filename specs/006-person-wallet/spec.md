# Feature Specification: Person Wallet / Advance Ledger

**Feature Branch**: `006-person-wallet`

**Created**: 2026-05-25

**Status**: Draft

**Input**: User description: "I need to add a new feature called **Person Wallet / Advance Ledger** in the budget tracker app. This feature should allow users to manage money separately for each person. Users can add daily credit entries (money given) with different amounts each day, similar to a monthly grid view. Users should also be able to add debit entries (money spent/deducted/returned) along with a debit reason or notes. Every entry must be stored as a transaction with fields like person, date, type (credit/debit), amount, and notes. The system should automatically calculate each person's current balance using all transactions. It should also show person-wise summaries including total credited amount, total debited amount, remaining balance, and transaction history. Since the app currently uses local storage, the database should be extended with separate structures/tables for persons and wallet_transactions. The design should support future features like reports, filters, exports, attachments, and cloud sync."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Persons and Record Daily Credits (Priority: P1)

The user adds a person (e.g., a family member or employee) and then records daily credit entries — money given to that person — with different amounts each day. A monthly grid view shows all credit entries organized by day, making it easy to see which days have been filled and what amounts were given.

**Why this priority**: Creating persons and recording daily credits is the core input action — without persons and credit entries, there are no balances or debits to track.

**Independent Test**: Can be fully tested by adding a person, navigating to their monthly credit grid, entering amounts for various days, and confirming each entry is saved and visible in the grid.

**Acceptance Scenarios**:

1. **Given** the user has no persons yet, **When** they add a person with a name, **Then** the person appears in the persons list
2. **Given** a person exists, **When** the user records a credit entry for a specific date with an amount, **Then** the entry is saved and appears in that day's cell in the monthly grid
3. **Given** the user views the monthly grid for a person, **When** they tap on an empty day cell and enter an amount, **Then** the credit is saved and the cell updates to show the amount
4. **Given** the user has recorded credits on multiple days, **When** they view the monthly grid, **Then** each day with a credit shows the amount and empty days remain editable

---

### User Story 2 - Record Debits (Deductions / Returns / Spending) (Priority: P2)

The user records debit entries against a person — money spent, deducted, or returned — along with a reason or notes explaining the debit. Each debit reduces the person's running balance.

**Why this priority**: Debits complete the two-directional ledger (money given vs money spent/returned), which is necessary for accurate balance calculation.

**Independent Test**: Can be fully tested by creating a person, recording credit entries, then recording a debit entry with notes, and confirming the balance decreases by the debit amount.

**Acceptance Scenarios**:

1. **Given** a person exists with a positive balance, **When** the user records a debit entry with an amount and notes, **Then** the debit is saved and the person's balance decreases by the debit amount
2. **Given** the user is recording a debit, **When** they submit without providing notes/reason, **Then** a validation error is shown and the debit is not saved
3. **Given** the user records a debit, **When** the amount exceeds the current balance, **Then** the balance may become negative (overdraft allowed or subject to business rules)

---

### User Story 3 - View Person-wise Summary and Transaction History (Priority: P3)

The user views a summary dashboard for each person showing total credited amount, total debited amount, current balance, and a full transaction history (all credits and debits) sorted by date.

**Why this priority**: Reviewing balances and history is where users derive value from the feature — understanding how much was given, spent, and remains.

**Independent Test**: Can be fully tested by creating a person with multiple credits and debits, navigating to their summary view, and confirming all totals, balance, and transaction list entries are correct.

**Acceptance Scenarios**:

1. **Given** a person has multiple credit and debit entries, **When** the user views the person summary, **Then** the total credited amount, total debited amount, and current balance are displayed and accurate
2. **Given** a person has transactions, **When** the user views their transaction history, **Then** all entries are listed sorted by date (newest first) with type, amount, date, and notes visible
3. **Given** a person has no transactions, **When** the user views their summary, **Then** all totals show zero and the transaction history shows an empty state

---

### User Story 4 - Manage Persons (Edit / Delete) (Priority: P3)

The user edits a person's name or deletes a person they no longer need to track. Deleting a person removes all their associated transactions.

**Why this priority**: Person management is necessary for correcting mistakes or cleaning up unused entries, but is not part of the daily workflow.

**Independent Test**: Can be fully tested by creating a person, editing their name, then deleting them and confirming they and their transactions are removed.

**Acceptance Scenarios**:

1. **Given** a person exists, **When** the user edits their name, **Then** the name is updated in all views
2. **Given** a person exists with transactions, **When** the user deletes the person, **Then** the person and all their associated transactions are removed

### Edge Cases

- **Duplicate person names**: If a user tries to add a person with the same name as an existing person, the system should allow it (names are not unique identifiers) but consider displaying a warning
- **Empty person list**: When no persons exist, the app shows an empty state with a message and call-to-action to add the first person
- **Overdraft / negative balance**: When a debit exceeds the current balance, the balance goes negative; future credits restore it
- **Zero-amount transactions**: Credit and debit entries with zero amount are rejected with a validation message
- **Future dates**: The system allows future dates for planned credits but clarifies they are projections; the current balance calculation includes all entries regardless of date
- **Storage full**: If localStorage quota is exceeded, the app displays a user-friendly error message with guidance to free up space

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to add a person with a name; the person is added to a persistent list
- **FR-002**: Users MUST be able to view a list of all persons with their current balance displayed alongside each name
- **FR-003**: Users MUST be able to edit a person's name after creation
- **FR-004**: Users MUST be able to delete a person; deleting a person MUST also remove all their associated transactions
- **FR-005**: Users MUST be able to record a credit entry for a person with a date and a positive amount; the entry type MUST be marked as credit
- **FR-006**: Users MUST be able to view a monthly grid for each person showing credit entries organized by day of the month; days without entries remain editable
- **FR-007**: Users MUST be able to navigate between months in the monthly grid view
- **FR-008**: Users MUST be able to record a debit entry for a person with a date, positive amount, and required notes/reason; the entry type MUST be marked as debit
- **FR-009**: The system MUST automatically calculate and display each person's current balance as total credits minus total debits across all their transactions
- **FR-010**: Users MUST be able to view a per-person summary showing total credited amount, total debited amount, and current balance
- **FR-011**: Users MUST be able to view a chronological transaction history per person, displaying type, date, amount, and notes for each entry
- **FR-012**: All person data and transaction data MUST persist across page reloads via local storage
- **FR-013**: The system MUST reject credit or debit entries with zero or negative amounts with a validation message
- **FR-014**: When no persons exist, the app MUST display an empty state with a message and call-to-action to add the first person
- **FR-015**: The data structures for persons and transactions MUST be designed to support future features including reports, filters, exports, attachments, and cloud sync without requiring data migration

### Key Entities *(include if feature involves data)*

- **Person**: Represents an individual for whom money is managed. Attributes: id (UUID, auto-generated), name (free text), created date. A person has zero or more wallet transactions.
- **Wallet Transaction**: Represents a single financial event (credit or debit) for a person. Attributes: id (UUID, auto-generated), person id (reference to the associated person), date (calendar date), type (credit or debit), amount (positive integer cents), notes (free text, required for debits, optional for credits), created timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add a new person and record a daily credit entry in under 30 seconds
- **SC-002**: A user can view the monthly credit grid, navigate between months, and see daily amounts within 1 second
- **SC-003**: Balances are always accurate — each person's displayed balance equals the sum of all credits minus all debits for that person
- **SC-004**: The person summary view loads and displays correct totals for up to 50 persons with 1000 transactions each within 2 seconds
- **SC-005**: All data persists correctly across page reloads and browser sessions

## Assumptions

- Single-user personal app — no authentication or multi-user support needed (consistent with existing expense tracker)
- Data is stored client-side using local storage with a typed wrapper pattern (no backend server required for v1)
- Monetary amounts are handled as integer cents to avoid floating-point precision issues (consistent with existing app)
- Single currency — no multi-currency support in v1
- Persons are identified by UUID generated via `crypto.randomUUID()`, not by name (duplicate names are allowed)
- Persons start with a zero balance; no initial deposit/opening balance in v1
- Debit notes/reason are required; credit notes are optional
- No recurring or scheduled transactions in v1
- No transaction editing — corrections are handled by deleting and re-entering
- No export, reporting, filtering, attachments, or cloud sync in this iteration (these are explicitly marked as future goals)
- The persons list and wallet data are stored separately from the existing expenses data structure
