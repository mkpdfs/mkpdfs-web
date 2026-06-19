# Public `/docs` Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public, bilingual (en+es) developer docs section at mkpdfs.com/docs — Getting Started + API Reference + CLI guide — as branded MDX pages in the existing Next.js app.

**Architecture:** MDX content files per locale under `src/content/docs/<locale>/…`, compiled at build time with `@mdx-js/mdx` in `src/lib/docs`, rendered by a branded catch-all route `src/app/[locale]/docs/[[...slug]]`. Statically prerendered (`generateStaticParams` + `dynamicParams = false`) under the app's existing `output: 'standalone'` Amplify hosting. A `nav.ts` config is the single source of truth for ordering/slugs/labels.

**Tech Stack:** Next.js 14.2 (App Router), React 18, next-intl, TypeScript, `@mdx-js/mdx`, remark/rehype, shiki, npm.

**Spec:** `mkpdfs-web/docs/superpowers/specs/2026-06-18-docs-section-design.md`

## Global Constraints

- Repo `mkpdfs-web`, branch `feat/docs-section` (already created). Repo flow is **PR to `main`** (a concurrent session also works here via PRs — keep changes in new files; the only shared edits are `package.json`, `src/app/sitemap.ts`, and the header nav).
- App is `output: 'standalone'` (NOT static export). Docs are statically prerendered: `generateStaticParams` + `export const dynamicParams = false`. The docs render path must NOT use `cookies()`/`headers()`/`searchParams` (keep it build-time static).
- **One MDX path: `@mdx-js/mdx`** (compile in `src/lib/docs`, plugins in the compile call). Do NOT add `@next/mdx` or `next-mdx-remote`. No `next.config.mjs` MDX change.
- Locales `['en','es']`, default `en`, `localePrefix: 'as-needed'` (en at root, es at `/es`). Call `setRequestLocale(locale)` in docs page + layout before any intl API.
- **Bilingual parity enforced:** every nav slug must have an MDX file in BOTH `en` and `es`; a missing file fails the build (guard in `src/lib/docs`). No silent English fallback under `/es`.
- `nav.ts` is the single source of truth for section/page order, slugs, and bilingual labels. Frontmatter holds page metadata only (`title`, `description`).
- Do NOT reuse `src/components/CodeSnippets.tsx` (dashboard widget, wrong endpoint) — build a generic `CodeBlock`.
- No test runner exists in this repo. Verification = `npx tsc --noEmit`, `npm run lint`, `npm run build` (compiles MDX + runs `generateStaticParams` for all slugs×locales; build fails on MDX errors or parity violations), and visual screenshots of `/docs` + `/es/docs`.
### Binding corrections (codex review, 2026-06-18) — apply throughout

- **Lib must not import React components.** Split into `src/lib/docs/source.ts` (fs, gray-matter
  frontmatter, `assertLocaleParity`, slug validation — no React) and `src/lib/docs/compile.ts`
  (MDX `evaluate` + heading collector). `compileDoc(body)` returns **`{ Content, headings }`**
  (NOT a pre-rendered element); the **page** renders `Content({ components: mdxComponents })`.
  Pass `baseUrl: import.meta.url` to `evaluate`.
- **TOC via a rehype heading collector** in the same compile pass (after `rehypeSlug`, before
  `rehypeAutolinkHeadings`): visit `h2`/`h3`, read `node.properties.id` + text (`hast-util-to-string`),
  collect into `headings: {id,text,depth}[]`, return from `compileDoc`, render `<Toc headings={headings} />`.
- **No `prose`/`@tailwindcss/typography`** (not installed). Style via `MdxComponents` element map +
  a `.mk-docs` container class + explicit CSS for `rehype-pretty-code` output (`pre`, `[data-line]`,
  horizontal overflow, border, background; `keepBackground: false` in the plugin opts).
- **Route validation:** invalid locale → `notFound()` (not `return null`); validate the resolved
  slug against `allDocSlugs` before reading disk.
- **Metadata:** reuse `pageMetadata({ locale, path, title, description })` from `src/lib/seo.ts`
  (gives canonical + hreflang + OG/twitter) — do not hand-roll alternates.
- **CodeBlock** copies via a `pre` ref's `innerText` (pretty-code emits nested spans, not raw string
  children).
- Node runtime only (no Edge); no request-time APIs in the docs path.

