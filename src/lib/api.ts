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
  return authFetch<MkpdfsUser>('/user/profile')
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
