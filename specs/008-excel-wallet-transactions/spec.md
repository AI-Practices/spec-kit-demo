# Feature Specification: Excel Wallet Transactions

**Feature Branch**: `008-excel-wallet-transactions`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "Add Excel import/export support for Person Wallet transactions. Excel should use a monthly ledger format (example: `May-2026`). Credits should be entered as daily vertical values and imported as individual `CREDIT` transactions. Debits should support single-line formula/string format like `=SUM(-4100-900-1020)` and create multiple `DEBIT` transactions automatically. After Excel upload, balances, dashboard, donut charts, and transaction history should refresh automatically. Provide Excel template download matching the required format. Add import validation, preview modal, and error handling for invalid data/formulas. Exported Excel should maintain the same ledger-style layout for easy editing and re-uploading."

## Clarifications

### Session 2026-05-26

- Q: How should the system handle duplicate transactions or re-importing the same month? → A: Re-uploading for the same month replaces existing transactions — delete old records for that person+month, insert new ones from the uploaded file. No separate duplicate detection is needed.
- Q: How should multi-sheet Excel files be handled? → A: Detect all month-named sheets, let the user select which sheet to import via a dropdown in the preview modal. One sheet per import session.
- Q: How should out-of-range day cells (e.g., Day 31 in April) be handled? → A: Flag as a warning in the preview modal with cell location, skip that cell during import, but allow the rest of the valid data to proceed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Download Monthly Ledger Template (Priority: P1)

The user wants to download an Excel template that matches the required monthly ledger format. The template serves as the canonical starting point for offline data entry. It contains a pre-formatted sheet named with the current month (e.g., `May-2026`), with correct column headers (day columns 1-31, description, total) and example rows showing the expected credit and debit entry patterns.

**Why this priority**: Without a template, users have no reference for the expected file format, which would lead to frequent upload errors and confusion. The template is the entry point for the entire import workflow.

**Independent Test**: Can be fully tested by clicking the "Download Template" button, verifying the downloaded `.xlsx` file opens correctly in Excel/Sheets, confirming the sheet name matches the current month, and checking that column headers and example rows follow the documented format.

**Acceptance Scenarios**:

1. **Given** the user is on any Person Wallet page, **When** they click "Download Template", **Then** an `.xlsx` file is downloaded with a sheet named for the current month (e.g., `May-2026`)
2. **Given** the downloaded template, **When** the user opens it in Excel or Google Sheets, **Then** row 1 contains column headers: Description, Day 1 through Day 31, and Total
3. **Given** the downloaded template, **When** the user inspects it, **Then** it includes at least one example credit row and one example debit formula row demonstrating the expected format
4. **Given** the user's preferred currency is set, **When** the template is generated, **Then** the Total column header uses the correct currency symbol for context

---

### User Story 2 - Import a Completed Ledger with Preview and Validation (Priority: P1)

The user fills out the template with their monthly transactions offline and uploads it to import all credits and debits at once. Before finalizing, the user sees a preview modal showing all parsed transactions — individual credits (one per day-cell with value) and individual debits (parsed from the `=SUM(...)` formula). The user can review the data, see any errors or warnings, and either confirm the import or cancel.

**Why this priority**: This is the core value of the feature — batch importing a month of transactions. The preview and validation steps prevent accidental imports of incorrect data, which is critical for financial record-keeping.

**Independent Test**: Can be fully tested by uploading a valid Excel file, verifying the preview modal shows the correct number of parsed credit and debit transactions with correct amounts and dates, confirming the import button commits them to the database, and checking that the transaction history reflects the new entries.

**Acceptance Scenarios**:

