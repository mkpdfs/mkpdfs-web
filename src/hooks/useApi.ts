/**
 * React Query Hooks for API
 *
 * Provides typed hooks for all API operations with
 * automatic caching, refetching, and error handling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProfile,
  updateProfile,
  getTemplates,
  uploadTemplate,
  deleteTemplate,
  getTokens,
  createToken,
  deleteToken,
  getUsage,
  generatePdf,
} from '@/lib/api'
import type {
  MkpdfsUser,
  Template,
  ApiToken,
  CreateTokenResponse,
  UsageStats,
  GeneratePdfRequest,
  GeneratePdfResponse,
} from '@/types'

// ============================================
// Query Keys
// ============================================

export const queryKeys = {
  profile: ['profile'] as const,
  templates: ['templates'] as const,
  tokens: ['tokens'] as const,
  usage: ['usage'] as const,
}

// ============================================
// Profile Hooks
// ============================================

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<MkpdfsUser>) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}

// ============================================
// Template Hooks
// ============================================

export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: getTemplates,
  })
}

export function useUploadTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      file,
      name,
      description,
    }: {
      file: File
      name: string
      description?: string
    }) => uploadTemplate(file, name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates })
      queryClient.invalidateQueries({ queryKey: queryKeys.usage })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates })
      queryClient.invalidateQueries({ queryKey: queryKeys.usage })
    },
  })
}

// ============================================
// Token Hooks
// ============================================

export function useTokens() {
  return useQuery({
    queryKey: queryKeys.tokens,
    queryFn: getTokens,
  })
}

export function useCreateToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      name,
      expiresInDays,
    }: {
      name: string
      expiresInDays?: number
    }) => createToken(name, expiresInDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tokens })
      queryClient.invalidateQueries({ queryKey: queryKeys.usage })
    },
  })
}

export function useDeleteToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tokenId: string) => deleteToken(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tokens })
      queryClient.invalidateQueries({ queryKey: queryKeys.usage })
    },
  })
}

// ============================================
// Usage Hooks
// ============================================

export function useUsage() {
  return useQuery({
    queryKey: queryKeys.usage,
    queryFn: getUsage,
    refetchInterval: 60000, // Refetch every minute
  })
}

// ============================================
// PDF Generation Hooks
// ============================================

export function useGeneratePdf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: GeneratePdfRequest) => generatePdf(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usage })
    },
  })
}
