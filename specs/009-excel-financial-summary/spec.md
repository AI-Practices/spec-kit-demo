# Feature Specification: Excel Financial Summary Section

**Feature Branch**: `009-excel-financial-summary`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "Add a financial summary section at the bottom of the Excel sheet after all daily entries. Summary rows should include: Monthly Savings, Last Month Remaining, Give Back for Daily Expenses, Loan Amount, Balance for Next Month. Each summary row should automatically calculate monthly totals using Excel formulas. Negative values should represent debit/deduction amounts. The Balance for Next Month row should calculate the final remaining balance after all credits, debits, and loans. Exported Excel should preserve formulas and formatting so users can manually edit values if needed. Imported Excel should also read these summary values and sync them with dashboard totals and reports. Apply proper currency formatting, bold summary rows, and highlighted cells for better readability."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export Monthly Ledger with Financial Summary Section (Priority: P1)

A user exports an existing month's transactions as a monthly ledger Excel file. The exported file contains all daily credit and debit entries per the existing format, plus a new financial summary section appended below the daily entries. The summary auto-calculates: Monthly Savings (net of all credits minus debits), Last Month Remaining (carryover balance), Give Back for Daily Expenses (total debits this month, shown as a negative deduction), Loan Amount (any loan entries, shown as negative deduction), and Balance for Next Month (final remaining after all items). The summary rows are formatted with bold text, currency formatting, and highlighted cells. The user can see their overall financial position for the month at a glance.

**Why this priority**: The financial summary is the primary deliverable — it transforms the Excel from a raw transaction log into a complete monthly financial statement that approximates what users would create manually. Export is the primary use case because most users view the summary when reviewing their monthly finances offline.

**Independent Test**: Can be fully tested by exporting a month with known credit and debit data, opening the .xlsx file, verifying the summary section exists below the last data row, confirming all five summary labels are present, checking that Monthly Savings = total credits - total debits (with correct sign), and validating that the Balance for Next Month formula produces the correct final value.

**Acceptance Scenarios**:

1. **Given** a month has recorded credits and debits for a person, **When** the user exports that month as Excel, **Then** the generated .xlsx file contains a financial summary section starting 2 rows below the last daily entry row
2. **Given** the exported file is opened in Excel, **When** the user inspects the summary section, **Then** the following rows appear in order: Monthly Savings, Last Month Remaining, Give Back for Daily Expenses, Loan Amount, Balance for Next Month
3. **Given** the exported file, **When** the summary values are inspected, **Then** Monthly Savings = total credits - total debits for the month (positive for surplus, negative for deficit)
4. **Given** the exported file, **When** Give Back for Daily Expenses is inspected, **Then** the value equals the sum of all debits for the month displayed as a negative number
5. **Given** the exported file, **When** Balance for Next Month is inspected, **Then** the value = Monthly Savings + Last Month Remaining + Give Back for Daily Expenses + Loan Amount (with deductions shown as negative)
6. **Given** the exported file, **When** opened in Excel, **Then** all summary values are computed via Excel formulas (not hard-coded numbers), allowing users to edit source data and see recalculated summaries
7. **Given** the exported file, **Then** the Monthly Savings row, Give Back row, and Loan Amount row auto-calculate using Excel SUM formulas that reference the daily entries above them

---

### User Story 2 - Import Excel with Summary Values Synced to Dashboard (Priority: P2)

A user fills out the monthly ledger template (including the financial summary section), enters or edits summary values offline, and uploads the file. The system reads the summary rows and syncs them with the dashboard totals, monthly reports, and wallet balance display. The summary values are stored alongside the imported transactions and reflected in the UI after import.

**Why this priority**: The summary section must serve as a bidirectional data channel — what the user enters or edits in Excel should update the dashboard and reports. This ensures the Excel file is a true offline editing tool and not just an export-only view.

**Independent Test**: Can be fully tested by exporting a month, editing a summary value (e.g., adding a Loan Amount), re-importing the file, and confirming the dashboard shows the updated loan figure and recalculated balance.

**Acceptance Scenarios**:

