import type { Heading } from '@/lib/docs/compile'

export function Toc({ headings }: { headings: Heading[] }) {
  if (!headings.length) return null
  return (
    <aside
      className="hidden shrink-0 w-48 xl:block"
      aria-label="On this page"
    >
      <div className="sticky top-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">
          On this page
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
