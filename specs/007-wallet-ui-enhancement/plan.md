# Implementation Plan: Currency Support, Analytics Charts & UI Redesign

**Branch**: `007-wallet-ui-enhancement` | **Date**: 2026-05-26 | **Spec**: [specs/007-wallet-ui-enhancement/spec.md](spec.md)

**Input**: Feature specification from `specs/007-wallet-ui-enhancement/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Modernize the person-wallet expense tracker with three P1–P3 enhancements: (1) configurable currency (default ₹ INR) with centralized formatting and Indian lakh/crore numbering, (2) fix amount input appending bug in all transaction forms, (3) replace dashboard stats with donut charts for expense category breakdown, (4) apply fintech-style UI redesign (Indigo accent, Green/Red/Cyan semantic colors, elevated cards, light background #F8FAFC), (5) responsive layout across 320px–1920px.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2.4, Next.js 16.2.6

**Primary Dependencies**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4 (PostCSS), Prisma 7 + PostgreSQL. No charting library installed — to be selected in Phase 0.

**Storage**: PostgreSQL (via Prisma) for expenses, budgets, persons, wallet transactions. `localStorage` for currency preference (CurrencyConfig). Budget data still partially in localStorage via LegacyBudget.

**Testing**: None configured. No test framework in `package.json`.

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge). No SSR for client components.

**Project Type**: Web application (Next.js App Router, single-project monolith).

**Performance Goals**: Currency switch updates all visible amounts within 1s. Donut chart renders within 500ms of page load. Input keystroke response < 100ms.

**Constraints**: No backend currency conversion/rates. No new DB entities. No webpack custom config (Turbopack-only). All amounts stored as integer cents. Dark mode must be preserved and adapted.

**Scale/Scope**: Single-user frontend app with ~8 pages, ~15 components. 3 P1 user stories, 2 P2, 1 P3.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| **I. Specification-First** | ✅ PASS | Spec exists at `specs/007-wallet-ui-enhancement/spec.md`. |
| **II. Clean & Modular** | ✅ PASS (design) | Centralized `formatAmount` utility, modular `DonutChart` component, theme tokens in CSS. No monolithic components. |
| **III. TypeScript Discipline** | ✅ PASS (design) | All new APIs, props, state shapes will have explicit types. No `any`. |
| **IV. Convention Over Configuration** | ✅ PASS | Next.js App Router, Tailwind v4 `@import "tailwindcss"`, React Server Components by default, `'use client'` only for interactivity. |
| **V. Progressive Enhancement** | ✅ PASS | P1 (currency, input fix) → P2 (charts, UI redesign) → P3 (responsive). No lower-priority story depends on a higher one. |
| **Technology Stack** | ✅ PASS | Next.js 16, React 19, Tailwind v4, TypeScript strict. No webpack config. |

**Post-Phase 1 Re-Evaluation**:

| Gate | Status | Notes |
|------|--------|-------|
| **I. Specification-First** | ✅ PASS | Spec exists, plan traceable to spec. |
| **II. Clean & Modular** | ✅ PASS | Centralized `formatAmount`, `useCurrency` hook, `buildChartDataset` transform, `DonutChart` component — each single-responsibility. |
| **III. TypeScript Discipline** | ✅ PASS | All contracts have explicit types. No `any` in any proposed module. |
| **IV. Convention Over Configuration** | ✅ PASS | Next.js App Router, Tailwind v4 `@import "tailwindcss"`, RSC by default. |
| **V. Progressive Enhancement** | ✅ PASS | P1a (currency) + P1b (input fix) before P2a (charts) + P2b (UI) before P3 (responsive). |
| **Technology Stack** | ✅ PASS | Charts add `chart.js` + `react-chartjs-2` — compatible with React 19 + Next.js 16. |

**No violations detected.** Complexity Tracking section is not required.

## Project Structure

### Documentation (this feature)

```text
specs/007-wallet-ui-enhancement/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── _components/
│   ├── add-expense-form.tsx      # MODIFY: fix amount input
│   ├── budget-manager.tsx        # MODIFY: fix amount input, apply new theme
│   ├── budget-progress-bar.tsx   # MODIFY: apply new theme
│   ├── dashboard-budgets.tsx     # MODIFY: apply new theme
│   ├── dashboard-stats.tsx       # MODIFY: integrate donut chart, apply new theme
│   ├── debit-form.tsx            # MODIFY: fix amount input, apply new theme
│   ├── donut-chart.tsx           # NEW: donut chart component
│   ├── empty-state.tsx           # KEEP (used by chart)
│   ├── expense-list.tsx          # MODIFY: apply new theme
│   ├── month-picker.tsx          # MODIFY: apply new theme
│   ├── monthly-grid.tsx          # MODIFY: fix amount input, apply new theme
│   ├── person-list.tsx           # MODIFY: apply new theme
│   ├── person-nav.tsx            # MODIFY (minor visual update)
│   ├── person-summary.tsx        # MODIFY: apply new theme
│   ├── theme-toggle.tsx          # MODIFY: adapt dark mode palette
│   └── currency-selector.tsx     # NEW: currency switcher control
├── budgets/
│   └── page.tsx                  # MODIFY: apply new theme
├── expenses/
│   └── page.tsx                  # MODIFY: apply new theme
├── persons/
│   ├── page.tsx                  # MODIFY: apply new theme
│   └── [id]/...
├── globals.css                   # MODIFY: update color tokens, add Indigo/Cyan/Light BG
├── layout.tsx                    # MODIFY: integrate currency selector in nav
└── page.tsx                      # MODIFY: apply new theme

lib/
├── format-amount.ts              # NEW: centralized currency formatting utility
└── currency-config.ts            # NEW: currency preference persistence (localStorage)
```

**Structure Decision**: Single Next.js App Router project with new shared modules in `lib/` and new component in `app/_components/`. All modifications are in-place — no directory restructuring needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations — Complexity Tracking section omitted.*