1. **Given** the user has an exported Excel file with summary values, **When** they re-import it, **Then** the system reads the Balance for Next Month value from the summary section and updates the person's wallet balance accordingly
2. **Given** the imported file contains a non-zero Loan Amount, **When** the import completes, **Then** the dashboard and reports reflect the loan as a separate line item in the monthly financial overview
3. **Given** the imported file contains a Give Back for Daily Expenses value, **When** the import completes, **Then** the total monthly expenses shown in the dashboard matches the Give Back value
4. **Given** the imported file contains Monthly Savings and Balance for Next Month values, **When** the import completes, **Then** the monthly report displays these values in the savings and balance summary sections

---

### User Story 3 - Manually Edit Summary Values Offline (Priority: P3)

A user opens an exported Excel file, manually modifies credit/debit amounts in the daily entries section, and the summary formulas automatically recalculate. The user can also override a summary value (e.g., enter a corrected Loan Amount) and the Balance for Next Month updates accordingly. The user then saves and re-imports the modified file. The system uses the manually edited values where provided and auto-calculated values from formulas where no override exists.

**Why this priority**: Excel formulas provide flexibility for advanced users who want to make adjustments offline. This enables scenarios where the user has additional information not captured in the app (e.g., a loan that was approved outside the app).

**Independent Test**: Can be fully tested by exporting a file, changing a debit amount in the daily entries section, verifying the Give Back and Balance for Next Month formulas recalculate in Excel, and re-importing to confirm the changes propagate to the dashboard.

**Acceptance Scenarios**:

1. **Given** an exported Excel file, **When** the user modifies a debit amount in the daily entries section, **Then** the Give Back for Daily Expenses and Balance for Next Month formulas recalculate automatically in Excel
2. **Given** the user exported a file with formulas, **When** they enter a hard-coded value in the Last Month Remaining row (overriding any formula), **Then** the Balance for Next Month recalculates using the new value
3. **Given** the user re-imports a modified file, **When** the system processes the summary section, **Then** it uses the cell values as-is (whether formula results or manual overrides) and syncs them to the dashboard

---

### Edge Cases

- What happens when the summary formulas reference cells that contain no data (empty month)?
- How does the system handle missing summary rows in an imported file (e.g., user deleted the Loan Amount row)?
- What if the Balance for Next Month calculation overflows or produces a non-numeric result?
- How are date boundaries handled — should the Last Month Remaining default to zero for the first month of using the app?
- What happens if a user imports a file with manual values that contradict the auto-calculated formula results?
- How should the system handle a corrupted formula in the summary section (e.g., `#REF!` or `#VALUE!` errors)?
- What if the Give Back value in the summary section doesn't match the sum of debits from the daily entries?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST append a financial summary section to the exported monthly ledger Excel file, positioned 2 blank rows below the last daily entry row
- **FR-002**: The summary section MUST contain exactly 5 rows in this order: Monthly Savings, Last Month Remaining, Give Back for Daily Expenses, Loan Amount, Balance for Next Month
- **FR-003**: Monthly Savings MUST be calculated as total credits minus total debits for the month (positive for surplus, negative for deficit), displayed as a formula referencing the daily entry cells above
- **FR-004**: Give Back for Daily Expenses MUST equal the sum of all debit amounts for the month, displayed as a negative value using an Excel SUM formula referencing the debit rows above
- **FR-005**: Loan Amount MUST represent the total of all loan-related entries for the month, displayed as a negative deduction. The Loan Amount is a manually entered line item in the Excel summary section only — it is not stored as individual transactions in the database. During import, the system reads the cell value and syncs it to the monthly report as a standalone figure.
- **FR-006**: Last Month Remaining MUST represent the carryover balance from the previous month. During export, the system MUST auto-populate this value from the database by querying the previous month's Balance for Next Month for the same person. If no prior month data exists, it defaults to zero.
- **FR-007**: Balance for Next Month MUST calculate as: `Monthly Savings + Last Month Remaining + Give Back for Daily Expenses + Loan Amount`, where Give Back and Loan Amount are negative values (deductions)
- **FR-008**: All summary values MUST be computed using Excel formulas (not hard-coded static values) when generating the export, so that editing source data in Excel automatically recalculates the summary
- **FR-009**: Summary rows MUST use bold font weight for both the label column and the value column to visually distinguish them from daily entry rows
- **FR-010**: Summary values MUST be formatted with the user's configured currency symbol and 2 decimal places
- **FR-011**: The Balance for Next Month cell MUST be highlighted with a distinct background color (e.g., light green for positive, light red for negative) for better readability
- **FR-012**: All summary label cells MUST be left-aligned in the Description column, and all summary value cells MUST be right-aligned in the Total column with consistent currency formatting
- **FR-013**: During import, the system MUST read the cell values (not formulas) from the summary rows and sync them with the corresponding dashboard fields and monthly report data
- **FR-014**: After importing a file with summary values, the system MUST update the person's wallet balance using the imported Balance for Next Month value
- **FR-015**: If a summary row is missing from an imported file, the system MUST treat it as zero and not fail the import (graceful degradation)
- **FR-016**: If a summary cell contains an Excel error value (`#REF!`, `#VALUE!`, `#DIV/0!`, etc.) during import, the system MUST warn the user with the cell location and the error type, but allow the import to proceed using zero for that value
- **FR-017**: Last Month Remaining MUST default to zero when exporting the first month of data (no prior month exists)
- **FR-018**: The summary section MUST be separated from daily entries by at least 2 blank rows to prevent accidental overlap with daily transaction data
- **FR-019**: Negative summary values (Give Back for Daily Expenses, Loan Amount) MUST be displayed with a leading minus sign and without parentheses (standard financial negative notation)
- **FR-020**: The exported Excel MUST include column headers for the summary section (e.g., "Summary" label in the Description column, "Amount" in the Total column) to clearly delineate the section

