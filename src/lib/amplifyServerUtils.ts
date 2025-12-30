/**
 * Amplify Server-Side Utilities
 *
 * Provides server-side authentication support for Next.js middleware
 * and server components using AWS Amplify.
 */

import { createServerRunner } from '@aws-amplify/adapter-nextjs'
import type { ResourcesConfig } from 'aws-amplify'

/**
 * Get Amplify configuration for server-side usage
 */
function getAmplifyConfig(): ResourcesConfig {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || ''
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''
  const identityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || ''

  const cognitoConfig: ResourcesConfig['Auth'] = {
    Cognito: {
      userPoolId,
      userPoolClientId,
      ...(identityPoolId && { identityPoolId }),
      loginWith: {
        email: true,
        username: false,
        phone: false,
        oauth: cognitoDomain
          ? {
              domain: cognitoDomain,
              scopes: [
                'openid',
                'email',
                'profile',
                'aws.cognito.signin.user.admin',
              ],
              redirectSignIn: [`${siteUrl}/callback`],
              redirectSignOut: [`${siteUrl}/logout`],
              responseType: 'code',
              providers: ['Google'],
            }
          : undefined,
      },
    } as any,
  }

  return { Auth: cognitoConfig }
}

export const { runWithAmplifyServerContext } = createServerRunner({
  config: getAmplifyConfig(),
})
