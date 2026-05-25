# Server Action Contracts

## addExpense

**File**: `src/server/actions/add-expense.ts`

### Input

```typescript
{
  amount: number;       // integer cents, positive
  date: string;         // YYYY-MM-DD, today or earlier
  category: string;     // must be valid Category
  description: string;  // non-empty
}
```

### Success Response

```typescript
{
  success: true;
  data: Expense;  // includes auto-generated id
}
```

### Error Response

```typescript
{
  success: false;
  errors: {
    amount?: string[];
    date?: string[];
    category?: string[];
    description?: string[];
  };
}
```

### Behavior

1. Validates input with Zod schema
2. If invalid → return `{ success: false, errors }`
3. If valid → return `{ success: true, data: { ...input, id: crypto.randomUUID() } }`
4. Note: The server action validates and returns typed data. The client is responsible for persisting to localStorage.

---

## deleteExpense

**File**: `src/server/actions/delete-expense.ts`

### Input

```typescript
{
  id: string;  // UUID of the expense to delete
}
```

### Success Response

```typescript
{
  success: true;
  data: { id: string };
}
```

### Error Response

```typescript
{
  success: false;
  errors: {
    id?: string[];
  };
}
```

### Behavior

1. Validates that `id` is a non-empty string
2. If invalid → return `{ success: false, errors }`
3. If valid → return `{ success: true, data: { id } }`
4. Note: The server action validates the request. The client removes the expense from localStorage.
