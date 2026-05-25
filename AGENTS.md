<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key Next.js 16 changes (see docs for full list):
- `middleware` → `proxy` (file + export renamed; `edge` runtime not supported in proxy)
- All sync Request APIs removed: `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are async-only Promises
- Turbopack is default bundler; custom `webpack` config in `next.config` **fails** the build
- `'use cache'` directive replaces `dynamic`, `revalidate`, `fetchCache` route configs
- `export const unstable_instant` required on routes for instant client navigations (Suspense alone is insufficient)
- `revalidateTag('posts', 'cacheLife')` now requires second `cacheLife` argument
<!-- END:nextjs-agent-rules -->

<!-- SPECKIT START -->
The current implementation plan (from `/speckit.plan`) lives in `specs/<NNN-feature>/plan.md`.
Read it before making code changes.
<!-- SPECKIT END -->

## Available commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint (flat config: `eslint.config.mjs`) |
| `npm run start` | Start production server |

No typecheck or test scripts are configured. No test framework is installed.

## Stack

- **Next.js 16.2.6** — App Router (project uses `app/` directory layout)
- **React 19.2.4**, TypeScript 5, Tailwind CSS v4, PostCSS
- **Tailwind v4**: uses `@import "tailwindcss"` (not `@tailwind` directives)
- **Path alias**: `@/*` → `./*` (repo root)
- **ESLint 9** with flat config (`eslint.config.mjs`), includes `core-web-vitals` + `typescript` presets

## Spec Kit (speckit) workflow

This project uses Spec Kit for specification-driven development. Workflow:

1. `/speckit.specify <description>` — create feature spec in `specs/<NNN-feature>/spec.md`
2. `/speckit.plan` — generate implementation plan in `specs/<NNN-feature>/plan.md`
3. `/speckit.tasks` — break plan into tasks (`tasks.md`)
4. `/speckit.implement` — execute tasks

AGENTS.md serves as speckit's context file. The `<!-- SPECKIT START/END -->` markers are updated by `/speckit.plan` to reference the active plan. Do not remove them.

Additional speckit commands: `speckit.clarify`, `speckit.checklist`, `speckit.analyze`, `speckit.constitution`, `speckit.taskstoissues`.
