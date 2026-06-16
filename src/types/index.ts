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
  templatesAllowed: number
  apiTokensAllowed: number
  maxPdfSizeMB: number
  aiGenerationsPerMonth: number
}

export interface CurrentUsage {
  userId: string
  yearMonth: string
  pdfCount: number
  totalSizeMB: number
  aiGenerationCount?: number
}

// Theming types
export type LogoInput =
  | { source: 'upload'; s3Key: string }
  | { source: 'url'; url: string }
  | null

export interface ThemeInput {
  brand: string
  accent: string
  fontKey: string
  logo?: LogoInput
}

export interface Theme {
  brand: string
  accent: string
  fontKey: string
  logoKey?: string
}

// Template types
export interface Template {
  id: string
  userId: string
  name: string
  description?: string
  s3Key: string
  sourceMarketplaceId?: string // Links to original marketplace template if copied
  thumbnailUrl?: string | null // Thumbnail URL (from marketplace source if available)
  theme?: Theme
  createdAt: string
  updatedAt: string
}

// Template with content (for preview)
export interface TemplateWithContent extends Template {
  content: string
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
export type SubscriptionPlan = 'credits' | 'enterprise'

export interface Subscription {
  plan: SubscriptionPlan
  status: 'active' | 'cancelled' | 'past_due'
  creditBalance?: number
  autoRecharge?: boolean
  rechargeThreshold?: number
  autoRechargeError?: string
  stripeCustomerId?: string
  stripePaymentMethodId?: string
}

export interface LedgerEntry {
  entryId: string
  type: 'purchase' | 'auto_recharge' | 'debit' | 'refund'
  amount: number
  balanceAfter?: number | null
  description?: string | null
  createdAt: string
}

// PDF Generation types
export interface GeneratePdfRequest {
  templateId: string
  data: Record<string, unknown> | Record<string, unknown>[]
  async?: boolean
  sendEmail?: string[]
}

export interface GeneratePdfResponse {
  success: boolean
  pdfUrl?: string
  jobId?: string
  message?: string
  size?: number
  pagesGenerated?: number
  expiresIn?: string
}

// Async Job Status types
export interface JobStatus {
  jobId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  pdfUrl?: string
  size?: number
  pagesGenerated?: number
  error?: string
  createdAt: string
  completedAt?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// AI Template Generation types
export interface GenerateAITemplateRequest {
  prompt: string
  templateType?: string
  imageBase64?: string
  imageMediaType?: 'image/png' | 'image/jpeg' | 'image/webp'
  previousTemplate?: string
  feedback?: string
}

export interface GeneratedTemplate {
  content: string
  name: string
  description: string
}

export interface GenerateAITemplateResponse {
  success: boolean
  template: GeneratedTemplate
  sampleData: Record<string, unknown>
  remainingGenerations: number
}

// Marketplace types
export type MarketplaceCategory = 'business' | 'certificates' | 'marketing' | 'personal'

export interface MarketplaceTemplate {
  templateId: string
  category: MarketplaceCategory
  name: string
  description: string
  s3Key: string
  sampleDataJson: string
  tags: string[]
  popularity: number
  createdAt: string
  updatedAt: string
  content?: string // Only returned by preview endpoint
  thumbnailUrl?: string | null // Public S3 URL for thumbnail image
}
