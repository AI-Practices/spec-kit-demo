# Feature Specification: Dark Mode UI for Expense Tracker

**Feature Branch**: `002-dark-mode-ui`

**Created**: 2026-05-25

**Status**: Draft

**Input**: User description: "Update the current spec to support dark mode UI across the app and add implementation tasks before Phase 6 completion."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - System-Led Dark Mode (Priority: P1)

The user opens the expense tracker on a device with dark mode enabled in system settings. The entire app — dashboard, expenses page, form, list, navigation — renders with a dark color scheme (light text on dark backgrounds) that is comfortable to read in low-light conditions.

**Why this priority**: Dark mode is a visual preference that affects every screen in the app. System-led detection is the most accessible approach — it respects the user's OS-level preference without requiring them to configure anything inside the app. This is the minimal viable change that delivers dark mode to users who need it.

**Independent Test**: Can be fully tested by toggling the device/system appearance setting between light and dark. The app should immediately switch between light and dark color schemes on all pages and components without any user action inside the app.

**Acceptance Scenarios**:

1. **Given** the user's device has dark mode enabled in system settings, **When** they visit any page of the expense tracker, **Then** all UI elements render with a dark color scheme
2. **Given** the user's device has light mode enabled in system settings, **When** they visit any page of the expense tracker, **Then** all UI elements render with a light color scheme
3. **Given** the user toggles their system appearance from light to dark (or vice versa), **When** they are on any page of the app, **Then** the UI transitions to match the new preference without requiring a page reload

### User Story 2 - Manual Dark Mode Toggle (Priority: P2)

The user wants to manually override their system preference. A visible control in the navigation bar lets them switch between light mode, dark mode, and system-default mode. Their choice persists across page reloads and sessions.

**Why this priority**: Manual override gives users control when their system preference doesn't match their current environment (e.g., dark mode desktop in a bright room). Persisting the choice prevents frustration from having to toggle on every visit.

**Independent Test**: Can be fully tested by toggling the control, refreshing the page, and confirming the preference is remembered. Also verify that "system" mode correctly follows the OS preference.

**Acceptance Scenarios**:

1. **Given** the user is on any page, **When** they click the theme toggle and select "Dark", **Then** the app switches to dark mode immediately
2. **Given** the user has selected "Dark" mode, **When** they refresh the page, **Then** the app still renders in dark mode
3. **Given** the user has selected "System" mode, **When** their OS theme changes, **Then** the app follows the OS preference
4. **Given** the user has selected "Light" mode while their OS is in dark mode, **When** they view the app, **Then** it renders in light mode regardless of OS setting

### Edge Cases

- **OS theme changes while app is open**: The app updates in real-time via a media query listener, no page reload needed
- **localStorage unavailable (private browsing)**: Falls back to system preference gracefully, toggle still works for the session
- **No OS-level dark mode support (older OS)**: System preference media query returns no match; app defaults to light mode
- **Rapid theme toggling**: Preference changes are debounced naturally by React re-render cycle; no double-save or flicker

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: ALL screens and components MUST respond to the system's `prefers-color-scheme` media query — no component should remain light-on-dark or unreadable when the OS switches to dark mode
- **FR-002**: The app MUST provide a visible manual theme toggle in the navigation bar
- **FR-003**: The manual toggle MUST support at least three states: Light, Dark, and System (follow OS preference)
- **FR-004**: The user's manual theme choice MUST persist across page reloads and browser sessions
- **FR-005**: Theme transitions SHOULD be smooth — abrupt flashes between light and dark SHOULD be avoided
- **FR-006**: All text, backgrounds, borders, interactive elements (buttons, inputs, links), and placeholder/states (empty state, validation errors, loading indicators) MUST be styled for both light and dark themes
- **FR-007**: Form inputs and controls (date picker, number input, textarea, select dropdown, buttons) MUST remain readable and usable in both themes — focus rings, hover states, and error states must have sufficient contrast in dark mode
- **FR-008**: The dashboard stats card and expense list rows MUST have distinct surface colors in dark mode (not pure black, but a dark gray that differentiates surfaces from backgrounds)
- **FR-009**: Error messages and validation states (red text, red backgrounds) MUST be legible in dark mode — use appropriately dimmed error colors

### Key Entities *(include if feature involves data)*

- **Theme Preference**: The user's selected theme mode (light, dark, or system). Stored as a simple string value, persisted in localStorage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every page and component in the app renders correctly in both light and dark modes, verified by visual inspection of each unique view
- **SC-002**: Toggling the manual theme switch applies the change instantly (within one React render cycle, imperceptible to the user)
- **SC-003**: The user's manual theme preference persists across page refreshes — verified by refreshing the page and confirming the chosen theme is still active
- **SC-004**: System-led dark mode activates within 1 second of toggling the OS preference while the app is open

## Assumptions

- The existing CSS variables and Tailwind v4 dark mode variant (`dark:`) are sufficient to implement the feature without additional libraries
- The project already supports the `@media (prefers-color-scheme: dark)` media query via globals.css — components just need `dark:` Tailwind classes
- A theme toggle button in the navigation bar is sufficient UX; a full settings panel is out of scope
- Theme preference data is small enough that localStorage is the appropriate persistence mechanism
- No analytics or tracking of theme usage is needed
- The app does not need an auto-schedule (e.g., "dark mode from 8pm to 6am") — only system-following and manual override
