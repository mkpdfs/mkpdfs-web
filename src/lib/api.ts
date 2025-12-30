/**
 * API Client
 *
 * Makes authenticated requests to the mkpdfs backend API.
 * Supports both Cognito ID token authentication and AWS IAM signing.
 */

import { getIdToken } from './auth'
import type {
  Template,
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
