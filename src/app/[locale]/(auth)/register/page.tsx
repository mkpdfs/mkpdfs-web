import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageMetadata } from '@/lib/seo'
import RegisterClient from './RegisterClient'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.register' })
  return {
    ...pageMetadata({
      locale,
      path: '/register',
      title: t('metaTitle'),
      description: t('metaDescription'),
    }),
    robots: { index: true, follow: true },
  }
}

export default function RegisterPage() {
  return <RegisterClient />
}
