import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageMetadata } from '@/lib/seo'
import LoginClient from './LoginClient'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.login' })
  return {
    ...pageMetadata({
      locale,
      path: '/login',
      title: t('metaTitle'),
      description: t('metaDescription'),
    }),
    robots: { index: true, follow: true },
  }
}

export default function LoginPage() {
  return <LoginClient />
}
