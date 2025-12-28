/**
 * Authentication Utilities
 *
 * AWS Cognito authentication integration for mkpdfs.
 * - Sign up with email verification
 * - Sign in/out
 * - Session management
 * - Token refresh
 * - User profile
 */

import { Amplify, type ResourcesConfig } from 'aws-amplify'
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendCode,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  updatePassword as amplifyUpdatePassword,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  type SignInInput,
  type SignUpInput,
} from 'aws-amplify/auth'

import type { MkpdfsUser } from '@/types'

// Auth result types
export interface AuthResult<T = void> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// Session info
export interface SessionInfo {
  isValid: boolean
  expiresAt?: Date
  idToken?: string
  accessToken?: string
}

/**
 * Get Amplify configuration based on environment
 */
function getAmplifyConfig(): ResourcesConfig {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || ''
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''
  const identityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID

  const cognitoConfig: ResourcesConfig['Auth'] = {
    Cognito: {
      userPoolId,
      userPoolClientId,
      ...(identityPoolId && { identityPoolId }),
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
    } as any,
  }

  return { Auth: cognitoConfig }
}

let isConfigured = false

/**
 * Initialize Amplify with Cognito settings
 */
export function initializeAuth(): boolean {
  if (isConfigured) {
    return true
  }

  const config = getAmplifyConfig()

  if (!config.Auth?.Cognito?.userPoolId) {
    console.warn(
      '[Auth] Cognito not configured. Set NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_CLIENT_ID.'
    )
    return false
  }

  try {
    Amplify.configure(config)
    isConfigured = true
    console.info('[Auth] Amplify configured successfully')

    const hasIdentityPool = !!config.Auth?.Cognito?.identityPoolId
    console.info('[Auth] Identity Pool configured:', hasIdentityPool)

    return true
  } catch (error) {
    console.error('[Auth] Failed to configure Amplify:', error)
    return false
  }
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResult<{ needsConfirmation: boolean; userId?: string }>> {
  try {
    const input: SignUpInput = {
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name,
        },
      },
    }

    const result = await amplifySignUp(input)

    return {
      success: true,
      data: {
        needsConfirmation: !result.isSignUpComplete,
        userId: result.userId,
      },
    }
  } catch (error) {
    console.error('[Auth] Sign up error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to sign up'
    const errorCode = (error as { name?: string })?.name

    return {
      success: false,
      error: errorMessage,
      code: errorCode,
    }
  }
}

/**
 * Confirm sign up with verification code
 */
export async function confirmSignUp(email: string, code: string): Promise<AuthResult> {
  try {
    await amplifyConfirmSignUp({
      username: email,
      confirmationCode: code,
    })

    return { success: true }
  } catch (error) {
    console.error('[Auth] Confirm sign up error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid verification code',
    }
  }
}

/**
 * Resend confirmation code
 */
export async function resendConfirmationCode(email: string): Promise<AuthResult> {
  try {
    await amplifyResendCode({ username: email })
    return { success: true }
  } catch (error) {
    console.error('[Auth] Resend code error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend code',
    }
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<{ isSignedIn: boolean; nextStep?: string }>> {
  try {
    const input: SignInInput = {
      username: email,
      password,
    }

    const result = await amplifySignIn(input)

    if (result.isSignedIn) {
      return {
        success: true,
        data: { isSignedIn: true },
      }
    }

    return {
      success: true,
      data: {
        isSignedIn: false,
        nextStep: result.nextStep?.signInStep,
      },
    }
  } catch (error) {
    console.error('[Auth] Sign in error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in'
    const errorCode = (error as { name?: string })?.name

    if (
      errorCode === 'UserAlreadyAuthenticatedException' ||
      errorMessage.includes('already a signed in user')
    ) {
      console.info('[Auth] User already authenticated, treating as success')
      return {
        success: true,
        data: { isSignedIn: true },
      }
    }

    let translatedError = errorMessage
    if (errorCode === 'NotAuthorizedException') {
      translatedError = 'Incorrect email or password'
    } else if (errorCode === 'UserNotConfirmedException') {
      translatedError = 'Please verify your email first'
    }

    return {
      success: false,
      error: translatedError,
      code: errorCode,
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    await amplifySignOut({ global: true })
    return { success: true }
  } catch (error) {
    console.error('[Auth] Sign out error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign out',
    }
  }
}

/**
 * Initiate password reset
 */
export async function forgotPassword(email: string): Promise<AuthResult> {
  try {
    await amplifyResetPassword({ username: email })
    return { success: true }
  } catch (error) {
    console.error('[Auth] Forgot password error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request password reset',
    }
  }
}

/**
 * Confirm password reset with code
 */
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<AuthResult> {
  try {
    await amplifyConfirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    })

    return { success: true }
  } catch (error) {
    console.error('[Auth] Confirm reset password error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset password',
    }
  }
}

/**
 * Get current authenticated user with attributes
 */
export async function getUser(): Promise<AuthResult<MkpdfsUser>> {
  try {
    const user = await getCurrentUser()
    const attributes = await fetchUserAttributes()

    const mkpdfsUser: MkpdfsUser = {
      userId: user.userId,
      email: attributes.email || user.username,
      name: attributes.name,
      emailVerified: attributes.email_verified === 'true',
    }

    return {
      success: true,
      data: mkpdfsUser,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Not authenticated',
    }
  }
}

/**
 * Get current auth session with tokens
 */
export async function getSession(): Promise<AuthResult<SessionInfo>> {
  try {
    const session = await fetchAuthSession()

    if (!session.tokens) {
      return {
        success: false,
        error: 'No valid session',
      }
    }

    const expiresAt = session.tokens.accessToken?.payload?.exp
      ? new Date(session.tokens.accessToken.payload.exp * 1000)
      : undefined

    return {
      success: true,
      data: {
        isValid: true,
        expiresAt,
        idToken: session.tokens.idToken?.toString(),
        accessToken: session.tokens.accessToken?.toString(),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to get session',
    }
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser()
    return true
  } catch {
    return false
  }
}

/**
 * Get ID token for API calls
 */
export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() || null
  } catch {
    return null
  }
}

/**
 * Get Access token for API calls
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.accessToken?.toString() || null
  } catch {
    return null
  }
}

/**
 * Update password for authenticated user
 */
export async function updatePassword(
  oldPassword: string,
  newPassword: string
): Promise<AuthResult> {
  try {
    await amplifyUpdatePassword({ oldPassword, newPassword })
    return { success: true }
  } catch (error) {
    console.error('[Auth] Update password error:', error)

    const errorCode = (error as { name?: string })?.name
    let errorMessage = error instanceof Error ? error.message : 'Failed to update password'

    if (errorCode === 'NotAuthorizedException') {
      errorMessage = 'Current password is incorrect'
    } else if (errorCode === 'InvalidPasswordException') {
      errorMessage = 'New password does not meet security requirements'
    } else if (errorCode === 'LimitExceededException') {
      errorMessage = 'Too many attempts. Please try again later'
    }

    return {
      success: false,
      error: errorMessage,
      code: errorCode,
    }
  }
}
