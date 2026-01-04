'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Sparkles, Save } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { FloatingChatWidget, type ChatMessage } from '@/components/ai'
import { FullScreenPreview } from '@/components/ai'
import { useProfile, useSubmitAIGeneration, useAIJobStatus, useUploadTemplate, useGeneratePdf, useUploadAIImage } from '@/hooks/useApi'
import { toast } from '@/hooks/useToast'
import { useTranslations } from 'next-intl'

interface AIGenerateSectionProps {
  onSaveComplete?: () => void
}

interface GeneratedTemplate {
  content: string
  name: string
  description: string
}

export function AIGenerateSection({ onSaveComplete }: AIGenerateSectionProps) {
  const t = useTranslations('templates')
  const common = useTranslations('common')
  const errors = useTranslations('errors')
  const ai = useTranslations('ai')

  const { data: profile } = useProfile()
  const submitAIGeneration = useSubmitAIGeneration()
  const uploadAIImage = useUploadAIImage()
  const uploadTemplate = useUploadTemplate()
  const generatePdf = useGeneratePdf()

  // Max base64 size before using S3 upload (500KB * 1.34 for base64 overhead)
  const MAX_BASE64_SIZE = 500 * 1024 * 1.34

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationContext, setConversationContext] = useState<{
    imageBase64?: string
    imageMediaType?: string
    imageS3Key?: string
  }>({})

  // Job polling state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const aiMessageIdRef = useRef<string | null>(null)

  // Query job status with polling
  const { data: jobStatus } = useAIJobStatus(currentJobId, { polling: true })

  // Generated content state
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null)
  const [editedTemplate, setEditedTemplate] = useState('')
  const [editedData, setEditedData] = useState('')

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  // Subscription checks
  const plan = profile?.subscription?.plan || 'free'
  const hasAccess = plan !== 'free'
  const aiLimit = profile?.subscriptionLimits?.aiGenerationsPerMonth ?? 0
  const isUnlimited = aiLimit === -1
  const currentUsage = profile?.currentUsage?.aiGenerationCount ?? 0
  const remainingGenerations = isUnlimited ? -1 : Math.max(0, aiLimit - currentUsage)

  // Parse sample data for preview
  const parsedSampleData = useMemo(() => {
    try {
      return JSON.parse(editedData || '{}')
    } catch {
      return {}
    }
  }, [editedData])

  // Handle job status updates
  useEffect(() => {
    if (!jobStatus || !aiMessageIdRef.current) return

    const aiMessageId = aiMessageIdRef.current

    if (jobStatus.status === 'processing') {
      // Update message to show processing
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? {
              ...msg,
              content: ai('chat.generating'),
              isLoading: true,
            }
          : msg
      ))
    } else if (jobStatus.status === 'completed' && jobStatus.template) {
      // Job completed successfully
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? {
              ...msg,
              content: ai('chat.templateGenerated', { name: jobStatus.template!.name }),
              isLoading: false,
            }
          : msg
      ))

      // Update generated template and editor
      setGeneratedTemplate(jobStatus.template)
      setEditedTemplate(jobStatus.template.content)
      setEditedData(JSON.stringify(jobStatus.sampleData || {}, null, 2))

      // Clear job tracking
      setCurrentJobId(null)
      aiMessageIdRef.current = null

      // Auto-generate PDF preview
      generatePdfPreview(jobStatus.template.content, jobStatus.sampleData || {})
    } else if (jobStatus.status === 'failed') {
      // Job failed
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? {
              ...msg,
              content: jobStatus.error || errors('generic'),
              isLoading: false,
            }
          : msg
      ))

      toast({
        title: ai('generateError'),
        description: jobStatus.error || errors('generic'),
        variant: 'destructive',
      })

      // Clear job tracking
      setCurrentJobId(null)
      aiMessageIdRef.current = null
    }
  }, [jobStatus, ai, errors])

  // Generate PDF preview helper
  const generatePdfPreview = useCallback(async (templateContent: string, sampleData: Record<string, unknown>) => {
    setIsPreviewLoading(true)
    try {
      const templateBlob = new Blob([templateContent], { type: 'text/html' })
      const templateFile = new File([templateBlob], `preview-${Date.now()}.hbs`)

      const uploadedTemplate = await uploadTemplate.mutateAsync({
        file: templateFile,
        name: `_preview_${Date.now()}`,
        description: 'AI Preview - Temporary',
      })

      const pdfResult = await generatePdf.mutateAsync({
        templateId: uploadedTemplate.id,
        data: sampleData,
      })

      if (pdfResult.pdfUrl) {
        setPreviewUrl(pdfResult.pdfUrl)
      }
    } catch (previewErr) {
      console.error('Preview generation failed:', previewErr)
    } finally {
      setIsPreviewLoading(false)
    }
  }, [uploadTemplate, generatePdf])

  // PDF preview request handler
  const handleRequestPdfPreview = useCallback(async () => {
    if (!editedTemplate) return
    await generatePdfPreview(editedTemplate, parsedSampleData)
  }, [editedTemplate, parsedSampleData, generatePdfPreview])

  // Handle sending a message in the chat
  const handleSendMessage = useCallback(async (
    message: string,
    imageBase64?: string,
    imageMediaType?: string
  ) => {
    // Add user message to chat
    const userMessageId = `user-${Date.now()}`
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: message,
      imageUrl: imageBase64 ? `data:${imageMediaType};base64,${imageBase64}` : undefined,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Add AI thinking message
    const aiMessageId = `ai-${Date.now()}`
    aiMessageIdRef.current = aiMessageId
    setMessages(prev => [...prev, {
      id: aiMessageId,
      role: 'assistant',
      content: ai('chat.submitting'),
      timestamp: new Date(),
      isLoading: true,
    }])

    try {
      // Determine how to handle the image
      let finalImageBase64: string | undefined
      let finalImageMediaType: 'image/png' | 'image/jpeg' | 'image/webp' | undefined
      let finalImageS3Key: string | undefined

      const currentImage = imageBase64 || conversationContext.imageBase64
      const currentMediaType = (imageMediaType || conversationContext.imageMediaType) as 'image/png' | 'image/jpeg' | 'image/webp' | undefined

      if (currentImage && currentMediaType) {
        // Check if image is too large for direct upload
        if (currentImage.length > MAX_BASE64_SIZE) {
          // Update message to show uploading image
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: ai('chat.uploadingImage') || 'Uploading image...' }
              : msg
          ))

          // Convert base64 to Blob for S3 upload
          const binaryString = atob(currentImage)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const blob = new Blob([bytes], { type: currentMediaType })

          // Upload to S3
          const { s3Key } = await uploadAIImage.mutateAsync({
            file: blob,
            contentType: currentMediaType,
          })

          finalImageS3Key = s3Key

          // Store S3 key in context for future iterations
          setConversationContext(prev => ({
            ...prev,
            imageS3Key: s3Key,
            imageMediaType: currentMediaType,
            imageBase64: undefined, // Clear base64 since we now have S3 key
          }))
        } else {
          // Small enough for direct base64
          finalImageBase64 = currentImage
          finalImageMediaType = currentMediaType

          // Store image in context if provided
          if (imageBase64 && imageMediaType) {
            setConversationContext(prev => ({
              ...prev,
              imageBase64,
              imageMediaType,
              imageS3Key: undefined,
            }))
          }
        }
      } else if (conversationContext.imageS3Key) {
        // Reuse previously uploaded S3 key
        finalImageS3Key = conversationContext.imageS3Key
      }

      // Update message to show submitting
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, content: ai('chat.submitting') }
          : msg
      ))

      // Submit async AI generation job
      const result = await submitAIGeneration.mutateAsync({
        prompt: message,
        imageBase64: finalImageBase64,
        imageMediaType: finalImageMediaType,
        imageS3Key: finalImageS3Key,
        previousTemplate: editedTemplate || undefined,
        feedback: editedTemplate ? message : undefined,
      })

      // Start polling for job status
      setCurrentJobId(result.jobId)

      // Update message to show job submitted
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? {
              ...msg,
              content: ai('chat.jobSubmitted'),
              isLoading: true,
            }
          : msg
      ))

    } catch (err) {
      // Update AI message with error
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? {
              ...msg,
              content: err instanceof Error ? err.message : errors('generic'),
              isLoading: false,
            }
          : msg
      ))

      toast({
        title: ai('generateError'),
        description: err instanceof Error ? err.message : errors('generic'),
        variant: 'destructive',
      })

      aiMessageIdRef.current = null
    }
  }, [
    submitAIGeneration,
    uploadAIImage,
    editedTemplate,
    conversationContext,
    ai,
    errors,
    MAX_BASE64_SIZE,
  ])

  // Handle saving the template
  const handleSave = useCallback(async () => {
    if (!generatedTemplate) return

    try {
      const templateBlob = new Blob([editedTemplate || generatedTemplate.content], { type: 'text/html' })
      const templateFile = new File([templateBlob], `${generatedTemplate.name}.hbs`)

      await uploadTemplate.mutateAsync({
        file: templateFile,
        name: generatedTemplate.name,
        description: generatedTemplate.description,
      })

      toast({
        title: ai('saveSuccess'),
        description: `"${generatedTemplate.name}"`,
      })

      // Add success message to chat
      setMessages(prev => [...prev, {
        id: `ai-saved-${Date.now()}`,
        role: 'assistant',
        content: ai('chat.templateSaved', { name: generatedTemplate.name }),
        timestamp: new Date(),
      }])

      // Clear state
      setGeneratedTemplate(null)
      setEditedTemplate('')
      setEditedData('')
      setPreviewUrl(null)
      setConversationContext({})
      setMessages([])

      onSaveComplete?.()
    } catch (err) {
      toast({
        title: ai('saveError'),
        description: err instanceof Error ? err.message : errors('generic'),
        variant: 'destructive',
      })
    }
  }, [generatedTemplate, editedTemplate, uploadTemplate, ai, errors, onSaveComplete])

  if (!hasAccess) {
    return <UpgradePrompt feature={ai('featureName')} requiredPlan="starter" />
  }

  const displayRemaining = isUnlimited
    ? ai('unlimited')
    : `${Math.max(0, remainingGenerations)} / ${aiLimit}`

  const isGenerating = submitAIGeneration.isPending || !!currentJobId

  return (
    <div className="relative h-[calc(100vh-10rem)]">
      {/* Header with usage indicator and save button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            {ai('remainingGenerations')}: {displayRemaining}
          </span>
          {!isUnlimited && remainingGenerations <= 2 && remainingGenerations > 0 && (
            <span className="text-sm text-warning font-medium">
              {ai('limitWarning')}
            </span>
          )}
          {!isUnlimited && remainingGenerations <= 0 && (
            <span className="text-sm text-destructive font-medium">
              {ai('limitReached')}
            </span>
          )}
        </div>

        {generatedTemplate && (
          <Button
            onClick={handleSave}
            disabled={uploadTemplate.isPending}
          >
            {uploadTemplate.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {common('loading')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {ai('chat.saveTemplate')}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Full-screen preview */}
      <FullScreenPreview
        templateContent={editedTemplate}
        sampleData={parsedSampleData}
        pdfUrl={previewUrl}
        isPdfLoading={isPreviewLoading}
        onRequestPdf={handleRequestPdfPreview}
        className="h-full"
      />

      {/* Floating chat widget */}
      <FloatingChatWidget
        messages={messages}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
        showCodeEditorToggle={!!generatedTemplate}
      />
    </div>
  )
}
