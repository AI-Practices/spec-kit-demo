# Feature Specification: Budget Tracker & UI Enhancement

**Feature Branch**: `003-budget-tracker-ui`

**Created**: 2026-05-25

**Status**: Draft

**Input**: User description: "Add budget tracker and update visually appealing ui"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Monthly Budgets Per Category (Priority: P1)

The user sets a monthly spending limit for each expense category. These budgets are persisted and applied to the current month. The user can view, edit, or remove any budget at any time.

**Why this priority**: Without setting budgets, there is nothing to track against. This is the foundational input action for the entire budget feature — it enables all subsequent budget tracking and visualization.

**Independent Test**: Can be fully tested by navigating to a budget management view, setting a budget amount for a category, and confirming it appears as saved. Refreshing the page must retain the budget.

**Acceptance Scenarios**:

1. **Given** the user is on the budget management page, **When** they set a monthly budget amount for a specific category and save, **Then** the budget is persisted and displayed as active for the current month
2. **Given** the user has an existing budget for a category, **When** they edit the budget amount and save, **Then** the updated amount replaces the previous value
3. **Given** the user has an existing budget for a category, **When** they remove the budget, **Then** the category no longer shows a budget limit
4. **Given** the user tries to set a budget with a negative or zero amount, **When** they submit, **Then** a validation error is shown and the budget is not saved

---

### User Story 2 - View Budget Progress on Dashboard (Priority: P2)

The user sees a visual overview of their spending against budgets directly on the dashboard. Each category with a budget displays a progress bar showing how much has been spent relative to the limit. Categories at risk of exceeding (over 80% spent) and those already exceeded are clearly highlighted.

**Why this priority**: The budget progress visualization is the core value users get from setting budgets — it gives them actionable insight into their spending at a glance.

**Independent Test**: Can be fully tested by setting a budget for a category, adding expenses in that category, and confirming the progress bar updates proportionally on the dashboard.

**Acceptance Scenarios**:

1. **Given** the user has set budgets and recorded expenses, **When** viewing the dashboard, **Then** each budgeted category shows a progress bar indicating spending vs. the limit
2. **Given** a category's spending reaches 80% or more of its budget, **When** viewing the dashboard, **Then** the progress bar is visually highlighted (e.g., amber/warning color)
3. **Given** a category's spending exceeds its budget, **When** viewing the dashboard, **Then** the progress bar is visually distinct (e.g., red/alert color) and the overspend amount is displayed
4. **Given** a category has no budget set, **When** viewing the dashboard, **Then** no progress bar is shown for that category

---

### User Story 3 - Visually Enhanced Interface (Priority: P3)

The entire app receives a visual polish pass — improved spacing, typography, card styling, hover effects, transitions, and overall layout refinement. The design feels modern, cohesive, and pleasant to use across all screens.

**Why this priority**: The app is already functional; visual polish enhances the user experience without changing any underlying behavior. It is independent of the budget tracking feature but improves overall satisfaction.

**Independent Test**: Can be fully tested by visually inspecting every screen (dashboard, expenses, budget management) and confirming consistent styling, smooth transitions, and readable contrast in both light and dark modes.

**Acceptance Scenarios**:

1. **Given** the user navigates between any pages, **When** they use the app, **Then** all pages share consistent typography, spacing, and visual rhythm
2. **Given** the user hovers over interactive elements (buttons, links, list items), **When** they interact, **Then** smooth visual feedback (transitions, color shifts, subtle scaling) confirms the element is interactive
3. **Given** the user views the app on different screen sizes, **When** they resize the browser, **Then** the layout adapts gracefully with appropriate spacing and alignment
4. **Given** any data-loading or empty states, **When** content is absent or loading, **Then** a polished placeholder or skeleton is displayed rather than a blank area

---

### User Story 4 - Monthly Budget Overview Page (Priority: P4)

The user visits a dedicated budget page that shows all categories with their budgets, current spending, remaining amounts, and percentage used — all for the selected month. The page provides a comprehensive monthly financial snapshot.

**Why this priority**: A dedicated budget page offers more detail than the dashboard summary and lets users review past months' budgets, which is valuable for long-term planning but not essential for daily use.

**Independent Test**: Can be fully tested by navigating to the budget page, verifying all category budgets are displayed with correct spending and remaining values, and switching between different months to view historical data.

**Acceptance Scenarios**:

1. **Given** the user has budgets and expenses across multiple categories, **When** they visit the budget page, **Then** all categories are listed with budget, spent, remaining, and percentage columns
2. **Given** the user wants to review a different month, **When** they change the month selector, **Then** the budget page updates to show budgets and expenses for the selected month
3. **Given** a category's spending exceeds its budget in the selected month, **When** viewing the budget page, **Then** the overspent amount is clearly highlighted with a negative remaining value

