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

> **Review note (codex, 2026-06-18):** initial spec was No-Go; corrections folded in below.
> Key fixes: the app is **`output: 'standalone'`** (SSR/WEB_COMPUTE on Amplify per
> `amplify.yml`), **not** `output: 'export'` — docs are *statically prerendered* (SSG via
> `generateStaticParams` + `dynamicParams = false`), but this is not a static-export app. Use a
> **single** MDX path — compile MDX strings with **`@mdx-js/mdx`** in `src/lib/docs` (NOT
> `@next/mdx`, which is for `.mdx`-as-route-files; and NOT `next-mdx-remote`, which was archived
> Apr 2026). next-intl needs **`setRequestLocale(locale)`** in every docs page/layout/metadata.
> `CodeSnippets.tsx` is **not** reusable (needs templateId/jsonData, hard-codes a dashboard
> widget, and even uses the wrong `/pdf/generate` endpoint) — build a generic docs `CodeBlock`.

## Architecture

Next.js App Router (`output: 'standalone'`, deployed on Amplify WEB_COMPUTE per `amplify.yml`).
Locale routing exists at `src/app/[locale]/…` (`locales = ['en','es']`, default `en`,
`localePrefix: 'as-needed'` → en at root, es at `/es`).

- **Content** as MDX files per locale: `src/content/docs/<locale>/<section>/<page>.mdx`. Frontmatter
  holds **page metadata only** (`{ title, description }`) — ordering/slugs/labels live in the nav
  config (single source of truth, below), so the two can't drift. Sections: `getting-started/`,
  `api-reference/`, `cli/`.
- **Route** (branded, catch-all): `src/app/[locale]/docs/[[...slug]]/page.tsx`. It calls
  `setRequestLocale(locale)` first, resolves the MDX for `locale` + `slug` via `src/lib/docs`,
  and renders the compiled component with branded MDX components. **`generateStaticParams`**
  enumerates every slug × locale and **`export const dynamicParams = false`** → all docs pages
  prerendered at build, unknown slugs 404. A bare `/docs` (empty catch-all) **renders the
  getting-started landing directly** (no redirect).
- **MDX compilation**: in `src/lib/docs`, compile the MDX source string with **`@mdx-js/mdx`**
  (`compile`/`evaluate` against `react/jsx-runtime`, runs in RSC at build time). remark/rehype
  plugins are passed **here, in the compile call** (not `next.config.mjs`): `remark-gfm`,
  `rehype-slug`, `rehype-autolink-headings`, and **`rehype-pretty-code` (shiki)** for build-time
  syntax highlighting. New deps: `@mdx-js/mdx`, `remark-gfm`, `rehype-slug`,
  `rehype-autolink-headings`, `rehype-pretty-code`, `shiki`, `gray-matter` (frontmatter).
- **Docs layout** `src/app/[locale]/docs/layout.tsx` (also calls `setRequestLocale(locale)`):
  left **Sidebar** (sections/pages from the nav config, bilingual labels), site top-nav, content
  column with branded prose, right **on-page TOC**, **Prev/Next** pager. Reuse `components/ui/`;
  build a **generic `CodeBlock`** (do NOT reuse `CodeSnippets.tsx`).

## Components (single-responsibility units)

1. **`src/lib/docs/nav.ts`** — **single source of truth**: ordered sections → pages, each with
   `slug` + bilingual `label`. Drives Sidebar order, Pager order, and the set of valid slugs.
2. **`src/lib/docs/`** — content access layer keyed off `nav.ts`: `getDoc(locale, slug)`
   (read MDX file, `gray-matter` frontmatter, compile via `@mdx-js/mdx`), `getAllDocSlugs()`
   (from `nav.ts`), `getNavTree(locale)`. Pure/testable.
3. **`src/app/[locale]/docs/[[...slug]]/page.tsx`** + **`layout.tsx`** — render + chrome; both
   call `setRequestLocale(locale)`; `generateMetadata` (title/description from frontmatter, plus
   canonical + hreflang) also calls it.
4. **`src/components/docs/`** — `Sidebar`, `Toc`, `MdxComponents` (h1–h3 w/ anchor, code,
   table, `Callout`), `Pager`, **`CodeBlock`** (generic copyable code, brand-styled — replaces
   any `CodeSnippets` reuse). Internal doc links in MDX use the locale-aware `Link` from
   `src/i18n/routing.ts` (or a locale-aware anchor in `MdxComponents`) so `/es/docs` links stay in es.
5. **`src/content/docs/{en,es}/…`** — the MDX content (metadata-only frontmatter).

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

## Error handling & locale parity

- Unknown slug → `notFound()` (404 within the docs layout); `dynamicParams = false` makes any
  non-prebuilt path 404 automatically.
- **Locale parity is enforced, not faked:** every slug in `nav.ts` must have an MDX file in
  **both** `en` and `es`. A build/test check fails if a page is missing in either locale. There
  is **no silent fallback** to English under `/es/docs` (bad UX + bad hreflang/canonical) — a
  missing es page is a build failure to fix, not a runtime fallback.

## SEO

- Add docs URLs to `src/app/sitemap.ts` (every slug × locale) with hreflang/canonical via the
  existing SEO helpers. `generateMetadata` per page sets title/description (frontmatter) +
  canonical + `alternates.languages` (en/es).

## Testing

- `next build` succeeds and **prerenders every doc page × 2 locales** (assert
  `generateStaticParams` count == slugs × 2; `dynamicParams = false`).
- **Locale-parity check** (build/test): every `nav.ts` slug has an MDX file in both `en` and `es`
  — fails otherwise.
- Unit-test `src/lib/docs/` (nav ordering, `getDoc` frontmatter parse + compile, slug enumeration)
  — pure fns.
- Render smoke for `MdxComponents` / `Sidebar` / `Toc` / `CodeBlock`.
- Link/anchor integrity: internal doc links are locale-aware and resolve; heading anchors generated.
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
