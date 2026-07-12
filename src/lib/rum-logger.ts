/**
 * RUM Diagnostic Logger
 *
 * Structured console logger with area prefixes, forwarded to CloudWatch RUM
 * so user issues can be diagnosed from real sessions without screenshots.
 *
 * aws-rum-web does NOT capture console output by itself, so every call also
 * ships to RUM explicitly: info/warn as `mkpdfs.log` custom events, errors
 * additionally via recordError (they show up in the RUM "Errors" view with
 * their original stack). In the RUM console, filter by the `area` field or
 * the `[Area]` prefix.
 *
 * Usage:
 *   rum.info('Login', 'Sign in successful')
 *   rum.warn('Auth', 'Session expired')
 *   rum.error('Upload', 'Failed:', error)
 */
import { rumRecordError, rumRecordEvent } from './rum'

type LogArea =
  | 'App' // error boundaries, app-level lifecycle
  | 'Auth' // Amplify/Cognito config + session management
  | 'Login'
  | 'Register'
  | 'Password'
  | 'Callback' // OAuth redirect handling
  | 'API' // authFetch failures (errors only, to avoid noise)
  | 'Upload' // template/logo/AI-image uploads
  | 'Billing' // checkout, portal, auto-recharge
  | 'AIGenerate'

const MAX_EVENT_CHARS = 1000

function printable(d: unknown): string {
  if (d instanceof Error) return `${d.name}: ${d.message}`
  if (typeof d === 'string') return d
  try {
    return JSON.stringify(d)
  } catch {
    return String(d)
  }
}

function record(level: 'info' | 'warn' | 'error', area: LogArea, message: string, data: unknown[]): void {
  try {
    const text = [message, ...data.map(printable)].join(' ').slice(0, MAX_EVENT_CHARS)
    rumRecordEvent({ level, area, message: text })
    if (level === 'error') {
      const err = data.find((d): d is Error => d instanceof Error)
      rumRecordError(err ?? new Error(`[${area}] ${text}`))
    }
  } catch {
    // Telemetry must never break the app.
  }
}

export const rum = {
  info: (area: LogArea, message: string, ...data: unknown[]) => {
    console.info(`[${area}]`, message, ...data)
    record('info', area, message, data)
  },
  warn: (area: LogArea, message: string, ...data: unknown[]) => {
    console.warn(`[${area}]`, message, ...data)
    record('warn', area, message, data)
  },
  error: (area: LogArea, message: string, ...data: unknown[]) => {
    console.error(`[${area}]`, message, ...data)
    record('error', area, message, data)
  },
}
