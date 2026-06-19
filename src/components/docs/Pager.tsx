import { Link } from '@/i18n/routing'
import { allDocSlugs, docsNav, type Locale } from '@/lib/docs/nav'

function getLabel(slug: string, locale: Locale): string {
  for (const section of docsNav) {
    const page = section.pages.find((p) => p.slug === slug)
    if (page) return page.label[locale]
  }
  return slug
}

const pagerLabels: Record<Locale, { prev: string; next: string }> = {
  en: { prev: 'Previous', next: 'Next' },
  es: { prev: 'Anterior', next: 'Siguiente' },
}

export function Pager({ locale, slug }: { locale: Locale; slug: string }) {
  const idx = allDocSlugs.indexOf(slug)
  const prev = idx > 0 ? allDocSlugs[idx - 1] : null
  const next = idx < allDocSlugs.length - 1 ? allDocSlugs[idx + 1] : null
  const labels = pagerLabels[locale]

  return (
    <nav
      className="mt-12 flex items-center justify-between border-t border-border pt-6"
      aria-label="Pagination"
    >
      <div>
        {prev && (
          <Link
            href={`/docs/${prev}` as Parameters<typeof Link>[0]['href']}
            className="flex flex-col gap-0.5 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:border-brand/50 hover:bg-surface-raised"
          >
            <span className="text-xs text-fg-muted">{labels.prev}</span>
            <span className="font-medium text-fg">{getLabel(prev, locale)}</span>
          </Link>
        )}
      </div>
      <div>
        {next && (
          <Link
            href={`/docs/${next}` as Parameters<typeof Link>[0]['href']}
            className="flex flex-col gap-0.5 rounded-lg border border-border px-4 py-3 text-right text-sm transition-colors hover:border-brand/50 hover:bg-surface-raised"
          >
            <span className="text-xs text-fg-muted">{labels.next}</span>
            <span className="font-medium text-fg">{getLabel(next, locale)}</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
