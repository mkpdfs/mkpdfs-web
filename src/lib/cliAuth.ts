import { fetchAuthSession } from 'aws-amplify/auth'

const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!

export interface CliTokens {
  idToken: string
  accessToken: string
  refreshToken: string
}

/**
 * Read a single cookie value by name.
 * Amplify v6 with { ssr: true } stores tokens in cookies, not localStorage.
 */
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + escapedName + '=([^;]*)')
  )
  return match ? decodeURIComponent(match[1]) : null
}

export async function getCliTokens(): Promise<CliTokens | null> {
  const session = await fetchAuthSession()
  const idToken = session.tokens?.idToken?.toString()
  const accessToken = session.tokens?.accessToken?.toString()
  if (!idToken || !accessToken) return null

  const prefix = `CognitoIdentityServiceProvider.${CLIENT_ID}`
  const lastUser = getCookieValue(`${prefix}.LastAuthUser`)
  const refreshToken = lastUser
    ? getCookieValue(`${prefix}.${lastUser}.refreshToken`)
    : null
  if (!refreshToken) return null

  return { idToken, accessToken, refreshToken }
}

export async function approveCliDevice(
  userCode: string,
  action: 'approve' | 'deny'
): Promise<void> {
  const tokens = await getCliTokens()
  if (!tokens) throw new Error('no-session')

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/cli/approve`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.idToken}`,
      },
      body: JSON.stringify({
        userCode,
        action,
        ...(action === 'approve' ? { tokens } : {}),
      }),
    }
  )
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `approve-failed-${res.status}`)
  }
}
