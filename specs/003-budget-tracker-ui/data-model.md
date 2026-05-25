# Data Model: Budget Tracker

**Date**: 2026-05-25
**Plan**: `specs/003-budget-tracker-ui/plan.md`

## Entities

### Budget

A monthly spending limit for a single expense category.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `string` (UUID) | Auto-generated via `crypto.randomUUID()` | Unique identifier |
| `category` | `Category` | One of: Food & Dining, Transportation, Housing, Utilities, Entertainment, Shopping, Health, Other | The expense category this budget applies to |
| `amount` | `number` (integer cents) | Positive integer > 0 | Monthly spending limit in cents |
| `month` | `string` | Format: `YYYY-MM` (e.g., "2026-05") | The budget period |
| `createdAt` | `string` (ISO 8601) | Auto-set on creation | Timestamp of budget creation |
| `updatedAt` | `string` (ISO 8601) | Updated on edit | Timestamp of last modification |

**Uniqueness constraint**: At most one Budget per `(category, month)` pair. Setting a new budget for an existing `(category, month)` replaces the previous value (upsert).

### BudgetSummary (derived view — not stored)

Computed on render from Budget + Expense data.

| Field | Source | Description |
|-------|--------|-------------|
| `category` | Budget | The expense category |
| `budgetAmount` | Budget | The spending limit in cents |
| `spent` | Expenses (sum by category + month) | Total amount spent in cents |
| `remaining` | Computed: `budgetAmount - spent` | Amount left (negative if overspent) |
| `percentage` | Computed: `(spent / budgetAmount) * 100` | Percentage used |
| `status` | Computed: < 80% → `safe`, 80-100% → `warning`, > 100% → `overspent` | Budget health status |

## Relationships

```
Category (predefined enum)
    │
    ├── has many Expenses (per month, summed in BudgetSummary)
    │
    └── has one Budget (per month)
```

- A Budget is linked to a Category via the `category` field (using the existing `Category` type)
- A Budget is linked to a month via the `month` field
- Budget data is independent from Expense data (separate storage keys)
- BudgetSummary is computed on render by joining Budgets with Expenses filtered by `(category, month)`

## Validation Rules

| Rule | Applies To | Description |
|------|------------|-------------|
| Positive amount | Budget.amount | Must be positive integer (cents); negative/zero rejected |
| UUID format | Budget.id | Generated via `crypto.randomUUID()` |
| Valid category | Budget.category | Must match one of the 8 predefined Category values |
| Valid month format | Budget.month | Must match `YYYY-MM` regex pattern |
| Unique per month+category | Budget | At most one budget per category per month (upsert on set) |
