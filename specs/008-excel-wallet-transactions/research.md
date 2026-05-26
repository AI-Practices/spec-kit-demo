# Research: Excel Wallet Transactions

## Overview

No NEEDS CLARIFICATION items were present in the spec or plan. This document records technology decisions and their rationale for the Excel import/export feature.

## Technology Decisions

### Excel Library: SheetJS (xlsx)

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Use `xlsx` (SheetJS) community edition | Industry-standard for Node.js Excel read/write. Supports `.xlsx` read/write without external dependencies. Mature, well-documented, handles large files efficiently. | `exceljs` (heavier API, more dependencies), raw XML parsing (too low-level), `csv` parser (doesn't support `.xlsx`) |

### Formula Parsing: Custom Parser

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Custom regex-based parser for `=SUM(-amount1-amount2-...)` | The format is constrained and well-defined by the spec. No need for a full Excel formula engine. A simple regex extracts amounts between dashes. | `hot-formula-parser` (full Excel formula parser — overkill for a single pattern), regex + manual amount extraction (simpler, sufficient) |

### Dynamic Import for xlsx

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| `xlsx` loaded only in server actions (not client bundles) | Next.js App Router keeps server actions server-side. The `xlsx` library never ships to the browser, avoiding bundle bloat. | Client-side parsing (unnecessary, would bloat the bundle) |

### Data Refresh Pattern

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Use existing `revalidatePath()` pattern after successful import | Already established in the codebase for wallet mutations (credits, debits). Consistent with existing behavior. No new state management needed. | WebSocket push (overkill for single-user), manual refresh (worse UX), React context/global state (adds complexity for no gain) |

### Replace-on-Reimport

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Delete existing transactions for person+month, then insert new ones | Clarified during spec review. Ensures no duplicate data. Simple to implement with a Prisma `$transaction` (deleteMany + createMany). | Append-only (would create duplicates on re-upload), upsert per transaction (complex matching logic) |

## Edge Case Behaviors

| Edge Case | Decision |
|-----------|----------|
| Out-of-range day (e.g., Day 31 in April) | Warning in preview, skip cell, rest proceeds (clarified) |
| Multi-sheet file | User selects which sheet via dropdown in preview (clarified) |
| Re-import existing month | Replace old data entirely (clarified) |
| Corrupted file | Catch parse error, user-friendly message, no partial data |
| Duplicates across months | Not applicable — each import scoped to one month |
| Empty file | Detect as validation error (no parsable data found) |
