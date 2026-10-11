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
type EventData = Record<string, string | number | boolean>
type Pending = { event?: { type: string; data: object }; error?: unknown }

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
      if (p.event) client.recordEvent(p.event.type, p.event.data)
      if (p.error !== undefined) client.recordError(p.error)
    }
  } catch {
    // Telemetry must never break the app.
  } finally {
    pending = []
  }
}

function recordOrQueue(type: string, data: object): void {
  try {
    if (client) client.recordEvent(type, data)
    else if (typeof window !== 'undefined' && pending.length < MAX_PENDING) pending.push({ event: { type, data } })
  } catch {
    // Telemetry must never break the app.
  }
}

export function rumRecordEvent(data: LogEventData): void {
  recordOrQueue('mkpdfs.log', data)
}

/**
 * Product/funnel event (observability#56). `name` is the bare event name;
 * it ships as the RUM custom event type `mkpdfs.<name>` (the dashboard turns
 * these into metrics via metric filters on the RUM log group). Queued
 * (max 20) until the client exists; no-op when RUM is off (local dev).
 * Never pass PII — only coarse, low-cardinality fields.
 */
export function track(name: string, data: EventData = {}): void {
  recordOrQueue(`mkpdfs.${name}`, data)
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
