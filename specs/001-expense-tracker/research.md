# Research: Expense Tracker

## Unknowns Resolved

### 1. Validation Library

- **Decision**: Use Zod for shared validation schemas
- **Rationale**: Zod provides runtime validation with TypeScript type inference, enabling a single source of truth for validation rules shared between server actions and client-side form validation. It's well-established in the Next.js ecosystem, lightweight (~8KB gzipped), and integrates naturally with server actions.
- **Alternatives considered**: Manual validation functions (less maintainable, no type inference), Yup (heavier, less TypeScript-native), Valibot (newer, smaller but less ecosystem adoption)

### 2. UI Component Approach

- **Decision**: Native HTML form elements styled with Tailwind CSS
- **Rationale**: Keeps dependencies minimal — no component library needed for 3 form fields (amount, date, category dropdown, description textarea). Tailwind's utility classes handle all styling needs. Native `<form>` elements work directly with Next.js server actions via `<form action={serverAction}>`.
- **Alternatives considered**: Headless UI (unnecessary abstraction for this scope), shadcn/ui (too opinionated for a 3-field form)

### 3. localStorage Typed Wrapper Pattern

- **Decision**: Thin wrapper with JSON parse/stringify, error handling, and quota detection
- **Rationale**: localStorage is synchronous and simple. A typed wrapper provides `getExpenses(): Expense[]` and `saveExpenses(expenses: Expense[])` with proper error handling for quota exceeded scenarios and JSON parse failures. Uses a single key `"expenses"` for the entire dataset.
- **Alternatives considered**: IndexedDB via idb library (overkill for <500 items), in-memory only (lost on reload, violates FR-009)

### 4. Date Handling

- **Decision**: Store dates as ISO strings (YYYY-MM-DD), restrict to today or earlier
- **Rationale**: ISO date strings are sortable, portable, and natively supported by `<input type="date">`. The `max` attribute on the input combined with Zod validation ensures no future dates.
- **Alternatives considered**: Date objects (serialization complexity with JSON), Unix timestamps (less human-readable, no calendar date semantics)

### 5. Category Predefined List

- **Decision**: 8 categories: Food & Dining, Transportation, Housing, Utilities, Entertainment, Shopping, Health, Other
- **Rationale**: Matches spec assumptions and covers the majority of personal expense categories. Represented as a TypeScript union type + Zod enum.
- **Alternatives considered**: User-customizable categories (deferred per spec), fewer categories (would be too generic)

### 6. Amount Storage

- **Decision**: Integer cents stored as `number`, display formatted as `$X.XX`
- **Rationale**: Avoids floating-point precision issues. The Zod schema validates `z.number().int().positive()`. Display formatting done client-side via a simple cents-to-dollars utility.
- **Alternatives considered**: String storage (avoids number precision but requires parsing), two-field dollars/cents (unnecessary complexity)

## Next.js 16 Considerations

- Server actions use `'use server'` directive — defined in `src/server/actions/` files
- All request APIs (`params`, `searchParams`, `cookies()`, `headers()`) are async and require `await`
- No `middleware` → this project uses `proxy` if needed (not needed here — no auth, no redirects)
- Turbopack is the default bundler — no custom `webpack` config
- Tailwind v4 uses `@import "tailwindcss"` (already configured)