1. **Given** the user has a completed Excel ledger, **When** they select and upload the file, **Then** the system parses the file and displays a preview modal showing all detected credits (one per day-cell) and debits (one per amount in the formula)
2. **Given** the preview modal is open, **When** the user reviews the data, **Then** each transaction displays: type (credit/debit), date, amount (formatted in user's currency), and description
3. **Given** the preview shows valid data, **When** the user clicks "Import", **Then** all transactions are committed to the database as individual WalletTransaction records
4. **Given** the import completes successfully, **When** the modal closes, **Then** the current page's balances, transaction history, dashboard stats, and donut charts refresh automatically to reflect the new data
5. **Given** the preview modal is open, **When** the user clicks "Cancel", **Then** no transactions are committed and the modal closes

---

### User Story 3 - Import with Validation Errors (Priority: P2)

The user uploads a file that contains invalid data — a malformed formula, a non-numeric value in a credit cell, a missing sheet, or a date mismatch. The system validates the entire file before showing the preview and reports all errors clearly, highlighting which cells/rows need correction. The user can fix the file and re-upload without losing their other valid entries.

**Why this priority**: Financial data must be accurate. Validation with clear error messages prevents silent data corruption and guides the user toward the correct format. This reduces support burden and builds trust.

**Independent Test**: Can be fully tested by uploading files with various errors (bad formula syntax, text in amount cells, missing sheet, out-of-range day) and confirming each produces a clear, specific error message and blocks the import.

**Acceptance Scenarios**:

1. **Given** the uploaded file contains a formula with non-numeric tokens (e.g., `=SUM(-4100-abc-1020)`), **When** the system validates, **Then** the error message identifies the exact formula text, the invalid token "abc", and the cell location
2. **Given** the uploaded file contains a credit cell with non-numeric text, **When** the system validates, **Then** the error message identifies the cell (sheet, row, column) and the invalid value
3. **Given** the uploaded file is missing the expected month sheet or has an unrecognized sheet name format, **When** the system validates, **Then** the error message states which sheet was expected and which sheets were found
4. **Given** the uploaded file contains a mix of valid and invalid rows, **When** the system validates, **Then** all errors are reported together and no partial import occurs — the user must fix all errors and re-upload
5. **Given** the user sees validation errors, **When** they close the error display and re-upload a corrected file, **Then** the corrected file is parsed and validated fresh with no residual state from the previous attempt

---

### User Story 4 - Export Transactions as Monthly Ledger (Priority: P2)

The user wants to export their existing transactions for a selected month as an Excel file matching the same monthly ledger format. This allows them to review, edit offline, and re-upload the data. The export includes all credits and debits for that person and month, formatted exactly like the import template.

**Why this priority**: Export enables an offline edit cycle — users can download current data, make changes in Excel, and re-import. This bridges the gap between the app and spreadsheet-based workflows that many finance users rely on.

**Independent Test**: Can be fully tested by exporting transactions for a person/month with known data, opening the file, verifying all credits appear as daily amounts in the correct day cells, and all debits appear as `=SUM(...)` formulas.

**Acceptance Scenarios**:

1. **Given** the user has recorded transactions for a person, **When** they select a month and click "Export", **Then** an `.xlsx` file downloads with a sheet named the selected month (e.g., `June-2026`)
2. **Given** the exported file, **When** opened in Excel, **Then** credits appear as daily amounts under the correct day columns with their descriptions in the Description column
3. **Given** the exported file, **When** opened in Excel, **Then** debits for the same day are grouped into `=SUM(-amount1-amount2-...)` formulas in a single row with a description
4. **Given** the exported file matches the template format, **When** the user re-uploads it without changes, **Then** it passes validation and imports successfully (round-trip fidelity)
5. **Given** the user exports for a month with no transactions, **When** the file is generated, **Then** it contains the sheet with empty data rows and the correct headers (empty template)

---

### Edge Cases

- What happens when the uploaded Excel contains a day number that doesn't exist in that month (e.g., Day 31 in April)? (Resolved: flagged as warning in preview, skipped during import, rest of data proceeds)
- How does the system handle duplicate transactions — same person, same date, same amount, same type? (Resolved: re-uploading the same month replaces existing data entirely — no separate dedup needed)
- What if the formula `=SUM(...)` contains only zeros or only positive numbers?
- How are credit descriptions handled when the Description column is empty for a credit row?
- What happens when the sheet name uses a different date format (e.g., `May-2026` vs `2026-05` vs `05/2026`)?
- How does the system handle Excel files with multiple sheets (e.g., multiple months)? (Resolved: user selects one sheet via dropdown in preview modal)
- What if the file is not a valid Excel format (corrupted .xlsx, .csv, etc.)?
- How are timezone-sensitive dates handled across import and export?
- What if the import creates a negative balance (more debits than existing credits)?
- How does rounding handle fractional amounts from formula parsing?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a downloadable Excel template (.xlsx) that follows the monthly ledger format with a sheet named for the current month, description column, day columns 1-31, and a total column
- **FR-002**: System MUST accept uploaded Excel files (.xlsx) and parse them according to the monthly ledger format
- **FR-003**: System MUST treat each non-empty credit cell (at the intersection of a credit row and a day column) as a single CREDIT transaction with date set to the corresponding day of the month
- **FR-004**: System MUST parse debit formula strings in the format `=SUM(-amount1-amount2-amount3)` and create individual DEBIT transactions for each absolute amount value found within the parentheses
- **FR-005**: System MUST display a preview modal after parsing, showing all detected transactions grouped by type with their dates, amounts, and descriptions before the user confirms import
- **FR-006**: System MUST validate all parsed data against the existing transaction validation rules (positive amounts, non-empty notes for debits, valid dates) before allowing import
- **FR-007**: System MUST reject imports that contain any validation errors and display all errors in a structured format identifying the sheet, row, column, and specific issue
- **FR-008**: System MUST prevent partial imports — either all transactions in a file are committed or none, with clear error reporting
- **FR-009**: After successful import, system MUST trigger automatic refresh of the person's balance, dashboard wallet stats, donut chart data, and transaction history views
- **FR-010**: System MUST support exporting a person's transactions for a selected month as an .xlsx file in the same monthly ledger format as the import template
- **FR-011**: System MUST handle formula parsing with non-numeric tokens as validation errors, stopping the import and reporting the exact issue
- **FR-012**: System MUST gracefully handle malformed, corrupted, or invalid Excel files with a user-friendly error message rather than crashing or producing partial results
- **FR-013**: System MUST respect the existing WalletTransaction data model — imported credit amounts stored as positive integers in cents, debit amounts as positive integers in cents, with type field set appropriately
- **FR-014**: System MUST use the existing person-scoped data isolation — imported transactions are associated with a specific person and user
- **FR-015**: When importing into a month that already has transactions for the selected person, system MUST delete all existing transactions for that person+month before inserting the new data (replace semantics)

### Key Entities *(include if feature involves data)*

- **Monthly Ledger (Excel Workbook)**: Represents one month of transactions for a given person. Contains a single sheet named `<Month>-<Year>` (e.g., `May-2026`). The sheet has columns: Description, Day 1 through Day 31, and Total. Rows are either credit entries (daily amounts in day columns) or debit entries (formula in the Total column, description in Description column).
- **Parsed Transaction (Import Preview)**: An in-memory representation of a single transaction detected during Excel parsing. Contains: type (credit/debit), date (derived from sheet month + day column), amount (in currency units from the cell), description (from row's Description column), and cell reference (sheet, row, column for error reporting). This is presented in the preview modal and only committed to the database upon user confirmation.
- **Import Session**: Represents a single file upload attempt. Contains: the parsed Excel data, a list of validated transactions, a list of validation errors (if any), and the user's confirmation state. An import session is ephemeral — it exists only in the current interaction and is discarded on cancel or after successful import.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a full month's import (up to 100 credit transactions + 50 debit transactions) in under 3 minutes from upload to confirmation
- **SC-002**: 100% of validation errors are reported with specific cell location and human-readable description — no generic "invalid file" messages
- **SC-003**: Round-trip fidelity is maintained — exporting a month's data and re-importing the exported file produces identical transaction records (same count, amounts, dates, types)
- **SC-004**: The preview modal accurately reflects the final import — the number and values of transactions shown in preview match exactly what gets stored in the database
- **SC-005**: Automatic refresh completes within 2 seconds of import confirmation — the user sees updated balances, charts, and transaction history without manual page reload
- **SC-006**: Template download completes and is ready to open in Excel/Sheets within 5 seconds of clicking the download button
- **SC-007**: Invalid files (corrupted, wrong format, bad formulas) never result in partial or corrupt data in the database — the system maintains data integrity post-upload

## Assumptions

- The monthly ledger format uses `Sheet name = <Month>-<Year>` (e.g., `May-2026`), column A for Description, columns B-AF for Days 1-31, and column AG for a Total column. Template examples clarify this layout.
- Credit rows use the Description column for the transaction notes/label; if empty, an auto-generated description like "Credit - <date>" is used.
- Debit formula parsing supports only the `=SUM(-amount1-amount2-...)` pattern with dash-separated negative numbers. Individual amounts can be integers or decimals (e.g., `=SUM(-4100-900.50-1020)`).
- Each `=SUM(...)` formula row's Description column provides the notes/label for all individual debit transactions parsed from that formula.
- Amounts in the Excel are in whole currency units (e.g., rupees/dollars, not cents). The conversion to cents (multiply by 100) happens during import to match the existing data model. Exported amounts are converted back from cents to whole units.
- The import is scoped to one person at a time — the user selects which person the imported transactions belong to before or during upload.
- Each import handles one month (one sheet). If a file has multiple month-named sheets, the user selects which sheet to import via a dropdown in the preview modal.
- Negative balances resulting from import are allowed (the app does not prevent overspending).
- Re-importing for an existing person+month replaces all prior transactions for that month (delete old, insert new). This is the intended mechanism for updates and also prevents unintended duplicates.
- The existing data refresh pattern (server actions calling `revalidatePath()` + client components re-fetching) is sufficient for the automatic refresh requirement.
- Export generates the formula format `=SUM(-amount1-amount2-...)` by grouping debits that share the same date and description into a single row.