### Edge Cases

- **Month with no expenses**: Budget progress bars show 0% spent with a green/neutral indicator
- **Budget deleted after expenses have been recorded**: The category simply shows no budget; expenses remain unaffected
- **Month rollover**: When a new month starts, budget progress resets but the previous month's budgets and expense data remain intact for historical review
- **Budget set mid-month**: The budget compares against all expenses from the 1st of that month, including expenses recorded before the budget was created
- **Multiple budgets across months**: Each month has its own independent budgets; setting a budget in one month does not affect other months
- **All categories budgeted, no expenses**: All progress bars show 0% with neutral styling

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to set a monthly spending budget (positive integer cents) for any expense category
- **FR-002**: Users MUST be able to edit or remove an existing budget at any time
- **FR-003**: The system MUST validate that budget amounts are positive integers; negative, zero, and non-integer values MUST be rejected
- **FR-004**: Budgets MUST be tied to a specific month and year (e.g., May 2026) and persist across sessions
- **FR-005**: When a new month begins, budgets from the previous month MUST NOT automatically carry forward — the user sets each month independently
- **FR-006**: The dashboard MUST display a budget summary section showing all categories with budgets, their progress bars, and the current spending vs. limit
- **FR-007**: A budget progress bar MUST show green/neutral color when spending is under 80% of the limit
- **FR-008**: A budget progress bar MUST show amber/warning color when spending reaches 80% or more of the limit
- **FR-009**: A budget progress bar MUST show red/alert color when spending exceeds the limit, and the overspend amount MUST be displayed
- **FR-010**: The app MUST include a dedicated budget management page accessible from the navigation bar
- **FR-011**: The budget page MUST display all categories for the selected month, showing: budget amount, total spent, remaining amount, and percentage used
- **FR-012**: The budget page MUST allow users to switch between months to view or set budgets for any past, current, or future month
- **FR-013**: All screens MUST have consistent visual styling — unified typography, spacing, color palette, border radii, and hover/focus states
- **FR-014**: Interactive elements (buttons, links, cards, list items) MUST have smooth visual transitions (e.g., color, opacity, transform) on hover and focus
- **FR-015**: Empty states and loading states MUST display polished placeholders or informative messages instead of blank areas
- **FR-016**: The layout MUST remain readable and visually coherent across desktop and tablet screen widths
- **FR-017**: All visual enhancements MUST work in both light and dark modes without loss of contrast or readability
- **FR-018**: Budget data MUST persist across page reloads via client-side storage (same mechanism as expense data)

### Key Entities *(include if feature involves data)*

- **Budget**: A monthly spending limit for a single expense category. Attributes: id (UUID), category (one of the predefined categories), amount (positive integer cents), month (e.g., "2026-05"), createdAt (timestamp), updatedAt (timestamp)
- **Budget Summary**: A computed view combining a Budget with the sum of matching expenses for that category and month. Not stored — derived on render from budgets and expenses data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can set a budget for a category in under 20 seconds (select category, enter amount, save)
- **SC-002**: The dashboard budget section displays within 1 second for up to 10 budgeted categories
- **SC-003**: Budget progress bars update immediately (within one render cycle) after adding or deleting an expense
- **SC-004**: Every screen in the app renders with consistent visual styling — verified by visual comparison of typography, spacing, and color usage across all pages
- **SC-005**: Switching between months on the budget page completes in under 1 second
- **SC-006**: All interactive elements have visible hover/focus states — verified by tabbing through each page and confirming focus indicators are present

## Assumptions

- Budget periods are monthly (not weekly, bi-weekly, or yearly) — this is the standard personal budgeting interval
- Budgets do not auto-renew each month; the user actively sets budgets for months they want to track
- The existing predefined expense categories (Food & Dining, Transportation, Housing, Utilities, Entertainment, Shopping, Health, Other) are used for budgeting — no new category creation in this iteration
- Budget data uses the same client-side localStorage persistence as expenses
- Visual enhancements use the existing Tailwind CSS v4 utility classes and CSS custom properties — no new design system or component library is introduced
- The budget management page is a new navigation item, alongside Dashboard and Expenses
- No email notifications or alerts when budgets are exceeded — only in-app visual indicators
- No rollover of unused budget amounts to the next month
- Budgets can be set for past, current, or future months; future month budgets display with zero spending until expenses are recorded
- Budgets set mid-month count expenses retroactively from the 1st of that month

## Clarifications

### Session 2026-05-25

- Q: When a budget is set mid-month, should it compare against full-month expenses (retroactive) or only from creation date? → A: Full month (retroactive) — the budget compares against all expenses from the 1st of that month, even those recorded before the budget was set
- Q: Should users be able to set budgets for future months in advance, or only current/past months? → A: Any month — users can set budgets for past, current, or future months
