# Data Model: Financial Summary Section

## MonthlySummary

Stores the aggregated financial summary for one person for one month. One record per `(personId, month, year)`.

### Prisma Model

```prisma
model MonthlySummary {
  id                  String   @id @default(cuid())
  userId              String
  personId            String
  month               Int
  year                Int
  monthlySavings      Int
  lastMonthRemaining  Int
  giveBackForExpenses Int
  loanAmount          Int
  balanceForNextMonth Int
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id])
  person Person @relation(fields: [personId], references: [id])

  @@unique([personId, month, year])
  @@index([personId, year])
  @@index([userId, personId])
}
```

### Field Details

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `monthlySavings` | Int | any integer | Net = total credits - total debits. Positive = surplus, negative = deficit. |
| `lastMonthRemaining` | Int | any integer | Previous month's `balanceForNextMonth`. Zero if no prior month data exists. |
| `giveBackForExpenses` | Int | <= 0 | Sum of all debit amounts. Always stored as <= 0 (negative or zero). |
| `loanAmount` | Int | <= 0 | Manually entered total loan figure. Always stored as <= 0. |
| `balanceForNextMonth` | Int | any integer | Final balance = `monthlySavings + lastMonthRemaining + giveBackForExpenses + loanAmount`. |

### Validation Rules

- `month` MUST be 1-12
- `year` MUST be >= 2020
- `giveBackForExpenses` MUST be <= 0
- `loanAmount` MUST be <= 0
- `balanceForNextMonth` MUST equal `monthlySavings + lastMonthRemaining + giveBackForExpenses + loanAmount`

### Lifecycle

- **Created**: On import, when summary rows are parsed from an uploaded Excel file
- **Updated**: On re-import for the same `(personId, month, year)` — upsert replaces the entire record
- **Deleted**: Cascaded when the associated `Person` is deleted (via `deletePerson` transaction)
- **Read**: During export to retrieve `lastMonthRemaining` (query previous month's `balanceForNextMonth`)

### Relationships

```
Person (1) ──→ MonthlySummary (many)
User  (1) ──→ MonthlySummary (many)
```

## Financial Summary Row (Excel)

In-memory representation of a single summary row parsed from or written to the Excel sheet.

```typescript
interface FinancialSummaryRow {
  label: "Monthly Savings" | "Last Month Remaining"
       | "Give Back for Daily Expenses" | "Loan Amount"
       | "Balance for Next Month";
  value: number;
  isFormula: boolean;  // true = computed via Excel formula; false = manual entry
  rowIndex: number;    // 0-based row in the worksheet
}
```

Not stored in the database — transient during import/export processing.
