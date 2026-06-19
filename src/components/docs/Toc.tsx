import type { Heading } from '@/lib/docs/compile'
import type { Locale } from '@/lib/docs/nav'

const tocLabel: Record<Locale, string> = {
  en: 'On this page',
  es: 'En esta página',
}

export function Toc({ headings, locale }: { headings: Heading[]; locale: Locale }) {
  if (!headings.length) return null
  return (
    <aside
      className="hidden shrink-0 w-48 xl:block"
      aria-label={tocLabel[locale]}
    >
      <div className="sticky top-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">
          {tocLabel[locale]}
        </p>
        <ul className="space-y-1">
          {headings.map((h) => (
            <li key={h.id} className={h.depth === 3 ? 'pl-3' : ''}>
              <a
                href={`#${h.id}`}
                className="block truncate text-sm text-fg-muted transition-colors hover:text-brand-text"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
