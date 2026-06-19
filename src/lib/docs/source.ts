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
