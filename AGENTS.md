# Dashboard

The staff dashboard: reception, calendar, pricing, invoicing, loyalty.

## Project

Next.js (app router) + React 19 + Tailwind v4 + shadcn/radix + zustand.
**bun** is the package manager. Runs on :3400.

## Language

The dashboard ships in **Swedish**. Its users are reception staff at Swedish
campsites and the domain vocabulary is Swedish (registerkort, säsongsplats,
gästnätter, boendenätter). Strings come from `src/lib/i18n`, never inline, so a
Norwegian or Danish operator is a translation file rather than a sweep through
every component.

## After every change

`bun run format` → `bun run lint` → `bun run typecheck` → `bun run build`, all
clean.

Never hand-edit `package.json`: use `bun add`. Add shadcn primitives with
`bunx --bun shadcn@latest add <name>`.

## Layout

```
src/
  app/                  Next routing ONLY — layouts, pages, route handlers. Thin.
  features/<name>/{components,hooks,api.ts,store.ts,types.ts,index.ts}
  components/ui/        shadcn primitives (generated, not hand-edited)
  lib/api/client.ts     base URL, auth header, RFC-7807 parsing
  lib/auth/             session and permission handling
  lib/i18n/             dictionaries
```

A feature is imported **only through its `index.ts`** (`@/features/calendar`,
never `@/features/calendar/components/…`). Anything used by two or more
features moves up to `components/` or `lib/`.

There is **no generated OpenAPI client** — types are hand-written in
`features/<name>/types.ts` and paths are hand-written strings. `/openapi.json`
and the Scalar UI at `/docs` are for humans.

## Cookies

`bokarn_staff_session` / `bokarn_staff_user`, deliberately distinct from the
guest site's names: browsers ignore the port, so on localhost both apps share
one cookie jar and identically-named cookies overwrite each other.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
