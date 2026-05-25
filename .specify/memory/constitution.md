<!--
Sync Impact Report
------------------
Version change: N/A (template) → 1.0.0
Modified principles: N/A (all new)
Added sections:
  - I. Specification-First Development
  - II. Clean & Modular Architecture
  - III. TypeScript Discipline
  - IV. Convention Over Configuration
  - V. Progressive Enhancement
  - Technology Stack & Constraints
  - Development Workflow
Removed sections: none
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — no changes needed (generic reference)
  ✅ .specify/templates/spec-template.md — no changes needed
  ✅ .specify/templates/tasks-template.md — no changes needed
  ✅ .opencode/commands/ — no CLAUDE-specific references found
Follow-up TODOs: none
-->

# Spec Kit Demo Constitution

## Core Principles

### I. Specification-First Development

Every feature MUST begin with a specification in `specs/<NNN-feature>/spec.md`.
Code changes MUST follow the full SDD cycle: specify → plan → tasks → implement.
No code is written before its spec is approved. This ensures every change is
motivated, scoped, and reviewed before implementation begins.

### II. Clean & Modular Code

Components, layouts, and services MUST be organized into small,
single-responsibility modules. Separation of concerns between UI, data fetching,
and business logic is required. Each module SHOULD have a clear public interface
and hide internal implementation details. Duplication MUST be extracted into
shared modules rather than copy-pasted.

### III. TypeScript Discipline

All APIs, component props, state shapes, and function signatures MUST have
explicit TypeScript types. `any` MUST NOT be used — prefer `unknown` with type
narrowing where types cannot be predetermined. Strict mode is enabled in
`tsconfig.json` and MUST remain enabled.

### IV. Convention Over Configuration

Code MUST use the established stack consistently:

- **Next.js 16** with App Router (`app/` directory layout). Pages Router is not
  used. All route handlers, layouts, and pages follow App Router conventions.
  Read `node_modules/next/dist/docs/` before writing Next.js code — version 16
  contains breaking changes from earlier versions.
- **React 19** Server Components by default; `'use client'` only when
  interactivity, browser APIs, or React hooks are required.
- **Tailwind CSS v4** via `@import "tailwindcss"` in `globals.css`. Do NOT use
  the legacy `@tailwind` directive syntax.
- **TypeScript 5** with `bundler` module resolution.
- **ESLint 9** with flat config (`eslint.config.mjs`) — run `npm run lint`
  before committing.

### V. Progressive Enhancement

Features build incrementally by user story priority (P1 → P2 → P3). Each user
story MUST be independently testable and deliverable as a viable increment.
Parallel work on different stories is allowed once foundational phase is
complete. No story SHOULD depend on a lower-priority story.

## Technology Stack & Constraints

**Framework**: Next.js 16.2.6 (App Router, Turbopack bundler). Custom `webpack`
config in `next.config` will fail the build — use Turbopack-native config or
the top-level `turbopack` key.

**UI**: React 19.2.4 with Tailwind CSS v4 via PostCSS (`@tailwindcss/postcss`
plugin). Theme tokens defined in CSS using `@theme inline { ... }` blocks.

**Language**: TypeScript 5 (strict). Path alias `@/*` → `./*`.

**Linting**: ESLint 9 flat config with `core-web-vitals` + `typescript` presets.

**No test framework** is currently configured. When tests are added, they SHOULD
be placed in a `tests/` directory mirroring the source structure.

**No backend or database** — this is a frontend-only application. All data is
static or fetched from external APIs.

## Development Workflow

1. **Specify** — describe the feature in natural language via `/speckit.specify`.
   The spec MUST focus on WHAT users need and WHY, not HOW to implement.
   Technology-agnostic, business-facing language.

2. **Plan** — generate the technical plan via `/speckit.plan`. The plan MUST
   pass the Constitution Check gate before proceeding. All unclear technical
   decisions MUST be resolved (NEEDS CLARIFICATION → research), not deferred.

3. **Tasks** — break the plan into executable tasks via `/speckit.tasks`. Tasks
   MUST be organized by user story with clear dependencies.

4. **Implement** — execute tasks via `/speckit.implement`. Setup before core.
   Tests before code (if tests exist). Core before integration. Each phase
   validated before the next.

Review gates between each step are mandatory. Spec and plan MUST be reviewed
and approved before the next phase begins.

## Governance

The Constitution supersedes all other development practices and guidelines.
Amendments require:

- **MAJOR** (backward-incompatible governance changes): documented rationale,
  team review, and migration plan.
- **MINOR** (new principles or materially expanded guidance): documented
  rationale.
- **PATCH** (clarifications, wording, typo fixes): no approval needed but MUST
  be recorded.

All PRs and code reviews MUST verify compliance with this constitution.
Complexity that violates a principle MUST be justified in the Complexity
Tracking section of the implementation plan.

**Version**: 1.0.0 | **Ratified**: 2026-05-25 | **Last Amended**: 2026-05-25
