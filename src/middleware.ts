import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { fetchAuthSession } from 'aws-amplify/auth/server'
import { routing } from './i18n/routing'
import { runWithAmplifyServerContext } from './lib/amplifyServerUtils'

const intlMiddleware = createIntlMiddleware(routing)

// Routes where authenticated users should be redirected to dashboard (home page)
const AUTH_REDIRECT_ROUTES = ['/', '/en', '/es']

// Check if user is authenticated via Amplify cookies
async function isAuthenticated(
  request: NextRequest,
  response: NextResponse
): Promise<boolean> {
  try {
    const authenticated = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec)
          return (
            session.tokens?.accessToken !== undefined &&
            session.tokens?.idToken !== undefined
          )
        } catch {
          return false
        }
      },
    })
    return authenticated
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  console.log('[Middleware] Running for:', request.nextUrl.pathname)
  const { pathname } = request.nextUrl
  // Normalize path by removing trailing slash (except for root)
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '')

  // Run i18n middleware first to get proper response with locale handling
  const intlResponse = intlMiddleware(request)

  // Check if this is a route where we should redirect authenticated users
  if (AUTH_REDIRECT_ROUTES.includes(normalizedPath)) {
    console.log('[Middleware] Checking auth for path:', normalizedPath)

    const authenticated = await isAuthenticated(request, intlResponse)
    console.log('[Middleware] Authenticated:', authenticated)

    if (authenticated) {
      // Default locale (en) is served unprefixed under as-needed; only prefix es
      const dashboardPath = normalizedPath.startsWith('/es')
        ? '/es/dashboard'
        : '/dashboard'
      console.log('[Middleware] Redirecting to dashboard')
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    }
  }

  return intlResponse
}

export const config = {
  // Match all pathnames except for
  // - … if they are under `/api/`, `/_next/` or `/_vercel/`
  //   (scope to `api/`, NOT bare `api` — bare `api` also matches routes like
  //    `/api-keys`, skipping their locale handling → 404)
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - … /callback and /logout (OAuth routes)
  matcher: ['/', '/((?!api/|_next/|_vercel/|callback|logout|.*\\..*).*)'],
}
