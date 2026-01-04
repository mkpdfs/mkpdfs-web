/**
 * API Client
 *
 * Makes authenticated requests to the mkpdfs backend API.
 * Supports both Cognito ID token authentication and AWS IAM signing.
 */

import { getIdToken } from './auth'
import type {
  Template,
  TemplateWithContent,
  ApiToken,
  CreateTokenResponse,
  UsageStats,
  GeneratePdfRequest,
  GeneratePdfResponse,
  MkpdfsUser,
  ApiResponse,
  GenerateAITemplateRequest,
  GenerateAITemplateResponse,
  MarketplaceTemplate,
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Base fetch function with authentication
 */
async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const idToken = await getIdToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API Error: ${response.status}`)
  }

  // Handle empty responses
  const text = await response.text()
  if (!text) {
    return {} as T
  }

  return JSON.parse(text)
}

// ============================================
// User Profile
// ============================================

export async function getProfile(): Promise<MkpdfsUser> {
  const response = await authFetch<{ success: boolean; data: MkpdfsUser }>('/user/profile')
  return response.data
}

export async function updateProfile(data: Partial<MkpdfsUser>): Promise<MkpdfsUser> {
  return authFetch<MkpdfsUser>('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// ============================================
// Templates
// ============================================

export async function getTemplates(): Promise<Template[]> {
  const response = await authFetch<{ templates: Template[] }>('/templates')
  return response.templates || []
}

export async function uploadTemplate(file: File, name: string, description?: string): Promise<Template> {
  const idToken = await getIdToken()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', name)
  if (description) {
    formData.append('description', description)
  }

  const headers: Record<string, string> = {}
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`
  }

  const response = await fetch(`${API_URL}/templates/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to upload template')
  }

  return response.json()
}

export async function deleteTemplate(templateId: string): Promise<void> {
  await authFetch<void>(`/templates/${templateId}`, {
    method: 'DELETE',
  })
}

export async function getTemplate(templateId: string): Promise<TemplateWithContent> {
  const response = await authFetch<{ template: TemplateWithContent }>(`/templates/${templateId}`)
  return response.template
}

// ============================================
// API Tokens
// ============================================

export async function getTokens(): Promise<ApiToken[]> {
  const response = await authFetch<{ tokens: ApiToken[] }>('/user/tokens')
  return response.tokens || []
}

export async function createToken(
  name: string,
  expiresInDays?: number
): Promise<CreateTokenResponse> {
  return authFetch<CreateTokenResponse>('/user/tokens', {
    method: 'POST',
    body: JSON.stringify({ name, expiresInDays }),
  })
}

export async function deleteToken(tokenId: string): Promise<void> {
  await authFetch<void>(`/user/tokens/${tokenId}`, {
    method: 'DELETE',
  })
}

// ============================================
// Usage
// ============================================

export async function getUsage(): Promise<UsageStats> {
  return authFetch<UsageStats>('/user/usage')
}

// ============================================
// PDF Generation
// ============================================

export async function generatePdf(
  request: GeneratePdfRequest
): Promise<GeneratePdfResponse> {
  return authFetch<GeneratePdfResponse>('/pdf/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function generatePdfAsync(
  request: GeneratePdfRequest & { webhookUrl?: string; webhookSecret?: string }
): Promise<GeneratePdfResponse> {
  return authFetch<GeneratePdfResponse>('/jobs/submit', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function getJobStatus(jobId: string): Promise<import('@/types').JobStatus> {
  return authFetch<import('@/types').JobStatus>(`/jobs/${jobId}`, {
    method: 'GET',
  })
}

// ============================================
// Stripe / Billing
// ============================================

export async function createCheckoutSession(plan: string): Promise<{ url: string; sessionId: string }> {
  const response = await authFetch<{ success: boolean; url: string; sessionId: string }>(
    '/stripe/create-checkout-session',
    {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }
  )
  return { url: response.url, sessionId: response.sessionId }
}

export async function createPortalSession(): Promise<{ url: string }> {
  const response = await authFetch<{ success: boolean; url: string }>(
    '/stripe/create-portal-session',
    {
      method: 'POST',
    }
  )
  return { url: response.url }
}

// ============================================
// AI Template Generation
// ============================================

export async function generateAITemplate(
  request: GenerateAITemplateRequest
): Promise<GenerateAITemplateResponse> {
  return authFetch<GenerateAITemplateResponse>('/ai/generate-template', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

// ============================================
// AI Generation Types (Two-Step Flow)
// ============================================

export interface StructuredQuestion {
  id: string
  category: 'fields' | 'images' | 'tables' | 'layout'
  question: string
  type: 'single_choice' | 'multiple_choice' | 'text' | 'boolean'
  options?: string[]
  defaultValue?: string | string[] | boolean
  required: boolean
  helperText?: string
}

export interface QuestionAnswer {
  questionId: string
  value: string | string[] | boolean
}

export interface ImageAnalysis {
  detectedFields: string[]
  suggestedLayout: string
  documentType: string
}

// Async AI generation (job-based)
export interface SubmitAIJobRequest {
  // Job type: 'analysis' for first step, 'generation' for second step
  jobType?: 'analysis' | 'generation'
  prompt: string
  templateType?: string
  // Option 1: Direct base64 (for small images < 500KB)
  imageBase64?: string
  imageMediaType?: 'image/png' | 'image/jpeg' | 'image/webp'
  // Option 2: S3 key (for large images, uploaded via presigned URL)
  imageS3Key?: string
  // For 'generation' jobs - reference to analysis job and user's answers
  analysisJobId?: string
  answers?: QuestionAnswer[]
  // Legacy iteration support
  previousTemplate?: string
  feedback?: string
}

export interface SubmitAIJobResponse {
  success: boolean
  jobId: string
  jobType?: 'analysis' | 'generation'
  status: 'pending'
  statusUrl: string
  message: string
}

export interface AIJobStatus {
  jobId: string
  jobType: 'analysis' | 'generation'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  prompt: string
  hasImage: boolean
  createdAt: string
  updatedAt: string
  // Analysis job output (when completed):
  questions?: StructuredQuestion[]
  imageAnalysis?: ImageAnalysis
  // Generation job output (when completed):
  template?: {
    content: string
    name: string
    description: string
  }
  sampleData?: Record<string, unknown>
  completedAt?: string
  // When failed:
  error?: string
  errorCode?: string
}

export async function submitAIGeneration(
  request: SubmitAIJobRequest
): Promise<SubmitAIJobResponse> {
  return authFetch<SubmitAIJobResponse>('/ai/generate-template-async', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function getAIJobStatus(jobId: string): Promise<AIJobStatus> {
  return authFetch<AIJobStatus>(`/ai/jobs/${jobId}`, {
    method: 'GET',
  })
}

// Get presigned URL for uploading large images to S3
export interface GetImageUploadUrlRequest {
  contentType: 'image/png' | 'image/jpeg' | 'image/webp'
  filename?: string
}

export interface GetImageUploadUrlResponse {
  success: boolean
  uploadUrl: string
  s3Key: string
  expiresIn: number
  maxFileSize: number
}

export async function getAIImageUploadUrl(
  request: GetImageUploadUrlRequest
): Promise<GetImageUploadUrlResponse> {
  return authFetch<GetImageUploadUrlResponse>('/ai/image-upload-url', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

// Upload image directly to S3 using presigned URL
export async function uploadImageToS3(
  uploadUrl: string,
  file: Blob,
  contentType: string
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.status}`)
  }
}

