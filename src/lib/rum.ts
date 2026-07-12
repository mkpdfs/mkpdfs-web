/**
 * CloudWatch RUM web client (aws-rum-web).
 *
 * Initialized once per page load from <RumInit /> in the root layout.
 * Credentials come from the guest role of the dedicated identity pool
 * (enhanced auth flow — only the identity pool id is needed). When the
 * NEXT_PUBLIC_RUM_* vars are absent (e.g. local dev), RUM stays off and
 * the rum-logger degrades to plain console output.
 */
import { AwsRum, AwsRumConfig } from 'aws-rum-web'

let client: AwsRum | null = null

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
  } catch {
    // Telemetry must never break the app.
  }
}

export function getRum(): AwsRum | null {
  return client
}
