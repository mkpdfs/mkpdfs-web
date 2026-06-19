# Design — public `/docs` section on mkpdfs.com

**Date:** 2026-06-18
**Status:** Approved (brainstormed with user; pending codex review + user spec review)
**Repo:** `mkpdfs-web` (Next.js App Router, next-intl, Amplify), branch `feat/docs-section`

## Goal

Ship a public developer documentation section at `mkpdfs.com/docs` — the product has
**no developer docs today** (only the CLI README + internal CDK notes). v1 covers what an
API consumer needs to get started.

## Decisions (from brainstorming)

- **Public docs section on mkpdfs.com** (not a repo folder, not a separate site).
- **MDX in-app with a branded layout** — own sidebar/nav/prose styling matching the site,
  next-intl-aware (consistent with "build user-facing flows in mkpdfs-web with own branding").
- **v1 content: lean-complete** — Getting Started + API Reference + CLI guide.
- **Bilingual en + es from v1** (site is bilingual; both locales authored at launch).
- **Defaults applied** (minor, brainstorm sub-questions): API examples are **curl-first** in
  v1 (node/python deferred); **no search** in v1 (sidebar + IA suffice — YAGNI).

## Architecture

Next.js App Router, locale routing already exists at `src/app/[locale]/…`
(`locales = ['en','es']`, default `en`, `localePrefix: 'as-needed'` → en at root, es at `/es`).

- **Content** as MDX files per locale: `src/content/docs/<locale>/<section>/<page>.mdx`, each with
  frontmatter `{ title, description, order }`. Sections: `getting-started/`, `api-reference/`, `cli/`.
- **Route** (branded, catch-all): `src/app/[locale]/docs/[[...slug]]/page.tsx` resolves the MDX
  for the active `locale` + `slug`, compiles with **`next-mdx-remote/rsc`** (App-Router/RSC
  friendly; avoids unmaintained libs like contentlayer), renders with branded MDX components.
  `generateStaticParams` enumerates every slug × locale → fully **static (SSG)**, which suits
  Amplify hosting. A bare `/docs` redirects to the getting-started landing.
- **Docs layout** `src/app/[locale]/docs/layout.tsx`: left **Sidebar** (ordered sections,
  bilingual labels from a TS nav config), site top-nav, content column with branded prose,
  right **on-page TOC**, **Prev/Next** pager. Reuse `components/CodeSnippets.tsx` for copyable
  code blocks and existing `components/ui/`.
- **MDX setup** in `next.config.mjs`: add `@next/mdx` + remark/rehype plugins — `remark-gfm`,
  `rehype-slug`, `rehype-autolink-headings`, and **`rehype-pretty-code`/shiki** for syntax
  highlighting. (No MDX/remark deps exist yet — new dependencies.)

## Components (single-responsibility units)

1. **`src/lib/docs/`** — content access layer: `getDoc(locale, slug)`, `getAllDocSlugs()`,
   `getNavTree(locale)` (glob `src/content/docs/<locale>` + parse frontmatter, order by
   `order`). Pure, testable without rendering.
2. **`src/app/[locale]/docs/[[...slug]]/page.tsx`** + **`layout.tsx`** — render + chrome.
3. **`src/components/docs/`** — `Sidebar`, `Toc`, `MdxComponents` (h1–h3 w/ anchor, code,
   table, `Callout`), `Pager`. Each focused; Sidebar/Toc consume the nav tree.
4. **`src/content/docs/{en,es}/…`** — the MDX content.
5. **`src/lib/docs/nav.ts`** — ordered section/page config with bilingual labels (single source
   for Sidebar + Pager ordering).

## Content (v1, authored in en + es)

- **Getting Started:** create account / get an API key (dashboard), first PDF
  (`curl` with `x-api-key` → `POST /v1/pdf/generate`), install the CLI (`brew`).
- **API Reference:** Authentication (`x-api-key: tlfy_*`, how to create/rotate);
  `POST /v1/pdf/generate` (request/response/errors); `/v1/templates/*` CRUD
  (`GET /v1/templates`, `GET|PUT|DELETE /v1/templates/{id}`, `POST /v1/templates/upload`) with
  request/response/errors; error codes (401 auth, 402 INSUFFICIENT_CREDITS, 403); the 10 MB /
  ~6.5 MiB template size limit. Examples **curl-first**.
- **CLI Guide:** install (brew), `auth login`, `templates` (pull/push, headless `--api-key`),
  `pdf generate`, `credits` (balance/ledger/auto-recharge/buy), `tokens`/`usage`/`config`.

Content is sourced from the now-accurate CLAUDE.md, the CLI README, and the live API behavior
verified during #2.

## Error handling

- Unknown slug → Next.js `notFound()` (404 within the docs layout).
- `generateStaticParams` only emits slugs that exist for that locale; since v1 is bilingual,
  both locales have every page. (If a future locale lacks a page, the catch-all falls back to
  the default-locale MDX rather than 404 — noted for later, not needed in v1.)

## Testing

- `next build` succeeds and **SSG-generates every doc page × 2 locales** (assert params count).
- Unit-test `src/lib/docs/` (getNavTree ordering, getDoc parse, slug enumeration) — pure fns.
- Render smoke for `MdxComponents` / `Sidebar` / `Toc`.
- Link/anchor integrity: internal doc links resolve; heading anchors generated.
- **Visual verification**: run the app, screenshot `/docs` and `/es/docs` (branding, sidebar,
  code blocks, TOC, mobile nav).

## Coordination (concurrent session active in mkpdfs-web)

The other session works in `mkpdfs-web` via PRs (recent: auth-surface re-skin, SEO polish).
This work is isolated on `feat/docs-section` → **PR to `main`** (the repo's flow). Collision
risk is low (almost all new files under `src/content/docs`, `src/app/[locale]/docs`,
`src/components/docs`, `src/lib/docs`). **Shared-file touchpoints to watch / call out in the PR:**
`next.config.mjs` (MDX plugin wiring), `package.json` (new MDX/remark deps), and the site
top-nav/header if we add a "Docs" link. Rebase on `origin/main` before opening the PR; note the
docs work in the backend `COORDINATION.md` so the other session expects the PR.

## Out of scope (v1)

- Search (add later — Pagefind/Algolia or client-side index).
- node/python/Go code examples (curl-first v1).
- Versioned docs, changelog, API playground/"try it".
- OpenAPI-generated reference (could back the API Reference later).

## Rollout

Feature branch → `next build` green + visual check → PR to `main` → Amplify deploys
mkpdfs.com/docs. Bilingual at launch.
