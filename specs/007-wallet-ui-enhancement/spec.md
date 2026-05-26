# Feature Specification: Currency Support, Analytics Charts & UI Redesign

**Feature Branch**: `007-wallet-ui-enhancement`

**Created**: 2026-05-25

**Status**: Draft

**Input**: User description: "Add configurable currency support with Indian Rupee (₹) as default. Fix amount input reset issue when adding/editing transactions. Replace existing charts with modern donut graphs for better analytics visualization. Improve the overall UI with modern cards, spacing, colors, typography, and responsive dashboard design. Recommended theme colors: Indigo (#4F46E5), Green (#22C55E), Red (#EF4444), Cyan (#06B6D4), and Light Background (#F8FAFC) for a clean fintech-style interface."

## Clarifications

### Session 2026-05-25

- Q: Indian number formatting — lakh/crore or international million/billion for INR? → A: Indian numbering (lakh/crore)
- Q: Does "editing transactions" mean a new edit feature or just the input fix in existing forms? → A: Fix applies to existing add forms (expense, credit, debit, budget); no dedicated edit-transaction feature in this iteration
- Q: Which capabilities should be explicitly declared out of scope for this iteration? → A: Transaction editing, data export, cloud sync, multi-user, recurring transactions, and attachments are all deferred to future scope
- Q: Should the dashboard include a person wallet donut chart? → A: No — donut chart on dashboard is for expense categories only. Minor categories are grouped into an "Others" segment.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure and View Preferred Currency (Priority: P1)

The user wants to see all financial amounts (expenses, budgets, person wallet balances) displayed in their preferred currency. By default, amounts show in Indian Rupee (₹). The user can switch to another currency via a settings control, and all displayed amounts update immediately to use the new currency symbol and formatting.

**Why this priority**: Currency affects every financial view in the app — expenses, budgets, person wallets, and dashboard stats. Without this, all amounts default to `$` which is incorrect for INR users.

**Independent Test**: Can be fully tested by opening the app, verifying all amounts display with ₹ symbol, switching to another currency, and confirming all amounts update to the new symbol.

**Acceptance Scenarios**:

1. **Given** the app loads with no prior currency preference, **When** the user views any amount on the dashboard, expenses, budgets, or person pages, **Then** the amount is displayed with the ₹ symbol and Indian number formatting (lakh/crore grouping)
2. **Given** the user is viewing amounts in ₹, **When** they switch the currency setting to another supported option, **Then** all visible amounts immediately update to use the new currency symbol
3. **Given** the user has set a currency preference, **When** they reload the page or return in a new session, **Then** the currency preference is preserved and amounts display in the chosen currency
4. **Given** the user has expenses, budgets, and person wallet entries, **When** they view any page, **Then** all amounts on that page consistently use the same selected currency

---

### User Story 2 - Fix Amount Input Appending Instead of Replacing (Priority: P1)

When adding a transaction (expense, credit, debit, or budget), entering a new amount in the field appends digits to the existing value instead of replacing it. For example, if the field shows "10" and the user types "50", the result is "1050" rather than "50". The input must replace the previous value with the newly entered amount, behaving like a standard numeric input.

**Why this priority**: An input that appends instead of replacing makes the app unusable for recording transactions — every keystroke compounds into an incorrect value, and users cannot enter the intended amount.

**Independent Test**: Can be fully tested by opening any transaction form (expense, credit, debit, budget), entering an initial amount, then typing a new amount and confirming the field shows only the latest value.

**Acceptance Scenarios**:

1. **Given** the amount field currently displays "10", **When** the user types "50", **Then** the field displays "50", not "1050"
2. **Given** the amount field shows a previous value, **When** the user selects all text and types a new number, **Then** the field shows only the newly entered number
3. **Given** the amount field shows a previous value, **When** the user clicks into the field and types without first clearing, **Then** the existing value is replaced by the new input

---

### User Story 3 - View Analytics with Donut Charts (Priority: P2)

The user visits the dashboard and sees a modern donut chart that visually breaks down their spending by expense category. Minor categories (below a visible threshold) are grouped into an "Others" segment for a clean display. The chart provides an at-a-glance understanding of where money is going without reading raw numbers.

