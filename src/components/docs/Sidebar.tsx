import { Link } from '@/i18n/routing'
import { docsNav, type Locale } from '@/lib/docs/nav'

interface SidebarProps {
  locale: Locale
  activeSlug?: string
}

export function Sidebar({ locale, activeSlug }: SidebarProps) {
  return (
    <nav
      className="hidden shrink-0 w-56 lg:block"
      aria-label="Documentation navigation"
    >
      <div className="sticky top-10 space-y-6">
        {docsNav.map((section) => (
          <div key={section.id}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
              {section.label[locale]}
            </p>
            <ul className="space-y-0.5">
              {section.pages.map((page) => {
                const isActive = page.slug === activeSlug
                return (
                  <li key={page.slug}>
                    <Link
                      href={`/docs/${page.slug}` as Parameters<typeof Link>[0]['href']}
                      className={[
                        'block rounded-md px-3 py-1.5 text-sm transition-colors',
                        isActive
                          ? 'bg-brand/10 font-medium text-brand-text'
                          : 'text-fg-muted hover:bg-surface-overlay hover:text-fg',
                      ].join(' ')}
                    >
                      {page.label[locale]}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