### Key Entities *(include if feature involves data)*

- **Financial Summary Row**: A single row in the monthly ledger representing a financial aggregate. Each row has a name/label (text) and a computed value (numeric, from Excel formula). The five rows together form a complete monthly financial picture. During import, the values are extracted and stored as summary data points for the month.
- **Monthly Financial Summary**: The collection of all five summary values for a given person and month. This is a derived data set computed from transactions during export and read from the Excel during import. It feeds into dashboard metrics, monthly reports, and wallet balance calculations.
- **Carryover Balance (Last Month Remaining)**: The net balance carried from the previous month. This is stored per-person per-month and serves as the starting point for the current month's Balance for Next Month calculation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Exported Excel files include the financial summary section in under 5 seconds of generation time, even for months with 150+ transactions
- **SC-002**: 100% of summary formula calculations (Monthly Savings, Give Back, Balance for Next Month) match manual verification when tested against the same source data
- **SC-003**: Round-trip fidelity is maintained — importing an exported file (with no manual edits) produces summary values that exactly match the original calculations
- **SC-004**: Users can identify the summary section at a glance — the bold formatting, highlighted Balance for Next Month cell, and clear separation from daily entries make the section visually distinct
- **SC-005**: Summary values from import are reflected in dashboard totals and monthly reports within 2 seconds of import confirmation
- **SC-006**: Imports containing missing summary rows or Excel error values never fail entirely — the system degrades gracefully and processes all valid data

## Assumptions

- The monthly ledger Excel format defined in spec #008 is the foundation: column A = Description, columns B-AF = Days 1-31, column AG = Total. The summary section uses the same columns (Description label in column A, value in column AG).
- Monthly Savings = total credits - total debits. Positive means the user spent less than they earned; negative means they spent more.
- Give Back for Daily Expenses = total debits (sum of all debit transactions). This is always displayed as a negative number (deduction).
- Loan Amount is a manually entered line item in the Excel summary section only — it is not derived from individual transaction records. It appears as a deduction in the summary and is synced as a monthly report figure during import, but does not require changes to the existing transaction data model.
- Last Month Remaining is auto-populated during export by querying the database for the previous month's Balance for Next Month value. No manual entry or cross-sheet Excel formula is needed.
- The existing dashboard and report infrastructure supports adding new data fields for Monthly Savings, Last Month Remaining, Give Back, Loan Amount, and Balance for Next Month per person per month.
- Excel formula references only need to work within a single sheet (the month sheet). Cross-sheet or cross-workbook references are not required.
- The export preserves formulas using the `xlsx` library's formula write capability — cells are written with formula strings (e.g., `=SUM(B2:B10)`) rather than computed values.
- During import, the `xlsx` library provides both the formula string and the cached computed value. The system reads the computed value for syncing to the dashboard, not the formula string.
- The person's wallet balance after import equals the imported Balance for Next Month value (replace semantics — the summary value becomes the authoritative balance).