**Why this priority**: Visual analytics enhance user understanding of financial patterns, but the app is usable without charts (users can still read raw numbers in lists).

**Independent Test**: Can be fully tested by adding expenses across multiple categories, viewing the dashboard, and confirming the donut chart renders with correct proportions and an "Others" segment for minor categories.

**Acceptance Scenarios**:

1. **Given** the user has expenses in multiple categories, **When** they view the dashboard, **Then** a donut chart displays each major category's share of total spending with proportional segment sizes
2. **Given** the user has expenses in categories that each account for less than 5% of total spending, **When** they view the dashboard, **Then** those minor categories are grouped into a single "Others" segment
3. **Given** the user hovers or taps on a donut chart segment, **Then** a tooltip shows the category name, amount (in selected currency), and percentage of total
4. **Given** there are no expenses recorded, **When** the user views the dashboard, **Then** the chart area shows an empty state message instead of a blank or broken chart

---

### User Story 4 - Experience Modernized App UI (Priority: P2)

The user opens the app and sees a clean, modern fintech-style interface with elevated cards, consistent spacing, refined typography, and a cohesive color palette as recommended. The visual design feels polished and professional.

**Why this priority**: Visual design directly impacts user trust and perceived quality, but the existing UI is functional, so this is a polish enhancement.

**Independent Test**: Can be fully tested by visually inspecting each page against the new design system — cards, spacing, colors, and typography are consistently applied across all views.

**Acceptance Scenarios**:

