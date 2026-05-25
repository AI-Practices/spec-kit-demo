# Implementation Plan: Dark Mode UI for Expense Tracker

**Branch**: `002-dark-mode-ui` | **Date**: 2026-05-25 | **Spec**: `specs/002-dark-mode-ui/spec.md`

**Input**: Feature specification from `/specs/002-dark-mode-ui/spec.md`

## Summary

Add dark mode support across the entire expense tracker app using the existing Tailwind v4 dark variant combined with a class-based strategy for manual override. The system follows the OS preference by default (`prefers-color-scheme`), and a theme toggle in the nav bar allows users to manually switch between Light, Dark, and System modes with persistence via localStorage.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)

**Primary Dependencies**: Tailwind CSS v4 `dark:` variant (built-in), React 19

**Storage**: localStorage for theme preference (single key `"theme"`)

**Testing**: None configured

**Target Platform**: Web browser (modern desktop/mobile)

**Project Type**: Web application (Next.js App Router)

**Performance Goals**: Theme toggle applies instantly; no layout shift or flash on page load

**Constraints**: Must work with the existing CSS variable approach in `globals.css`; no additional CSS-in-JS or runtime styling libraries

**Scale/Scope**: Single user, no auth — same assumptions as the base expense tracker

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate Results: PASS

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First Development | ✅ PASS | Spec exists at `specs/002-dark-mode-ui/spec.md` |
| II. Clean & Modular Code | ✅ PASS | Theme toggle as single-responsibility component; dark classes added inline to existing components |
| III. TypeScript Discipline | ✅ PASS | Theme type (light/dark/system), explicit props |
| IV. Convention Over Stack | ✅ PASS | Uses Tailwind v4's `dark:` variant — no new libraries |
| V. Progressive Enhancement | ✅ PASS | System-led (P1) before manual toggle (P2) |

### Justified Deviations

None.

## Project Structure

### Documentation (this feature)

```text
specs/002-dark-mode-ui/
├── plan.md              # This file
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

No new source files — this feature modifies existing files:

```text
app/
├── globals.css                           # MODIFY — add @variant dark + dark CSS vars
├── layout.tsx                            # MODIFY — add ThemeToggle in nav
├── page.tsx                              # MODIFY — add dark: classes
├── expenses/
│   └── page.tsx                          # MODIFY — add dark: classes
└── _components/
    ├── theme-toggle.tsx                  # NEW — theme management component
    ├── add-expense-form.tsx              # MODIFY — add dark: classes
    ├── expense-list.tsx                  # MODIFY — add dark: classes
    ├── dashboard-stats.tsx               # MODIFY — add dark: classes
    └── empty-state.tsx                   # MODIFY — add dark: classes
```

**Structure Decision**: Single project. No new directories. One new component (`theme-toggle.tsx`) handles all theme logic. All other changes are `dark:` Tailwind class additions to existing components.

## Complexity Tracking

No constitution violations.
