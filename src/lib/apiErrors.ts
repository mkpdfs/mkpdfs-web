/**
 * Maps an error thrown by the API client to a key in the `errors` i18n
 * namespace, so the UI shows a localized message instead of the raw (English)
 * backend string. Pure — no React — so it can be unit-tested or used anywhere.
 */
import { ApiError } from './api'

export type ApiErrorKey =
  | 'insufficientCredits'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'limitReached'
  | 'validationError'
  | 'serverError'
  | 'networkError'
  | 'generic'

/** A 402 (or explicit INSUFFICIENT_CREDITS code) means the credit gate fired. */
export function isInsufficientCredits(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 402 || error.code === 'INSUFFICIENT_CREDITS')
  )
}

export function apiErrorKey(error: unknown): ApiErrorKey {
  if (error instanceof ApiError) {
    if (isInsufficientCredits(error)) return 'insufficientCredits'
    if (error.status === 401) return 'unauthorized'
    if (error.status === 403) return 'forbidden'
    if (error.status === 404) return 'notFound'
    if (error.status === 429) return 'limitReached'
    if (error.status === 400 || error.status === 422) return 'validationError'
    if (error.status >= 500) return 'serverError'
    return 'generic'
  }
  // A bare TypeError from fetch() means the request never reached the server.
  if (error instanceof TypeError) return 'networkError'
  return 'generic'
}