1. **Given** the user navigates to any page, **When** the page loads, **Then** all card components use elevated styling with consistent border radius, shadow, and padding
2. **Given** the user views the app, **When** they see interactive elements (buttons, inputs, links), **Then** they use the Indigo (#4F46E5) accent color for primary actions and focus states
3. **Given** the user sees financial data with positive values (credits, income, budget remaining), **When** displayed, **Then** positive indicators use Green (#22C55E)
4. **Given** the user sees financial data with negative values (debits, overspending), **When** displayed, **Then** negative indicators use Red (#EF4444)
5. **Given** the user views charts or data badges, **When** categorical colors are needed, **Then** they use the palette including Cyan (#06B6D4)
6. **Given** the user views the app in light mode, **When** the page renders, **Then** the background uses Light Background (#F8FAFC)

---

### User Story 5 - Responsive Dashboard on All Devices (Priority: P3)

The user accesses the dashboard and all feature pages on different screen sizes — desktop, tablet, and mobile — and the layout adapts appropriately. Cards stack vertically on small screens and arrange in grids on larger screens. Navigation remains usable on all sizes.

**Why this priority**: Responsive design expands accessibility, but the app is functional on desktop without it, making this a lower priority than core features.

**Independent Test**: Can be fully tested by resizing the browser window to mobile (375px), tablet (768px), and desktop (1280px) widths and confirming layout adapts without overlapping elements or horizontal scroll.

**Acceptance Scenarios**:

1. **Given** the user views the dashboard on a mobile-sized screen (≤640px), **When** the page renders, **Then** content stacks vertically in a single column with full-width cards
2. **Given** the user views the app on a tablet-sized screen (641px–1024px), **When** the page renders, **Then** content uses a 2-column grid for cards and maintains readable font sizes
3. **Given** the user views the app on a desktop screen (≥1025px), **When** the page renders, **Then** content uses multi-column layouts with comfortable whitespace
4. **Given** the user navigates on a mobile screen, **When** they tap the navigation menu, **Then** the nav links are accessible without horizontal scrolling or overlapping

### Edge Cases

- **Unsupported currency selected**: If a user sets a currency that lacks a symbol in the system, fall back to currency code (e.g., "USD" instead of "$")
- **Currency switch during active form**: Switching currency while a form is partially filled does not affect the numeric input value — only the displayed symbol updates
- **Zero-data chart state**: The donut chart gracefully displays an empty state when no expense data exists, rather than rendering a broken visual
- **Appending across focus cycles**: After a form submission error, clicking back into the amount field and typing correctly replaces, not appends to, the previous value
- **Very long category/person names**: Chart legends and labels handle long names with truncation or wrapping without layout breakage
- **Extreme screen sizes**: Layout functions on screens as narrow as 320px (small mobile) without content cutoff

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a currency configuration setting that persists across sessions and applies to all financial displays (expenses, budgets, person wallets, dashboard)
- **FR-002**: System MUST default to Indian Rupee (₹) when no currency preference has been set
- **FR-003**: System MUST support at minimum Indian Rupee (₹) and US Dollar ($) as selectable currencies
- **FR-004**: System MUST provide a centralized amount formatting utility that accepts an amount in cents and a currency code, then returns a properly formatted string with the correct currency symbol and locale-appropriate number grouping (Indian lakh/crore grouping for INR, international thousand/million grouping for USD)
- **FR-005**: All amount inputs in existing add forms (add expense, set budget, credit entry, debit entry) MUST replace the existing displayed value with the newly entered digits when the user types, without appending new digits to the previous value. No dedicated edit-transaction feature is in scope for this iteration.
- **FR-006**: The dashboard MUST display a donut chart showing expense breakdown by category with proportional segment sizes; categories below 5% of total spending MUST be grouped into an "Others" segment
- **FR-007**: Donut chart segments MUST show a tooltip on hover/tap with the item name, amount (in selected currency), and percentage of total
- **FR-008**: Donut charts MUST display an empty state message when no expense data is available
- **FR-009**: All card-based UI components MUST use consistent styling with defined border radius, shadow, and padding values
- **FR-010**: Primary interactive elements (buttons, links, focus indicators) MUST use Indigo (#4F46E5) as the accent color
- **FR-011**: Positive financial indicators (credits, surplus, budget remaining) MUST use Green (#22C55E)
- **FR-012**: Negative financial indicators (debits, overspending, deficits) MUST use Red (#EF4444)
- **FR-013**: Categorical chart colors and data badges MUST include Cyan (#06B6D4) in the palette
- **FR-014**: App background in light mode MUST use #F8FAFC (Light Background)
- **FR-015**: All pages MUST render without horizontal scroll on screens from 320px to 1920px wide
- **FR-016**: Navigation MUST be usable on mobile-sized screens without overlapping elements

### Key Entities *(include if feature involves data)*

- **CurrencyConfig**: Represents the user's currency preference. Attribute: currency code (e.g., "INR", "USD"). Persisted in local storage. Applied globally to format all monetary displays.
- **ChartDataset**: Represents the data required to render a donut chart. Derived from Expense categories — not persisted as a separate entity. Contains labels, values, color assignments, and an optional "Others" aggregate segment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can change the currency setting and see all amounts across all pages update to the new currency symbol within 1 second
- **SC-002**: A user can enter amounts into any transaction form across 50 consecutive attempts without the input ever appending new digits to a previous value — each entry shows only the latest typed value
- **SC-003**: The donut chart renders with correct proportional data (including "Others" grouping for categories below 5%) within 500ms of page load
- **SC-004**: All card components use consistent spacing (same padding, border radius, and gap values) across every page — verified by visual inspection against a design token specification
- **SC-005**: The dashboard layout renders without horizontal scroll or overlapping elements at 375px, 768px, and 1280px screen widths
- **SC-006**: A user new to the app perceives the interface as "modern" and "professional" — measured by a task-completion satisfaction survey targeting 80% positive response

## Assumptions

- Currency formatting is a client-side only concern — no server-side currency conversion or exchange rate support is needed
- The amount input appending bug is caused by the input field treating each keystroke as a text concatenation rather than a numeric replacement (commonly seen when the input stores the previous value as a string default instead of starting fresh on focus)
- A lightweight charting approach will be used — no heavy charting framework is required since the data is simple (category totals)
- The existing dark mode feature should be preserved but adapted to use the new color palette
- No new database entities are needed — chart data is computed from existing Expense data; currency preference is stored in local storage
- The existing layout and component structure will be modified in-place rather than rewritten from scratch
- Typography improvements focus on existing font stack (Geist Sans/Geist Mono) with refined sizing, weight, and line-height — no new font loading required
- The following capabilities are explicitly out of scope for this iteration and deferred to future work: dedicated transaction editing UI, data export/import, cloud sync, multi-user support, recurring/scheduled transactions, and file attachments
- Responsive design targets standard breakpoints: mobile (≤640px), tablet (641px–1024px), desktop (≥1025px)
