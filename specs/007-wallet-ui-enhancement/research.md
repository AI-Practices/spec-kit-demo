# Research: Currency Support, Analytics Charts & UI Redesign

## 1. Amount Input Fix

**Decision**: Select all text on `onFocus` for each controlled amount input.

**Rationale**: The app has four amount inputs across three forms:
- `add-expense-form.tsx` — uncontrolled (`type="number"`, no `value`/`onChange`). Already replaces on keystroke via native browser behavior. No fix needed.
- `debit-form.tsx` — controlled (`value={amount}` + `onChange`). Typing appends to existing value. Fix: `onFocus={(e) => e.target.select()}`.
- `budget-manager.tsx` — controlled (`value={amount}` + `onChange`). Same pattern, same fix.
- `monthly-grid.tsx` — controlled (`value={editValue}` + `onChange`). Same pattern, same fix.

The `onFocus` + `select()` approach ensures that when the user clicks into the field and types, the existing value is replaced by the first keystroke. No new state management or input library needed.

**Alternatives considered**:
- Switch to uncontrolled inputs → would break existing form patterns (FormData for expense, controlled for debit/budget)
- Debounce input → over-engineered, doesn't fix the root cause
- `defaultValue` pattern → loses React controlled behavior

## 2. Chart Library Selection

**Decision**: `chart.js` v4 + `react-chartjs-2` v5, importing only Doughnut controller and ArcElement (tree-shaken).

**Rationale**: The donut chart has simple requirements (5–10 category segments, tooltip on hover, "Others" grouping for <5%). chart.js provides:
- Built-in Doughnut chart with configurable segment colors
- Built-in tooltip plugin (label, value, percentage)
- Modular imports keep bundle small (~15KB gzipped for Doughnut only)
- No DOM manipulation — renders on Canvas
- Works with React 19 + Next.js 16 without SSR issues (lazy-load with `next/dynamic` + `ssr: false`)

**Alternatives considered**:
- `recharts` — heavier (~80KB), more geared toward complex charts, no tree-shaking
- Custom SVG — lighter but no out-of-the-box tooltip, more manual work for hover/tap interactions
- `nivo` — requires D3 dependency, heavier than needed
- `lightweight-charts` (TradingView) — designed for financial time-series, not donut

## 3. Currency Formatting (Indian Numbering)

**Decision**: Use `Intl.NumberFormat` with locale per currency code.

**Rationale**: The native `Intl.NumberFormat` API provides:
- **INR** (`en-IN` locale): `₹1,00,000` (lakh grouping), `₹1,00,00,000` (crore grouping)
- **USD** (`en-US` locale): `$1,000,000` (thousand grouping)
- Configurable currency symbol, automatic formatting
- Zero dependencies, available in all modern browsers

**Format utility design**:
```ts
function formatAmount(cents: number, currencyCode: string = 'INR'): string {
  const amount = cents / 100;
  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
```

**Fallback behavior**: If `Intl.NumberFormat` does not have a symbol for the currency (edge case), it falls back to the currency code (e.g., `"USD 1,000.00"`). This satisfies the spec's Edge Case #1.

**Alternatives considered**:
- `numeral.js` — heavy (48KB), unnecessary dependency
- Manual formatting — error-prone, hard to maintain locale correctness
- `Intl.NumberFormat` with `en-IN` for all — incorrect for USD (would show lakh/crore for dollars)

## 4. Tailwind v4 Theme Tokens & Color Palette

**Decision**: Add CSS custom properties for new colors and extend `@theme inline`, keeping dark mode parity.

**Rationale**: The new color palette maps to Tailwind utility classes via the `@theme inline` block:
- `--color-accent` → Indigo `#4F46E5` (primary interactive elements, focus rings)
- `--color-positive` → Green `#22C55E` (credits, surplus, budget remaining)
- `--color-negative` → Red `#EF4444` (debits, overspending, deficits)
- `--color-chart-cyan` → Cyan `#06B6D4` (categorical chart colors, data badges)

Light background changes from `#ffffff` to `#F8FAFC`. All existing `--budget-*` vars are compatible with the new palette (green/red already used). Amber `#f59e0b` remains for budget warnings.

**`globals.css` changes**:
- `:root { --background: #F8FAFC; }` (was `#ffffff`)
- Add `--color-accent`, `--color-positive`, `--color-negative`, `--color-chart-cyan` to `:root`
- Add dark mode overrides in `.dark`
- Add to `@theme inline { ... }` for Tailwind utility use (e.g., `bg-accent`, `text-positive`)

**Alternatives considered**:
- Using Tailwind arbitrary values (`bg-[#4F46E5]`) everywhere → violates DRY, hard to maintain
- Replacing Tailwind's zinc palette → unnecessary, zinc works for neutral/surfaces
- Using Tailwind's built-in indigo/green/red → doesn't match exact spec hex values

## 5. Responsive Layout Grid

**Decision**: Use Tailwind responsive grid with container width changes, preserving existing `max-w-2xl` as foundation for detail pages.

**Rationale**:
- Dashboard: Change from vertical stack to responsive grid at breakpoints
  - Mobile (≤640px): single column, full-width cards (current behavior)
  - Tablet (641–1024px): 2-column grid for stat cards, donut chart + summary side-by-side
  - Desktop (≥1025px): 3-column grid with comfortable whitespace
- Detail pages (expenses, budgets, persons): keep `max-w-2xl` centered — these are focused forms that don't benefit from multi-column
- Navigation: current horizontal nav works at all breakpoints, but add a mobile hamburger if the nav links overflow on < 640px

**Implementation approach**:
- Dashboard uses `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6`
- Cards get consistent `rounded-xl shadow-sm border` styling
- Container uses `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8` for dashboard (instead of `max-w-2xl`)
- Remove `max-w-2xl` from dashboard page, keep on expense/budget/person detail pages

**Alternatives considered**:
- CSS Grid with `auto-fill` + `minmax()` → less predictable layout
- Flexbox only → harder to achieve true multi-column with items of varying height
- Media query approach → more verbose, Tailwind responsive utilities are cleaner

## 6. Chart "Others" Grouping Threshold

**Decision**: Group categories below 5% of total spending into an "Others" segment.

**Rationale**: Per the spec acceptance criteria, minor categories (<5%) get grouped into a single "Others" segment. This is implemented in the data transform that feeds the Doughnut chart:
1. Calculate total spending across all categories
2. Compute each category's percentage share
3. Categories < 5% → aggregate into "Others" with combined amount
4. Labels, values, and colors assigned accordingly

**Edge case**: If there are 0 expenses, the chart shows an empty state message (no segment rendering).
