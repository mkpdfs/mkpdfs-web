import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { DocsNav } from '@/components/docs/DocsNav'
import { Sidebar } from '@/components/docs/Sidebar'
import '@/styles/docs.css'

export default async function DocsLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!routing.locales.includes(locale as any)) notFound()
  setRequestLocale(locale)
  return (
    <>
      <DocsNav />
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10">
        <Sidebar locale={locale as 'en' | 'es'} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  )
}
