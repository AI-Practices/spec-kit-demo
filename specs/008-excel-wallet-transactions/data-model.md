# Data Model: Excel Wallet Transactions

## Overview

This document defines the in-memory data structures for the Excel import/export feature. These are ephemeral — used during parsing, preview, and validation — and map to the existing `WalletTransaction` database model for persistence.

## Entities

### MonthlyLedger

Represents a parsed Excel sheet for one month.

| Field | Type | Description |
|-------|------|-------------|
| `sheetName` | `string` | Excel sheet name, e.g. `"May-2026"` |
| `month` | `number` | Month number (1-12) derived from sheet name |
| `year` | `number` | Year derived from sheet name |
| `rows` | `LedgerRow[]` | All data rows parsed from the sheet |

**Validation**: Sheet name must match `{MonthName}-{Year}` pattern (e.g., `May-2026`). Month name must be valid English 3-letter abbreviation or full name.

---

### LedgerRow

A single row in the monthly ledger, either a credit row or a debit row.

| Field | Type | Description |
|-------|------|-------------|
| `description` | `string` | Value from the Description column (column A). Used as transaction notes. May be empty for credit rows. |
| `type` | `'credit' \| 'debit'` | Determined by whether the row contains daily values (credit) or a formula (debit) |
| `dailyValues` | `(number \| null)[]` | Array of length 31. Values from Day 1-31 columns. `null` for empty cells. Only populated for credit rows. |
| `rawFormula` | `string \| null` | Raw formula text from the Total column for debit rows (e.g., `=SUM(-4100-900-1020)`). `null` for credit rows. |
| `rowIndex` | `number` | 0-based row index in the Excel sheet (for error reporting) |

**Validation**:
- Credit rows: each `dailyValues[i]` must be a positive number or null
- Debit rows: `rawFormula` must match `=SUM(-amount1-amount2-...)` pattern
- Parsed amounts from formula must be positive (the minus sign is a delimiter, not negation)

---

### ParsedTransaction

A single transaction ready for preview and database insert.

| Field | Type | Description | Maps To (DB) |
|-------|------|-------------|--------------|
| `type` | `'credit' \| 'debit'` | Transaction type | `WalletTransaction.type` |
| `amount` | `number` | Amount in cents (integer) | `WalletTransaction.amount` |
| `date` | `string` | ISO date string `YYYY-MM-DD` | `WalletTransaction.date` |
| `notes` | `string \| null` | Transaction description/notes | `WalletTransaction.notes` |
| `cellRef` | `string` | Excel cell reference for error tracing (e.g., `"May-2026!B3"`) | Not persisted |

**Validation**: Must pass existing `createCreditSchema` or `createDebitSchema` validation (positive amount, non-empty notes for debits, valid date within the month).

---

### ImportResult

Returned after a successful import.

| Field | Type | Description |
|-------|------|-------------|
| `importedCount` | `number` | Total transactions created |
| `replaced` | `boolean` | Whether existing data for this month was replaced |
| `replacedMonth` | `string \| null` | Month string (e.g., `"May-2026"`) if replaced |
| `sheetName` | `string` | Name of the imported sheet |
| `warnings` | `string[]` | Any warnings generated (e.g., skipped out-of-range days) |

---

### ImportErrors

Returned when validation fails (blocks import).

| Field | Type | Description |
|-------|------|-------------|
| `errors` | `ImportError[]` | List of individual errors |
| `totalErrors` | `number` | Error count |

#### ImportError

| Field | Type | Description |
|-------|------|-------------|
| `cellRef` | `string` | Cell reference (e.g., `"May-2026!B3"`) |
| `message` | `string` | Human-readable error description |
| `type` | `'error' \| 'warning'` | Severity. Errors block import; warnings are informational. |

## Relationships

```
MonthlyLedger (1)
  └── LedgerRow (many)
       └── ParsedTransaction (1 or many, depending on type)
            └── WalletTransaction (DB) (1-to-1 via insert)
```

- One `MonthlyLedger` is parsed from one Excel sheet (one month)
- Each credit `LedgerRow` produces 0-31 `ParsedTransaction`s (one per non-empty day cell)
- Each debit `LedgerRow` produces N `ParsedTransaction`s (one per amount in the formula)
- Each `ParsedTransaction` maps to exactly one `WalletTransaction` DB record on import

## State Transitions

```
Upload → Parse → Validate → Preview → [Cancel] → Discard
                                ↓
                           [Confirm]
                                ↓
                         Replace (if month exists) + Insert
                                ↓
                            Success (refresh UI)
```
