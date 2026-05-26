# Data Model: Currency, Charts & UI

## CurrencyConfig

Persisted to `localStorage` under key `"currency-preference"`. Controls the currency symbol and locale formatting for all monetary displays.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `currencyCode` | `string` | `"INR"` | ISO 4217 currency code. Supported: `"INR"`, `"USD"`. |

### Validation Rules
- Must be a non-empty string matching a supported currency code
- Unsupported codes fall back to showing the code (e.g., `"EUR 1,000.00"`) per spec edge case

### State Transitions
- On first load with no stored preference → `{ currencyCode: "INR" }`
- On user switch → update both in-memory state and localStorage
- On page reload → read from localStorage

### Storage Interface
```ts
function getCurrencyConfig(): CurrencyConfig
function setCurrencyConfig(config: CurrencyConfig): void
```

## ChartDataset (derived, not persisted)

Computed at render time from `Expense[]` data. Not stored in any database.

| Field | Type | Description |
|-------|------|-------------|
| `labels` | `string[]` | Category names, with `"Others"` as the last entry if grouping applies |
| `values` | `number[]` | Total cents spent per category (or aggregated for "Others") |
| `colors` | `string[]` | Hex color assigned to each segment |
| `total` | `number` | Sum of all `values` (total cents spent) |
| `percentages` | `number[]` | Percentage share for each segment (0–100) |

### Derivation Rules
1. Group all expenses by `category`, sum `amount` per category
2. Compute each category's percentage: `(categorySum / totalSpending) * 100`
3. Categories with `percentage < 5` → aggregate into `"Others"` label with combined sum and combined percentage
4. Major categories (≥5%) keep their own label and computed values

### Display Rules
- Total of 0 expenses → return `null` (triggers empty state in UI)
- All categories are "major" → no "Others" segment (grouping has no effect)
- Only minor categories exist → all collapse into single "Others" segment

## Amount Formatting Contract

A centralized utility replacing 6 duplicated implementations. No database entity — pure function.

```ts
function formatAmount(cents: number, currencyCode?: string): string
```

- `cents`: amount in integer cents (e.g., `10050` = $100.50)
- `currencyCode`: ISO 4217 code, defaults to `"INR"`
- Returns: locale-formatted string with currency symbol (e.g., `"₹10,050.00"` or `"$10,050.00"`)

## UI Design Tokens

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--background` | `#F8FAFC` | `#0a0a0a` | Page bg |
| `--color-accent` | `#4F46E5` | `#6366F1` | Primary buttons, links, focus rings |
| `--color-positive` | `#22C55E` | `#4ADE80` | Credits, surplus, budget remaining |
| `--color-negative` | `#EF4444` | `#F87171` | Debits, deficits, overspending |
| `--color-chart-cyan` | `#06B6D4` | `#22D3EE` | Chart segments, data badges |
| `--color-accent-hover` | `#4338CA` | `#818CF8` | Hover state for accent elements |
