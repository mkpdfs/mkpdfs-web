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
      <Toc headings={headings} locale={locale as Locale} />
    </div>
  )
}
