// Supported locales
export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]

// Default locale
export const defaultLocale: Locale = 'en'

// Locale labels for display
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
}
