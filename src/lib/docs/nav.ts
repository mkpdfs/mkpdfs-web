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
