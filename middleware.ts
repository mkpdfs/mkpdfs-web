import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except:
  // - API routes
  // - Static files
  // - Next.js internals
  matcher: [
    '/',
    '/(en|es)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