- API facts for content (verified live during #2): auth header `x-api-key: tlfy_*`; `POST /v1/pdf/generate`; `/v1/templates` (GET list), `/v1/templates/{id}` (GET/PUT/DELETE), `/v1/templates/upload` (POST); errors 401 (auth), 402 `INSUFFICIENT_CREDITS`, 403; template size limit ~6.5 MiB. CLI: `brew install mkpdfs/mkpdfs/mkpdfs`, `mkp auth login`, `mkp templates pull/push [--api-key]`, `mkp pdf generate`, `mkp credits`, `mkp tokens/usage/config`.

---

### Task 1: Dependencies + content lib + nav config

**Files:**
- Modify: `package.json` (add deps)
- Create: `src/lib/docs/nav.ts`
- Create: `src/lib/docs/source.ts` (fs/frontmatter/parity/slug validation — NO React)
- Create: `src/lib/docs/compile.ts` (MDX evaluate + heading collector)

**Interfaces:**
- Produces:
  - `nav.ts`: `type Locale = 'en'|'es'`; `type DocPage = { slug: string; label: Record<Locale,string> }`; `type DocSection = { id: string; label: Record<Locale,string>; pages: DocPage[] }`; `export const docsNav: DocSection[]`; `export const allDocSlugs: string[]` (flattened, nav order); `export const landingSlug: string` (first slug).
  - `source.ts`: `getDocSource(locale, slug): { title: string; description: string; body: string }` (reads `src/content/docs/<locale>/<slug>.mdx`, gray-matter); `isValidSlug(slug): boolean` (in `allDocSlugs`); `assertLocaleParity(): void` (throws if any `allDocSlugs` MDX missing in en or es — called from `generateStaticParams`). No React imports.
  - `compile.ts`: `type Heading = { id: string; text: string; depth: 2|3 }`; `compileDoc(body): Promise<{ Content: MDXContent; headings: Heading[] }>` (compile via `@mdx-js/mdx` `evaluate` with `react/jsx-runtime`, `baseUrl: import.meta.url`, plugins incl. a `collectHeadings` rehype plugin). Does NOT import `mdxComponents` — the page passes them at render: `Content({ components: mdxComponents })`.

- [ ] **Step 1: Add dependencies**

Run:
```bash
cd mkpdfs-web
npm install @mdx-js/mdx@^3 gray-matter@^4 remark-gfm@^4 rehype-slug@^6 rehype-autolink-headings@^7 rehype-pretty-code@^0.13 shiki@^1 hast-util-to-string@^3 unist-util-visit@^5
```
Expected: installs, updates `package.json` + `package-lock.json`, no peer-dep errors (all support React 18 / Next 14).

- [ ] **Step 2: Create the nav config (single source of truth)**

`src/lib/docs/nav.ts`:
```ts
// Single source of truth for docs ordering, slugs, and bilingual labels.
// Frontmatter in the MDX files holds page metadata only (title/description).
export type Locale = 'en' | 'es'
export type DocPage = { slug: string; label: Record<Locale, string> }
export type DocSection = { id: string; label: Record<Locale, string>; pages: DocPage[] }

export const docsNav: DocSection[] = [
  {
    id: 'getting-started',
    label: { en: 'Getting Started', es: 'Primeros pasos' },
    pages: [
      { slug: 'getting-started/introduction', label: { en: 'Introduction', es: 'Introducción' } },
      { slug: 'getting-started/quickstart', label: { en: 'Quickstart', es: 'Inicio rápido' } },
      { slug: 'getting-started/cli-install', label: { en: 'Install the CLI', es: 'Instalar el CLI' } },
    ],
  },
  {
    id: 'api-reference',
    label: { en: 'API Reference', es: 'Referencia de API' },
    pages: [
      { slug: 'api-reference/authentication', label: { en: 'Authentication', es: 'Autenticación' } },
      { slug: 'api-reference/generate-pdf', label: { en: 'Generate a PDF', es: 'Generar un PDF' } },
      { slug: 'api-reference/templates', label: { en: 'Templates', es: 'Plantillas' } },
      { slug: 'api-reference/errors', label: { en: 'Errors', es: 'Errores' } },
    ],
  },
  {
    id: 'cli',
    label: { en: 'CLI', es: 'CLI' },
    pages: [
      { slug: 'cli/overview', label: { en: 'Overview', es: 'Resumen' } },
      { slug: 'cli/templates', label: { en: 'Templates', es: 'Plantillas' } },
      { slug: 'cli/credits', label: { en: 'Credits', es: 'Créditos' } },
    ],
  },
]

// Flattened in nav order. The FIRST slug is the /docs landing.
export const allDocSlugs: string[] = docsNav.flatMap((s) => s.pages.map((p) => p.slug))
export const landingSlug = allDocSlugs[0]
```

- [ ] **Step 3: Create the source loader + parity guard (no React)**

`src/lib/docs/source.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { allDocSlugs, type Locale } from './nav'

const DOCS_DIR = path.join(process.cwd(), 'src/content/docs')
const filePath = (locale: Locale, slug: string) =>
  path.join(DOCS_DIR, locale, `${slug}.mdx`)

export const isValidSlug = (slug: string) => allDocSlugs.includes(slug)

export function getDocSource(locale: Locale, slug: string) {
  const { data, content } = matter(fs.readFileSync(filePath(locale, slug), 'utf8'))
  return {
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    body: content,
  }
}

// Build-time guard: every nav slug must exist in BOTH locales. Called from
// generateStaticParams so `next build` fails loudly on a missing translation.
export function assertLocaleParity(): void {
  const missing: string[] = []
  for (const slug of allDocSlugs) {
    for (const locale of ['en', 'es'] as Locale[]) {
      if (!fs.existsSync(filePath(locale, slug))) missing.push(`${locale}/${slug}.mdx`)
    }
  }
  if (missing.length) {
    throw new Error(`[docs] missing MDX files (locale parity):\n  ${missing.join('\n  ')}`)
  }
}
```

- [ ] **Step 4: Create the MDX compiler + heading collector (no component import)**

`src/lib/docs/compile.ts`:
```ts
import { evaluate, type MDXContent } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'

export type Heading = { id: string; text: string; depth: 2 | 3 }

// rehype plugin: collect h2/h3 (after rehype-slug has set ids) into `sink`.
const collectHeadings = (sink: Heading[]) => () => (tree: any) => {
  visit(tree, 'element', (node: any) => {
    if (node.tagName === 'h2' || node.tagName === 'h3') {
      const id = node.properties?.id
      if (id) sink.push({ id, text: toString(node), depth: node.tagName === 'h2' ? 2 : 3 })
    }
  })
}

export async function compileDoc(body: string): Promise<{ Content: MDXContent; headings: Heading[] }> {
  const headings: Heading[] = []
  const { default: Content } = await evaluate(body, {
    ...runtime,
    baseUrl: import.meta.url,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      collectHeadings(headings),
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [rehypePrettyCode, { theme: 'github-dark', keepBackground: false }],
    ],
  })
  return { Content, headings }
}
```
(The page calls `Content({ components: mdxComponents })` — `compile.ts` never imports components, so the lib has no React dependency and Task 1 typechecks standalone.)

- [ ] **Step 5: Typecheck + lint**

Run: `cd mkpdfs-web && npx tsc --noEmit && npm run lint`
Expected: PASS (lib is self-contained; no forward dependency on Task 2).

- [ ] **Step 6: Commit**

```bash
cd mkpdfs-web
git add package.json package-lock.json src/lib/docs
git commit -m "feat(docs): MDX deps + content lib (nav/source/compile, single source of truth)"
```

---

### Task 2: Branded docs route, layout, and components (vertical slice)

**Files:**
- Create: `src/app/[locale]/docs/layout.tsx`
- Create: `src/app/[locale]/docs/[[...slug]]/page.tsx`
- Create: `src/components/docs/MdxComponents.tsx`
- Create: `src/styles/docs.css` (or a CSS module) — styling for MDX prose + `rehype-pretty-code` output
- Create: `src/components/docs/CodeBlock.tsx`
- Create: `src/components/docs/Sidebar.tsx`
- Create: `src/components/docs/Toc.tsx`
- Create: `src/components/docs/Pager.tsx`
- Create: `src/content/docs/en/getting-started/introduction.mdx` (+ all other slugs as short stubs so the build's parity guard passes — real content lands in Tasks 3–5)
- Create: `src/content/docs/es/getting-started/introduction.mdx` (+ es stubs)

**Interfaces:**
- Consumes: `docsNav`, `allDocSlugs`, `landingSlug` (Task 1 nav.ts); `getDocSource`, `compileDoc`, `assertLocaleParity` (Task 1 content.ts).
- Produces: a working `/docs` and `/es/docs` plus every nav slug, statically prerendered.

- [ ] **Step 1: Create the MDX components map + CodeBlock**

`src/components/docs/CodeBlock.tsx` — a generic client component wrapping a `<pre>` with a copy button (brand-styled; rehype-pretty-code already emits highlighted `<pre><code>`, so this wraps `children` and adds copy). `src/components/docs/MdxComponents.tsx` — map `h1/h2/h3` (anchored), `a` (locale-aware internal links via `@/i18n/routing` `Link` when href starts with `/`), `pre` → `CodeBlock`, `table`, plus a `Callout`. (Full component code written by the implementer per these responsibilities; keep each file focused and brand-consistent with the landing.)

- [ ] **Step 2: Create Sidebar, Toc, Pager**

`Sidebar.tsx` (server component): renders `docsNav` for the active locale (labels from nav.ts), highlights the active slug, links via locale-aware `Link`. `Pager.tsx`: prev/next from `allDocSlugs` order. `Toc.tsx`: on-page table of contents from the page's headings (derive from the compiled content or a rehype-collected heading list). Brand-styled to match the site.

- [ ] **Step 3: Create the layout + catch-all page**

`src/app/[locale]/docs/layout.tsx`:
```tsx
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Sidebar } from '@/components/docs/Sidebar'

export default async function DocsLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!routing.locales.includes(locale as any)) notFound()
  setRequestLocale(locale)
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10">
      <Sidebar locale={locale as 'en' | 'es'} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
```

`src/app/[locale]/docs/[[...slug]]/page.tsx`:
```tsx
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { allDocSlugs, landingSlug, type Locale } from '@/lib/docs/nav'
import { getDocSource, isValidSlug, assertLocaleParity } from '@/lib/docs/source'
import { compileDoc } from '@/lib/docs/compile'
import { pageMetadata } from '@/lib/seo'
import { mdxComponents } from '@/components/docs/MdxComponents'
import { Pager } from '@/components/docs/Pager'
import { Toc } from '@/components/docs/Toc'

export const dynamicParams = false

export function generateStaticParams() {
  assertLocaleParity() // fail build on missing translations
  const params: { locale: string; slug?: string[] }[] = []
  for (const locale of routing.locales) {
    params.push({ locale, slug: [] }) // /docs landing
    for (const slug of allDocSlugs) params.push({ locale, slug: slug.split('/') })
  }
  return params
}

const resolveSlug = (slug?: string[]) => (slug && slug.length ? slug.join('/') : landingSlug)

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug?: string[] }> },
): Promise<Metadata> {
  const { locale, slug } = await params
  const resolved = resolveSlug(slug)
  if (!isValidSlug(resolved)) return {}
  const { title, description } = getDocSource(locale as Locale, resolved)
  const path = `/docs${slug && slug.length ? '/' + slug.join('/') : ''}`
  return pageMetadata({ locale, path, title: `${title} — mkpdfs docs`, description })
}

export default async function DocPage(
  { params }: { params: Promise<{ locale: string; slug?: string[] }> },
) {
  const { locale, slug } = await params
  if (!routing.locales.includes(locale as any)) notFound()
  setRequestLocale(locale)
  const resolved = resolveSlug(slug)
  if (!isValidSlug(resolved)) notFound()
  const { title, body } = getDocSource(locale as Locale, resolved)
  const { Content, headings } = await compileDoc(body)
  return (
    <div className="mk-docs flex gap-8">
      <article className="min-w-0 flex-1">
        <h1>{title}</h1>
        {Content({ components: mdxComponents })}
        <Pager locale={locale as Locale} slug={resolved} />
      </article>
      <Toc headings={headings} />
    </div>
  )
}
```
`Content({ components: mdxComponents })` renders the evaluated MDX with the branded component
map (codex-confirmed pattern for evaluated MDX). The `.mk-docs` class + `docs.css` carry styling
(no `prose`/typography plugin). `<Toc headings={headings} />` consumes the collector output.

- [ ] **Step 4: Create stub MDX for every nav slug (both locales) so the build passes**

For each of the 10 slugs in `nav.ts`, create `src/content/docs/en/<slug>.mdx` and `src/content/docs/es/<slug>.mdx` with frontmatter (`title`, `description`) + a one-paragraph stub. (Real content in Tasks 3–5.) Example `en/getting-started/introduction.mdx`:
```mdx
---
title: Introduction
description: What mkpdfs is and how the docs are organized.
---

mkpdfs turns Handlebars templates into PDFs via API, CLI, or web dashboard. _(Full content coming.)_
```

- [ ] **Step 5: Build + lint + visual check**

Run: `cd mkpdfs-web && npm run lint && npm run build`
Expected: build succeeds; output shows `/[locale]/docs/[[...slug]]` prerendered for 22 paths ((10 slugs + 1 landing) × 2 locales). Then `npm run dev` and screenshot `http://localhost:3003/docs` and `/es/docs` — sidebar, prose, code block, locale switch render branded.

- [ ] **Step 6: Commit**

```bash
cd mkpdfs-web
git add src/app/[locale]/docs src/components/docs src/content/docs
git commit -m "feat(docs): branded MDX route + layout + sidebar/toc/pager/codeblock (vertical slice)"
```

---

### Task 3: Getting Started content (en + es)

**Files:** Replace stubs with full content:
- `src/content/docs/{en,es}/getting-started/{introduction,quickstart,cli-install}.mdx`

**Interfaces:** Consumes the route/components from Task 2. No code changes.

- [ ] **Step 1: Write the three Getting Started pages in both locales**

Content per page (write real prose + working examples; mirror en↔es):
- `introduction`: what mkpdfs is (Handlebars → PDF), the three ways to use it (API, CLI, dashboard), credits model in one line ($10 = 1,000 credits = 1,000 PDF pages, 10 welcome credits), and a docs map.
- `quickstart`: (1) sign up at mkpdfs.com, (2) create an API key in the dashboard, (3) first PDF with curl:
  ```bash
  curl -X POST https://apis.mkpdfs.com/v1/pdf/generate \
    -H "x-api-key: tlfy_..." -H "Content-Type: application/json" \
    -d '{"templateId":"<id>","data":{"name":"World"}}'
  ```
  (Use the real generate request shape — verify against `src/functions/pdf/generate` in mkpdfs-backend before writing.) Show the JSON response (pdf url) and link to API Reference.
- `cli-install`: `brew install mkpdfs/mkpdfs/mkpdfs`, `mkp auth login`, first `mkp pdf generate`. Link to the CLI section.

- [ ] **Step 2: Build + visual**

Run: `cd mkpdfs-web && npm run build`
Expected: succeeds; spot-check `/docs/getting-started/quickstart` and `/es/docs/getting-started/quickstart` render with highlighted code + copy button.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/en/getting-started src/content/docs/es/getting-started
git commit -m "docs(content): Getting Started pages (en+es)"
```

---

### Task 4: API Reference content (en + es)

**Files:** `src/content/docs/{en,es}/api-reference/{authentication,generate-pdf,templates,errors}.mdx`

**Interfaces:** No code changes.

- [ ] **Step 1: Write the four API Reference pages in both locales**

Before writing, verify exact request/response shapes against the backend handlers (`mkpdfs-backend/src/functions/pdf/generateApiKey`, `templates/*ApiKey`). Content:
- `authentication`: `x-api-key: tlfy_*` header; how to create/rotate a key (dashboard or `mkp tokens create`); keys are full-account; v1 routes are server-to-server (no browser/JWT). Note Bearer is rejected on `/v1/*`.
- `generate-pdf`: `POST /v1/pdf/generate` — method, URL, headers, request body fields, success response (PDF url + pageCount), and that it debits credits (1 credit/page). curl example.
- `templates`: the CRUD set — `GET /v1/templates`, `GET /v1/templates/{id}`, `POST /v1/templates/upload` (JSON base64 body `{name, content, contentEncoding:"base64"}`, ~6.5 MiB limit), `PUT /v1/templates/{id}`, `DELETE /v1/templates/{id}`. curl per endpoint + response shapes.
- `errors`: table of `401` (auth), `402 INSUFFICIENT_CREDITS` (with the buy-credits hint), `403`, `404`; error body shape `{message, error?}`.

- [ ] **Step 2: Build + visual**

Run: `cd mkpdfs-web && npm run build`
Expected: succeeds; spot-check `/docs/api-reference/templates` (+ `/es/...`) render tables + code.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/en/api-reference src/content/docs/es/api-reference
git commit -m "docs(content): API Reference pages (en+es)"
```

---

### Task 5: CLI guide content (en + es)

**Files:** `src/content/docs/{en,es}/cli/{overview,templates,credits}.mdx`

**Interfaces:** No code changes.

- [ ] **Step 1: Write the three CLI pages in both locales**

Source the commands from `mkpdfs-cli/README.md` (now accurate). Content:
- `overview`: install (brew), `mkp auth login` (device flow), env (`--env dev|prod`), global flags (`--json`, `--yes`), config location. Command tree.
- `templates`: `mkp templates list/get/pull/push/delete`, `.mkpdfs.json` mapping, headless CI with `--api-key` (push requires a checked-in entry or `--new`; size cap), env/conflict guards.
- `credits`: `mkp credits` (balance + auto-recharge), `mkp credits ledger`, `mkp credits auto-recharge --enable/--disable`, `mkp credits buy`.

- [ ] **Step 2: Build + visual**

Run: `cd mkpdfs-web && npm run build`
Expected: succeeds; spot-check `/docs/cli/templates` (+ es).

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/en/cli src/content/docs/es/cli
git commit -m "docs(content): CLI guide pages (en+es)"
```

---

### Task 6: Sitemap, header nav link, and final verification

**Files:**
- Modify: `src/app/sitemap.ts` (add docs URLs)
- Modify: the site header/nav component (add a "Docs" link — locate the landing header in `src/components/landing` or `src/components/layout`)

**Interfaces:** Consumes `allDocSlugs`, `landingSlug` from Task 1.

- [ ] **Step 1: Add docs URLs to the sitemap**

In `src/app/sitemap.ts`, extend `allPages` with the docs landing + every slug (priority ~0.7, changeFrequency 'weekly'), reusing the existing `localizedUrl` + `alternates.languages` pattern:
```ts
import { allDocSlugs } from '@/lib/docs/nav'
// ...inside allPages, after the existing entries:
{ path: '/docs', priority: 0.8, changeFrequency: 'weekly' as const },
...allDocSlugs.map((slug) => ({ path: `/docs/${slug}`, priority: 0.7, changeFrequency: 'weekly' as const })),
```

- [ ] **Step 2: Add a "Docs" link to the site header**

Find the header/nav used on the landing (grep `src/components` for the nav links), add a locale-aware `Link` to `/docs` labelled "Docs"/"Docs" (en/es). Keep it consistent with existing nav items.

- [ ] **Step 3: Full build + lint + visual sweep**

Run: `cd mkpdfs-web && npm run lint && npm run build`
Expected: build succeeds, sitemap includes `/docs/*` for both locales. `npm run dev`, then screenshot `/docs`, `/es/docs`, one API Reference page, and verify the header "Docs" link + mobile nav.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/components
git commit -m "feat(docs): sitemap entries + header Docs link"
```

---

## Self-Review

**Spec coverage:**
- MDX in-app branded, `@mdx-js/mdx`, no @next/mdx/next-mdx-remote → Tasks 1–2 ✓
- Bilingual en+es + enforced parity (`assertLocaleParity` in build) → Tasks 1–5 ✓
- Lean content (Getting Started / API Reference / CLI) → Tasks 3/4/5 ✓
- `nav.ts` single source; frontmatter metadata-only → Task 1 ✓
- Static prerender (`generateStaticParams` + `dynamicParams=false`), `setRequestLocale`, `/docs` landing (not redirect), no request-time data → Task 2 ✓
- Generic `CodeBlock` (not CodeSnippets) → Task 2 ✓
- SEO sitemap + hreflang/canonical → Tasks 2 (metadata) + 6 (sitemap) ✓
- Coordination (feature branch → PR; shared files package.json/sitemap/header) → Global Constraints ✓
- curl-first, no search → content tasks ✓

**Placeholder scan:** Technical scaffolding (Tasks 1–2, 6) has complete code. Content tasks (3–5) specify exact pages, facts, endpoints, and examples to author (prose is generative by nature — the implementer writes en↔es from the given facts). Stubs in Task 2 are explicitly temporary, replaced in 3–5.

**Type consistency:** `Locale`, `docsNav`, `allDocSlugs`, `landingSlug`, `getDocSource`, `compileDoc`, `assertLocaleParity`, `mdxComponents` used consistently across tasks.