// ============================================
// Marketplace (public endpoints + authenticated use)
// ============================================

export async function getMarketplaceTemplates(category?: string): Promise<MarketplaceTemplate[]> {
  const params = category && category !== 'all' ? `?category=${category}` : ''
  const response = await fetch(`${API_URL}/marketplace/templates${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch marketplace templates')
  }
  const data = await response.json()
  return data.templates || []
}

export async function getMarketplaceTemplate(templateId: string): Promise<MarketplaceTemplate> {
  const response = await fetch(`${API_URL}/marketplace/templates/${templateId}`)
  if (!response.ok) {
    throw new Error('Template not found')
  }
  const data = await response.json()
  return data.template
}

export async function getMarketplaceTemplatePreview(templateId: string): Promise<MarketplaceTemplate> {
  const response = await fetch(`${API_URL}/marketplace/templates/${templateId}/preview`)
  if (!response.ok) {
    throw new Error('Template not found')
  }
  const data = await response.json()
  return data.template
}

export async function useMarketplaceTemplate(templateId: string): Promise<Template> {
  const response = await authFetch<{ message: string; template: Template }>(
    `/marketplace/templates/${templateId}/use`,
    { method: 'POST' }
  )
  return response.template
}

// ============================================
// Contact Enterprise (public endpoint)
// ============================================

interface ContactEnterpriseRequest {
  name: string
  email: string
  message: string
}

interface ContactEnterpriseResponse {
  success: boolean
  message: string
  remaining?: number
}

export async function contactEnterprise(
  data: ContactEnterpriseRequest
): Promise<ContactEnterpriseResponse> {
  const response = await fetch(`${API_URL}/contact/enterprise`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Failed to send message')
  }

  return result
}
