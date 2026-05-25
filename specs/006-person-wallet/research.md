# Research: Person Wallet / Advance Ledger + Database Migration

## Unknowns Resolved

### 1. Prisma Client Singleton with Next.js 16

- **Decision**: Global singleton via `globalThis` — standard Prisma recommendation to prevent multiple instances during hot reload
- **Rationale**: Next.js dev server hot-reloads modules, creating duplicate Prisma Client instances that exhaust the connection pool. A single `globalThis`-scoped instance is created on first import and reused across all modules. In production, the globalThis bypass is skipped (single-instance lifecycle anyway).
- **Alternatives considered**: Creating new client per request (pool exhaustion), Prisma Accelerate (overkill for single-user v1, paid tier)

### 2. Prisma Inside Server Actions

- **Decision**: Import singleton client in `'use server'` files; validate with Zod before passing to Prisma; use `revalidatePath()` / `redirect()` after mutations
- **Rationale**: Server actions are the idiomatic Next.js 16 way to handle mutations. Zod validation before Prisma ensures type safety at the boundary. `revalidatePath()` purges router cache so UI reflects changes immediately.
- **Alternatives considered**: API routes (more boilerplate, no progressive enhancement), tRPC (additional abstraction layer not needed)

### 3. PostgreSQL Amount Storage

- **Decision**: Integer (Int) storing cents — consistent with existing localStorage approach
- **Rationale**: Exact precision, smallest storage (4 bytes), fastest arithmetic. Matches existing `Expense.amount: number` (integer cents) convention. Display formatting done client-side.
- **Alternatives considered**: `DECIMAL(12,2)` (more storage, slower), `money` type (locale-dependent, risky)
- **Currency column**: Added as `String @default("USD")` for future multi-currency support

### 4. ID Generation

- **Decision**: Use Prisma `@default(cuid())` for all entity IDs
- **Rationale**: CUIDs are URL-safe, sortable by creation time, collision-resistant without coordinating with a central authority. Compatible with the existing UUID approach used in localStorage.
- **Alternatives considered**: UUID v4 (not sortable, bulkier), auto-increment integers (sequential, reveals record count, requires coordination with multi-user sharding)

### 5. Soft Delete vs Hard Delete

- **Decision**: Hybrid approach — hard delete for person deletion (per spec clarification), but the schema uses `deleted_at` on all tables for future flexibility
- **Rationale**: The spec clarification explicitly chose hard delete. However, financial records benefit from soft-delete for audit trails. The `deleted_at` column exists but person deletion currently hard-deletes cascading records. Future iterations can switch to soft-delete without schema migration.
- **Tradeoff acknowledged**: Hard-deleting persons with transactions means lost transaction history. If reports need historical data for deleted persons, soft-delete should be adopted.

### 6. Multi-User Schema Preparation

- **Decision**: Add `userId` to every table from day one, seeded with a single default user for v1. No authentication system in v1 — use a constant/seed user ID.
- **Rationale**: Adding `userId` later requires a costly migration and backfill of existing data. A string column + index per table is negligible cost. The default user approach keeps things simple for v1 while making multi-user adoption a matter of adding auth and creating more user rows.
- **Alternatives considered**: No userId (painful migration later), Auth.js from v1 (unnecessary complexity for single-user), RLS (defense-in-depth but overkill without auth)

### 7. localStorage to PostgreSQL Migration Strategy

- **Decision**: Big-bang migration via Node.js seed script — no dual-read period
- **Rationale**: localStorage is synchronous client-only; PostgreSQL is server-side. Dual-reading creates complexity without benefit for a personal app. Migration script reads JSON export (from existing localStorage), validates with Zod, transforms, and inserts via Prisma in a transaction. Old localStorage data preserved as backup but app switches entirely to PostgreSQL.
- **Alternatives considered**: Gradual dual-read (complex, error-prone), manual re-entry (tedious, error-prone)

### 8. Schema Design — Categories as Database Table

- **Decision**: Categories stored as a database table (not a TypeScript enum) to support future user-customizable categories and multi-user isolation
- **Rationale**: The existing approach uses a TypeScript union type + Zod enum. Moving categories to a table allows CRUD operations, per-user customization, and foreign key relationships. The existing 8 categories are seeded as default rows. The `type` field distinguishes income vs expense categories.
- **Alternatives considered**: Keep TypeScript enum (inflexible, no multi-user customization), JSON column (no referential integrity)

### 9. Database Schema — Budgets Table

- **Decision**: Budgets table included in schema design for future use (v2), not implemented in this iteration
- **Rationale**: The user specified budgets as a required entity. The schema is created and migrations are ready, but no UI or server actions for budgets are implemented in this feature. This avoids scope creep while ensuring zero-migration future adoption.
- **Alternatives considered**: Skip budgets entirely (would require schema migration later), implement budgets now (scope too large)

### 10. Monthly Grid Performance

- **Decision**: Compute credit entries for a grid month via a single Prisma query filtered by person_id + date range; group by day in the application layer
- **Rationale**: For 50 persons × 1000 transactions each, a month's credit entries for one person is at most 31 records. A single indexed query + app-layer grouping is efficient and simple. No need for database-level pivot/aggregation.
- **Alternatives considered**: Raw SQL pivot query (over-optimization for the data volume), daily aggregation materialized view (premature optimization)

## Next.js 16 Considerations

- Server actions use `'use server'` directive — defined in `src/server/actions/` files
- All request APIs (`params`, `searchParams`, `cookies()`, `headers()`) are async and require `await`
- No `middleware` → this project uses `proxy` if needed (not needed — no auth in v1)
- Turbopack is default bundler — no custom `webpack` config
- Tailwind v4 uses `@import "tailwindcss"` (already configured)
- Use `revalidatePath()` after database mutations to refresh client cache
- Server actions with Prisma should use the Node.js runtime (not Edge) for database connectivity
- Read `node_modules/next/dist/docs/` before writing Next.js-specific code — version 16 contains breaking changes
