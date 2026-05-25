# Storage Layer Contract

**File**: `src/lib/storage.ts`

## Public API

### `getExpenses(): Expense[]`

- Reads `"expenses"` key from localStorage
- Returns parsed `Expense[]`
- Handles: missing key → empty array, JSON parse error → empty array
- Throws: `QuotaExceededError` is caught and re-thrown as user-friendly message (handled in component)

### `saveExpenses(expenses: Expense[]): void`

- Serializes `Expense[]` to JSON and writes to `"expenses"` key
- Throws: `QuotaExceededError` is caught and re-thrown

### `addExpense(input: Expense): Expense`

- Adds expense to existing list
- Saves via `saveExpenses`
- Returns the added expense

### `removeExpense(id: string): void`

- Removes expense with matching id
- Saves via `saveExpenses`

## Error Handling

| Scenario | Behavior |
|----------|----------|
| localStorage key missing | Returns `[]` |
| Corrupted JSON data | Returns `[]` (silently discards corrupted data) |
| Quota exceeded | Throws `Error("Storage is full. Please delete some expenses.")` |
| localStorage unavailable (private browsing) | Returns `[]` on read, silently fails on write |
