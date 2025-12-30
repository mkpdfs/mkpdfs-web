// User types
export interface MkpdfsUser {
  userId: string
  email: string
  name?: string
  emailVerified?: boolean
  createdAt?: string
  subscription?: Subscription
  subscriptionLimits?: SubscriptionLimits
  currentUsage?: CurrentUsage
}

export interface SubscriptionLimits {
  pagesPerMonth: number  // Each data object = 1 page
  templatesAllowed: number
  apiTokensAllowed: number
  maxPdfSizeMB: number
}

export interface CurrentUsage {
  userId: string
  yearMonth: string
  pdfCount: number
  totalSizeMB: number
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
  usage: {
    userId: string
    yearMonth: string
    pagesGenerated: number  // Each data object = 1 page
    templatesUploaded: number
    tokensCreated: number
    bytesGenerated: number
  }
  currentPeriod: string
  // Frontend computed fields (with defaults)
  pagesGenerated?: number
  pagesLimit?: number
  templatesCount?: number
  templatesLimit?: number
  tokensCount?: number
  tokensLimit?: number
}

// Subscription types
export type SubscriptionPlan = 'free' | 'starter' | 'basic' | 'professional' | 'enterprise'

export interface Subscription {
  plan: SubscriptionPlan
  status: 'active' | 'cancelled' | 'past_due'
  currentPeriodEnd?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
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
