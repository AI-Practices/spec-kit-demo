# Quickstart: Wallet UI Enhancement

## What this feature does

1. **Currency support** — amounts display in Indian Rupee (₹) by default with lakh/crore numbering. Switch to USD in nav.
2. **Input fix** — typing in amount fields replaces existing value instead of appending.
3. **Donut chart** — dashboard shows expense breakdown by category, minor categories grouped into "Others".
4. **UI redesign** — Indigo accent, Green/Red semantic colors, Cyan chart palette, light background `#F8FAFC`, elevated cards, responsive dashboard.
5. **Responsive** — dashboard layout adapts to mobile/tablet/desktop.

## Architecture

```
lib/
├── currency-config.ts   — localStorage persistence for currency preference
├── format-amount.ts     — centralized currency formatter (Intl.NumberFormat)
├── chart-data.ts        — Expense[] → ChartDataset transform + "Others" grouping
└── use-currency.ts      — React hook wrapping currency config + formatAmount

app/
├── globals.css          — updated color tokens (Indigo, Cyan, Light BG)
├── layout.tsx           — added <CurrencySelector /> in nav
├── page.tsx             — Dashboard (responsive grid, donut chart)
├── _components/
│   ├── donut-chart.tsx        — chart.js Doughnut wrapper (client, dynamic import)
│   ├── currency-selector.tsx  — currency dropdown in nav
│   └── [modified forms]      — onFocus select-all on amount inputs
```

## Implementation order (per Progressive Enhancement)

| Step | Stories | Files touched |
|------|---------|--------------|
| P1a | US1 (currency) | `lib/format-amount.ts`, `lib/currency-config.ts`, `lib/use-currency.ts`, `app/globals.css` (add tokens), `app/layout.tsx`, `app/_components/currency-selector.tsx`, + all components with `formatAmount` calls |
| P1b | US2 (input fix) | `app/_components/debit-form.tsx`, `budget-manager.tsx`, `monthly-grid.tsx` |
| P2a | US3 (donut chart) | `lib/chart-data.ts`, `app/_components/donut-chart.tsx`, `app/_components/dashboard-stats.tsx`, `app/page.tsx` |
| P2b | US4 (UI redesign) | `app/globals.css` (full palette), all component files (update classNames) |
| P3 | US5 (responsive) | `app/page.tsx`, `app/layout.tsx` (nav), `app/globals.css` |

## Key dependencies to add

```
npm install chart.js react-chartjs-2
```

## Run

```bash
npm run dev     # development
npm run build   # production build
npm run lint    # ESLint check
```
