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
  getTemplate,
  uploadTemplate,
  deleteTemplate,
  getTokens,
  createToken,
  deleteToken,
  getUsage,
  generatePdf,
  generatePdfAsync,
  getJobStatus,
  generateAITemplate,
  submitAIGeneration,
  getAIJobStatus,
  getAIImageUploadUrl,
  uploadImageToS3,
  getMarketplaceTemplates,
  getMarketplaceTemplate,
  getMarketplaceTemplatePreview,
  useMarketplaceTemplate as copyMarketplaceTemplate,
  contactEnterprise,
  type SubmitAIJobRequest,
  type AIJobStatus,
  type GetImageUploadUrlRequest,
} from '@/lib/api'
import type {
  MkpdfsUser,
  Template,
  ApiToken,
  CreateTokenResponse,
  UsageStats,
  GeneratePdfRequest,
  GeneratePdfResponse,
  GenerateAITemplateRequest,
} from '@/types'

// ============================================
// Query Keys
// ============================================

export const queryKeys = {
  profile: ['profile'] as const,
  templates: ['templates'] as const,
  template: (id: string) => ['template', id] as const,
  tokens: ['tokens'] as const,
  usage: ['usage'] as const,
  marketplaceTemplates: (category?: string) => ['marketplace', 'templates', category] as const,
  marketplaceTemplate: (id: string) => ['marketplace', 'template', id] as const,
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

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: queryKeys.template(templateId),
    queryFn: () => getTemplate(templateId),
    enabled: !!templateId,
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

export function useGeneratePdfAsync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: GeneratePdfRequest & { webhookUrl?: string }) => generatePdfAsync(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usage })
    },
  })
}

export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['job', jobId] as const,
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId,
    // Manual refetch only - no auto-polling
    refetchOnWindowFocus: false,
  })
}

// ============================================
// AI Template Generation Hooks
// ============================================

export function useGenerateAITemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: GenerateAITemplateRequest) => generateAITemplate(request),
    onSuccess: () => {
      // Refresh profile to update remaining AI generations count
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      queryClient.invalidateQueries({ queryKey: queryKeys.usage })
    },
  })
}

// ============================================
// Async AI Generation Hooks (Job-based)
// ============================================

export function useSubmitAIGeneration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: SubmitAIJobRequest) => submitAIGeneration(request),
    onSuccess: () => {
      // Refresh profile to update remaining AI generations count
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      queryClient.invalidateQueries({ queryKey: queryKeys.usage })
    },
  })
}

export function useAIJobStatus(jobId: string | null, options?: { polling?: boolean }) {
  return useQuery({
    queryKey: ['ai-job', jobId] as const,
    queryFn: () => getAIJobStatus(jobId!),
    enabled: !!jobId,
    // Poll every 2 seconds while job is pending/processing
    refetchInterval: (query) => {
      if (!options?.polling) return false
      const status = (query.state.data as AIJobStatus | undefined)?.status
      if (status === 'pending' || status === 'processing') {
        return 2000 // Poll every 2 seconds
      }
      return false // Stop polling when completed or failed
    },
    refetchOnWindowFocus: false,
  })
}

// Hook to upload large images to S3 (for images > 500KB)
export function useUploadAIImage() {
  return useMutation({
    mutationFn: async ({ file, contentType }: { file: Blob; contentType: 'image/png' | 'image/jpeg' | 'image/webp' }) => {
      // 1. Get presigned upload URL
      const { uploadUrl, s3Key } = await getAIImageUploadUrl({ contentType })

      // 2. Upload to S3
      await uploadImageToS3(uploadUrl, file, contentType)

      // 3. Return the S3 key for use in AI generation
      return { s3Key }
    },
  })
}

// ============================================
// Marketplace Hooks
// ============================================

export function useMarketplaceTemplates(category?: string) {
  return useQuery({
    queryKey: queryKeys.marketplaceTemplates(category),
    queryFn: () => getMarketplaceTemplates(category),
  })
}

export function useMarketplaceTemplate(templateId: string) {
  return useQuery({
    queryKey: queryKeys.marketplaceTemplate(templateId),
    queryFn: () => getMarketplaceTemplate(templateId),
    enabled: !!templateId,
  })
}

export function useMarketplaceTemplatePreview(templateId: string) {
  return useQuery({
    queryKey: [...queryKeys.marketplaceTemplate(templateId), 'preview'] as const,
    queryFn: () => getMarketplaceTemplatePreview(templateId),
    enabled: !!templateId,
  })
}

export function useCopyMarketplaceTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => copyMarketplaceTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates })
      queryClient.invalidateQueries({ queryKey: queryKeys.usage })
    },
  })
}

// ============================================
// Contact Enterprise Hook (public)
// ============================================

export function useContactEnterprise() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; message: string }) =>
      contactEnterprise(data),
  })
}
