# Storage Layer Contract: Prisma Database Access

**File**: `src/server/db.ts`

## Public API

### Prisma Client Singleton

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- Imported by all server actions and data access functions
- Never instantiate `new PrismaClient()` outside this module
- In development, stored on `globalThis` to survive hot reloads

### Person Operations

| Function | Description |
|----------|-------------|
| `getPersons(userId)` | Returns all persons for user, each with computed balance |
| `getPerson(id, userId)` | Returns single person with balance |
| `createPerson(userId, name)` | Creates a new person |
| `updatePerson(id, userId, name)` | Edits person name |
| `deletePerson(id, userId)` | Hard-deletes person and all associated wallet transactions |

### Wallet Transaction Operations

| Function | Description |
|----------|-------------|
| `getTransactions(personId, userId)` | Returns all transactions for a person, ordered by date desc |
| `getMonthlyCredits(personId, userId, year, month)` | Returns all credit transactions for a specific month |
| `createCredit(userId, personId, amount, date, notes?)` | Records a credit entry |
| `createDebit(userId, personId, amount, date, notes)` | Records a debit entry (notes required) |
| `deleteTransaction(id, userId)` | Deletes an individual transaction |
| `getPersonSummary(personId, userId)` | Returns total credits, total debits, and current balance |

### Expense Operations (migrated from localStorage)

| Function | Description |
|----------|-------------|
| `getExpenses(userId)` | Returns all expenses for user, ordered by date desc |
| `createExpense(userId, data)` | Creates a new expense |
| `deleteExpense(id, userId)` | Deletes an expense |

### Category Operations

| Function | Description |
|----------|-------------|
| `getCategories(userId)` | Returns all active categories for the user |
| `seedDefaultCategories(userId)` | Seeds the 8 default categories for a new user |

### Balance Calculation

```typescript
async function getPersonBalance(personId: string, userId: string): Promise<number> {
  const result = await prisma.walletTransaction.aggregate({
    where: { personId, userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}
```

Balance is always computed — never stored. The query aggregates all transactions for the person. Credits are stored as positive amounts, debits as positive amounts, and the caller subtracts debits from credits in application logic.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Database connection fails | Server action returns `{ success: false, errors: { _form: ["Database connection failed"] } }` |
| Record not found | Server action returns `{ success: false, errors: { _form: ["Record not found"] } }` |
| Unique constraint violation (e.g., duplicate category name) | Server action returns `{ success: false, errors: { name: ["A category with this name already exists"] } }` |
| Foreign key violation (e.g., invalid personId) | Server action returns `{ success: false, errors: { _form: ["Referenced record does not exist"] } }` |

## Migration from localStorage

### Script: `scripts/migrate-from-localstorage.ts`

1. Reads existing localStorage JSON export file
2. Validates each record with current Zod schemas
3. Creates default user and default categories via Prisma
4. Inserts all expenses mapped to the default user and migrated category IDs
5. Logs summary: records processed, skipped, errors

### Dual-read period: None

The app has a clear cutoff — before migration it uses localStorage, after deployment it uses PostgreSQL. The migration script is run once before the new version is deployed.

### Data integrity checks after migration

- Expense count in PostgreSQL matches source localStorage count
- Sum of amounts matches between sources
- Category distribution matches
- Any records that failed validation are logged for manual review
