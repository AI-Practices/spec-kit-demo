# Server Action Contracts

**Note**: All actions now read/write PostgreSQL via Prisma instead of localStorage. Existing action signatures remain backward-compatible for the client — only the storage backend changes.

---

## Person Actions

**File**: `src/server/actions/persons.ts`

### createPerson

#### Input
```typescript
{
  name: string;  // non-empty, trimmed
}
```

#### Success Response
```typescript
{
  success: true;
  data: Person;  // includes auto-generated id, userId, createdAt
}
```

#### Error Response
```typescript
{
  success: false;
  errors: {
    name?: string[];
    _form?: string[];
  };
}
```

#### Behavior
1. Validates name with Zod schema (non-empty, trimmed)
2. Creates Person record in PostgreSQL via Prisma
3. Returns created person with computed balance of 0

### getPersons

#### Input
```typescript
void // no input — userId derived from session/seeded user
```

#### Success Response
```typescript
{
  success: true;
  data: Person[];  // each includes computed balance
}
```

#### Behavior
1. Fetches all persons for the current user
2. Computes balance for each via transaction aggregation
3. Returns sorted by name

### updatePerson

#### Input
```typescript
{
  id: string;   // person ID
  name: string; // new name, non-empty
}
```

#### Success Response
```typescript
{
  success: true;
  data: Person;  // updated person
}
```

#### Behavior
1. Validates ID and name
2. Updates person name in PostgreSQL
3. Returns updated person

### deletePerson

#### Input
```typescript
{
  id: string;  // person ID
}
```

#### Success Response
```typescript
{
  success: true;
  data: { id: string };
}
```

#### Behavior
1. Validates ID
2. Deletes person AND all associated wallet transactions (hard delete)
3. Executes in a Prisma transaction to ensure atomicity
4. Returns deleted person ID

---

## Wallet Transaction Actions

**File**: `src/server/actions/wallet.ts`

### createCredit

#### Input
```typescript
{
  personId: string;       // must reference existing person
  amount: number;         // positive integer cents
  date: string;           // YYYY-MM-DD
  notes?: string;         // optional for credits
}
```

#### Success Response
```typescript
{
  success: true;
  data: WalletTransaction;  // type = "credit"
}
```

#### Behavior
1. Validates person exists and belongs to current user
2. Validates amount > 0 (integer cents)
3. Validates date is valid YYYY-MM-DD (future dates allowed)
4. Creates WalletTransaction with type "credit"
5. Balance recalculates automatically (computed, not stored)

### createDebit

#### Input
```typescript
{
  personId: string;       // must reference existing person
  amount: number;         // positive integer cents
  date: string;           // YYYY-MM-DD
  notes: string;          // REQUIRED for debits
}
```

#### Success Response
```typescript
{
  success: true;
  data: WalletTransaction;  // type = "debit"
}
```

#### Behavior
1. Validates person exists and belongs to current user
2. Validates amount > 0 (integer cents)
3. Validates notes is non-empty
4. Validates date is valid YYYY-MM-DD (future dates allowed)
5. Creates WalletTransaction with type "debit"
6. Balance may go negative (overdraft allowed)

### getMonthlyCredits

#### Input
```typescript
{
  personId: string;
  year: number;     // e.g., 2026
  month: number;    // 1-12
}
```

#### Success Response
```typescript
{
  success: true;
  data: {
    entries: Record<string, number>;  // { "2026-03-15": 5000, ... }
    total: number;                     // sum of all credits in month
  };
}
```

#### Behavior
1. Queries all credit transactions for person in the given month/year
2. Groups by date string in application layer
3. Returns map of date → amount (cents)

### getPersonSummary

#### Input
```typescript
{
  personId: string;
}
```

#### Success Response
```typescript
{
  success: true;
  data: {
    person: Person;
    totalCredited: number;   // sum of all credits in cents
    totalDebited: number;    // sum of all debits in cents
    balance: number;         // totalCredited - totalDebited
    transactions: WalletTransaction[];  // ordered by date desc
  };
}
```

#### Behavior
1. Fetches person and all transactions
2. Computes aggregates via Prisma `aggregate` or application logic
3. Returns full summary

### deleteTransaction

#### Input
```typescript
{
  id: string;  // transaction ID
}
```

#### Success Response
```typescript
{
  success: true;
  data: { id: string };
}
```

#### Behavior
1. Validates ID
2. Verifies transaction exists and belongs to current user
3. Deletes transaction
4. Balance recalculates automatically on next query
5. Returns deleted transaction ID

---

## Expense Actions (migrated)

**File**: `src/server/actions/add-expense.ts`, `src/server/actions/delete-expense.ts`

**Contracts**: Identical to existing contracts (see `specs/001-expense-tracker/contracts/server-actions.md`)

**Changes**:
- Backend storage changed from localStorage to PostgreSQL (via Prisma)
- `category` field now references a Category ID instead of an enum string
- Input signature unchanged (`amount`, `date`, `category`, `description`)
- Category string → ID mapping handled internally during migration and on new entries
- Response signatures unchanged for backward compatibility

---

## Common Patterns

### Error Response Shape
```typescript
{
  success: false;
  errors: Record<string, string[]>;  // field → error messages
  // Special key "_form" for general form-level errors (not field-specific)
}
```

### Data Access Pattern
```typescript
'use server';

import { z } from 'zod';
import { prisma } from '@/src/server/db';
import { revalidatePath } from 'next/cache';

export async function someAction(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }
  try {
    const result = await prisma.entity.create({ data: parsed.data });
    revalidatePath('/path');
    return { success: true, data: result };
  } catch (err) {
    return { success: false, errors: { _form: [getErrorMessage(err)] } };
  }
}
```
