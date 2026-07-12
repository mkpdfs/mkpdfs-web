/**
 * CloudWatch RUM web client (aws-rum-web).
 *
 * Initialized once per page load from <RumInit /> in the root layout.
 * Credentials come from the guest role of the dedicated identity pool
 * (enhanced auth flow — only the identity pool id is needed). When the
 * NEXT_PUBLIC_RUM_* vars are absent (e.g. local dev), RUM stays off and
 * the rum-logger degrades to plain console output.
 *
 * rum-logger calls can fire before <RumInit />'s effect runs (other client
 * components' effects, module init), so records made pre-init are buffered
 * (bounded) and flushed right after the client is constructed.
 */
import { AwsRum, AwsRumConfig } from 'aws-rum-web'

type LogEventData = { level: 'info' | 'warn' | 'error'; area: string; message: string }
type Pending = { event?: LogEventData; error?: unknown }

const MAX_PENDING = 20

let client: AwsRum | null = null
let pending: Pending[] = []

export function initRum(): void {
  if (client || typeof window === 'undefined') return
  const appMonitorId = process.env.NEXT_PUBLIC_RUM_APP_MONITOR_ID
  const identityPoolId = process.env.NEXT_PUBLIC_RUM_IDENTITY_POOL_ID
  if (!appMonitorId || !identityPoolId) return
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'
  try {
    const config: AwsRumConfig = {
      sessionSampleRate: 1,
      identityPoolId,
      endpoint: `https://dataplane.rum.${region}.amazonaws.com`,
      telemetries: ['errors', 'performance', 'http'],
      allowCookies: true,
      enableXRay: false,
    }
    client = new AwsRum(appMonitorId, '1.0.0', region, config)
    for (const p of pending) {
      if (p.event) client.recordEvent('mkpdfs.log', p.event)
      if (p.error !== undefined) client.recordError(p.error)
    }
  } catch {
    // Telemetry must never break the app.
  } finally {
    pending = []
  }
}

export function rumRecordEvent(data: LogEventData): void {
  try {
    if (client) client.recordEvent('mkpdfs.log', data)
    else if (typeof window !== 'undefined' && pending.length < MAX_PENDING) pending.push({ event: data })
  } catch {
    // Telemetry must never break the app.
  }
}

export function rumRecordError(error: unknown): void {
  try {
    if (client) client.recordError(error)
    else if (typeof window !== 'undefined' && pending.length < MAX_PENDING) pending.push({ error })
  } catch {
    // Telemetry must never break the app.
  }
}

export function getRum(): AwsRum | null {
  return client
}
