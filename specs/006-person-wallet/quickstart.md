# Quickstart: Person Wallet / Advance Ledger + Database Migration

## Prerequisites

- Node.js >= 18
- npm
- PostgreSQL 16 (local install or Docker)
- Git (for branch management)

## PostgreSQL Setup

### Option A: Local PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16
createdb spec_kit_demo
```

### Option B: Docker

```bash
docker run -d \
  --name spec-kit-pg \
  -e POSTGRES_USER=speckit \
  -e POSTGRES_PASSWORD=speckit \
  -e POSTGRES_DB=spec_kit_demo \
  -p 5432:5432 \
  postgres:16
```

## Environment Setup

Create `.env` at project root:

```bash
DATABASE_URL="postgresql://speckit:speckit@localhost:5432/spec_kit_demo"
```

## Install & Build

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Database Migration (from localStorage)

1. Open the current app (on the `main` branch) in a browser
2. Run this in the browser console to export existing data:
   ```js
   console.log(JSON.stringify(localStorage.getItem('expenses')))
   ```
3. Copy the output and save to `scripts/export-data.json`
4. Run the migration script:
   ```bash
   npx tsx scripts/migrate-from-localstorage.ts
   ```
5. Verify the data was migrated successfully

## Pages

| Route | Content | Feature |
|-------|---------|---------|
| `/` | Dashboard — totals + recent activity | (updated) |
| `/expenses` | Expense list with add/delete | (migrated to DB) |
| `/persons` | Person list with balances | P1 |
| `/persons/[id]` | Monthly credit grid | P1 |
| `/persons/[id]/debits` | Record a debit | P2 |
| `/persons/[id]/summary` | Summary + transaction history | P3 |

## Usage

### Add a person and record daily credits
1. Navigate to **/persons**
2. Click **Add Person** and enter a name
3. Click on the person to open their monthly grid
4. Tap any day cell, enter an amount, and save — the credit appears in the grid
5. Navigate between months using the month selector

### Record a debit
1. From a person's page, click **Record Debit**
2. Enter the amount and a reason/notes
3. Submit — balance decreases and the debit appears in transaction history

### View summary and history
1. From a person's page, click **Summary**
2. View total credited, total debited, and current balance
3. Scroll through the chronological transaction history
4. Delete any individual transaction if needed

## Development

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npx prisma studio   # Database GUI (Prisma Studio)
npx prisma migrate dev --name <migration-name>  # Create new migration
```

## Architecture Notes

- **Server Actions** (`'use server'`) handle all data mutations — client components call them directly
- **Prisma** is used for all database access via a singleton client (`src/server/db.ts`)
- **Balance is computed** from transactions — never stored as a separate field
- **No dual-read period** — localStorage → PostgreSQL migration is a one-time batch operation
- **Categories are database rows** (not TypeScript enums) for future user customization
- **All tables include `userId`** for future multi-user support, seeded with a single default user for v1
