// User types
export interface MkpdfsUser {
  userId: string
  email: string
  name?: string
  emailVerified?: boolean
  createdAt?: string
}

// Template types
export interface Template {
  id: string
  userId: string
  name: string
  description?: string
  s3Key: string
  createdAt: string
  updatedAt: string
}

// API Token types
export interface ApiToken {
  tokenId: string
  name: string
  createdAt: string
  lastUsed?: string
  expiresAt?: string
}

export interface CreateTokenResponse {
  tokenId: string
  token: string
  name: string
  expiresAt?: string
}

// Usage types
export interface UsageStats {
  pdfsGenerated: number
  pdfsLimit: number
  templatesCount: number
  templatesLimit: number
  tokensCount: number
  tokensLimit: number
  currentPeriodStart: string
  currentPeriodEnd: string
}

// Subscription types
export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise'

export interface Subscription {
  plan: SubscriptionPlan
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: string
}

// PDF Generation types
export interface GeneratePdfRequest {
  templateId: string
  data: Record<string, unknown>
  async?: boolean
  sendEmail?: string[]
}

export interface GeneratePdfResponse {
  success: boolean
  pdfUrl?: string
  jobId?: string
  message?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
