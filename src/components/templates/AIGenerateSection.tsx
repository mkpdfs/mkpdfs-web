'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Sparkles, Save, ArrowLeft, Paperclip, X, Loader2 } from 'lucide-react'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { FloatingChatWidget, type ChatMessage, QuestionForm } from '@/components/ai'
import { FullScreenPreview } from '@/components/ai'
import { useProfile, useSubmitAIGeneration, useAIJobStatus, useUploadTemplate, useGeneratePdf, useUploadAIImage } from '@/hooks/useApi'
import { toast } from '@/hooks/useToast'
import { useApiError } from '@/hooks/useApiError'
import { useTranslations } from 'next-intl'
import type { StructuredQuestion, QuestionAnswer, ImageAnalysis } from '@/lib/api'

interface AIGenerateSectionProps {
  onSaveComplete?: () => void
}

interface GeneratedTemplate {
  content: string
  name: string
  description: string
  thumbnailKey?: string | null
}

// Flow steps for two-step generation
type FlowStep = 'prompt' | 'analyzing' | 'questions' | 'generating' | 'complete'

// Example chips shown under the composer (i18n keys under ai.examples.*)
const EXAMPLE_KEYS = ['invoice', 'deliveryNote', 'monthlyReport', 'certificate', 'rentalContract'] as const

export function AIGenerateSection({ onSaveComplete }: AIGenerateSectionProps) {
  const common = useTranslations('common')
  const errors = useTranslations('errors')
  const ai = useTranslations('ai')
  const notifyApiError = useApiError()

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
    originalPrompt?: string // Store the original prompt for generation job
  }>({})

  // Two-step flow state
  const [flowStep, setFlowStep] = useState<FlowStep>('prompt')
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<{
    questions: StructuredQuestion[]
    imageAnalysis?: ImageAnalysis
  } | null>(null)

  // Job polling state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [currentJobType, setCurrentJobType] = useState<'analysis' | 'generation'>('generation')
  const aiMessageIdRef = useRef<string | null>(null)
  const processedJobIdRef = useRef<string | null>(null)

  // Query job status with polling
  const { data: jobStatus } = useAIJobStatus(currentJobId, { polling: true })

  // Generated content state
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null)
  const [editedTemplate, setEditedTemplate] = useState('')
  const [editedData, setEditedData] = useState('')

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  // Composer (initial prompt) UI state
  const [promptValue, setPromptValue] = useState('')
  const [composerImage, setComposerImage] = useState<{ base64: string; mediaType: string; preview: string } | null>(null)
  const composerFileRef = useRef<HTMLInputElement>(null)

  // Credits checks (mirrors the backend AI gate: enterprise or balance > 0)
  const plan = profile?.subscription?.plan || 'credits'
  const hasAccess = plan === 'enterprise' || (profile?.subscription?.creditBalance ?? 0) > 0
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

  // Generate PDF preview helper (defined before useEffect that uses it)
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

  // Handle job status updates
  useEffect(() => {
    if (!jobStatus || !aiMessageIdRef.current || !currentJobId) return

    // Skip if we've already processed this job's completion
    if ((jobStatus.status === 'completed' || jobStatus.status === 'failed') &&
        processedJobIdRef.current === currentJobId) {
      return
    }

    const aiMessageId = aiMessageIdRef.current

    if (jobStatus.status === 'processing') {
      // Update message to show processing
      const processingMessage = currentJobType === 'analysis'
        ? (ai('chat.analyzing') || 'Analyzing your requirements...')
        : ai('chat.generating')
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, content: processingMessage, isLoading: true }
          : msg
      ))
    } else if (jobStatus.status === 'completed') {
      // Handle completion based on job type
      if (currentJobType === 'analysis' && jobStatus.questions) {
        // Analysis job completed - show questions
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: ai('chat.analysisComplete') || 'Analysis complete! Please answer a few questions to help create your template.',
                isLoading: false,
              }
            : msg
        ))

        // Store analysis result and show question form
        setAnalysisResult({
          questions: jobStatus.questions,
          imageAnalysis: jobStatus.imageAnalysis,
        })
        setAnalysisJobId(currentJobId)
        setFlowStep('questions')
        processedJobIdRef.current = currentJobId
        setCurrentJobId(null)
        aiMessageIdRef.current = null
      } else if (jobStatus.template) {
        // Generation job completed successfully
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: ai('chat.templateGenerated', { name: jobStatus.template!.name }),
                isLoading: false,
              }
            : msg
        ))

        // Update generated template and editor (include thumbnailKey for saving)
        setGeneratedTemplate({
          ...jobStatus.template,
          thumbnailKey: jobStatus.thumbnailKey,
        })
        setEditedTemplate(jobStatus.template.content)
        setEditedData(JSON.stringify(jobStatus.sampleData || {}, null, 2))
        setFlowStep('complete')

        // Mark as processed and clear job tracking
        processedJobIdRef.current = currentJobId
        setCurrentJobId(null)
        aiMessageIdRef.current = null

        // Auto-generate PDF preview
        generatePdfPreview(jobStatus.template.content, jobStatus.sampleData || {})
      }
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

      // Reset flow step
      setFlowStep('prompt')
      processedJobIdRef.current = currentJobId
      setCurrentJobId(null)
      aiMessageIdRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStatus, currentJobType, currentJobId, generatePdfPreview])

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

      // Determine if this is a new template or iteration on existing
      const isIteration = !!editedTemplate

      if (isIteration) {
        // Iteration mode: Submit generation job directly (skip analysis)
        const result = await submitAIGeneration.mutateAsync({
          jobType: 'generation',
          prompt: message,
          imageBase64: finalImageBase64,
          imageMediaType: finalImageMediaType,
          imageS3Key: finalImageS3Key,
          previousTemplate: editedTemplate,
          feedback: message,
        })

        setCurrentJobId(result.jobId)
        setCurrentJobType('generation')
        setFlowStep('generating')
      } else {
        // New template: Submit analysis job first (two-step flow)
        const result = await submitAIGeneration.mutateAsync({
          jobType: 'analysis',
          prompt: message,
          imageBase64: finalImageBase64,
          imageMediaType: finalImageMediaType,
          imageS3Key: finalImageS3Key,
        })

        // Store original prompt for generation job
        setConversationContext(prev => ({ ...prev, originalPrompt: message }))
        setCurrentJobId(result.jobId)
        setCurrentJobType('analysis')
        setFlowStep('analyzing')
      }

      // Update message to show job submitted
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? {
              ...msg,
              content: isIteration
                ? ai('chat.jobSubmitted')
                : (ai('chat.analyzingSubmitted') || 'Analyzing your requirements...'),
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

      notifyApiError(err, { title: ai('generateError') })

      aiMessageIdRef.current = null
    }
  }, [
    submitAIGeneration,
    uploadAIImage,
    editedTemplate,
    conversationContext,
    ai,
    errors,
    notifyApiError,
    MAX_BASE64_SIZE,
  ])

  // Composer image selection (same validation as the chat widget: png/jpeg/webp, max 5MB)
  const handleComposerImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) return
    if (file.size > 5 * 1024 * 1024) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      const base64 = result.split(',')[1]
      setComposerImage({
        base64,
        mediaType: file.type,
        preview: result,
      })
    }
    reader.readAsDataURL(file)

    if (composerFileRef.current) {
      composerFileRef.current.value = ''
    }
  }, [])

  // Composer submit — routes into the existing chat/job flow
  const handleComposerSubmit = useCallback(() => {
    if (!promptValue.trim() && !composerImage) return
    if (submitAIGeneration.isPending || currentJobId) return

    handleSendMessage(promptValue.trim(), composerImage?.base64, composerImage?.mediaType)
    setPromptValue('')
    setComposerImage(null)
  }, [promptValue, composerImage, submitAIGeneration.isPending, currentJobId, handleSendMessage])

  const handleComposerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleComposerSubmit()
    }
  }, [handleComposerSubmit])

  // Handle question form submission
  const handleQuestionSubmit = useCallback(async (answers: QuestionAnswer[]) => {
    if (!analysisJobId || !conversationContext.originalPrompt) return

    // Add AI message for generation
    const aiMessageId = `ai-gen-${Date.now()}`
    aiMessageIdRef.current = aiMessageId
    setMessages(prev => [...prev, {
      id: aiMessageId,
      role: 'assistant',
      content: ai('chat.generatingFromAnswers') || 'Generating your template based on your answers...',
      timestamp: new Date(),
      isLoading: true,
    }])

    try {
      // Submit generation job with analysis context
      const result = await submitAIGeneration.mutateAsync({
        jobType: 'generation',
        prompt: conversationContext.originalPrompt,
        imageS3Key: conversationContext.imageS3Key,
        analysisJobId,
        answers,
      })

      setCurrentJobId(result.jobId)
      setCurrentJobType('generation')
      setFlowStep('generating')
    } catch (err) {
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? {
              ...msg,
              content: err instanceof Error ? err.message : errors('generic'),
              isLoading: false,
            }
          : msg
      ))

      notifyApiError(err, { title: ai('generateError') })

      setFlowStep('questions')
      aiMessageIdRef.current = null
    }
  }, [analysisJobId, conversationContext, submitAIGeneration, ai, errors, notifyApiError])

  // Handle back from questions to prompt
  const handleBackToPrompt = useCallback(() => {
    setFlowStep('prompt')
    setAnalysisResult(null)
    setAnalysisJobId(null)
    // Keep the conversation context (image) but clear the original prompt
    setConversationContext(prev => ({ ...prev, originalPrompt: undefined }))
  }, [])

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
        thumbnailKey: generatedTemplate.thumbnailKey || undefined,
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

      // Clear all state including two-step flow
      setGeneratedTemplate(null)
      setEditedTemplate('')
      setEditedData('')
      setPreviewUrl(null)
      setConversationContext({})
      setMessages([])
      setFlowStep('prompt')
      setAnalysisJobId(null)
      setAnalysisResult(null)

      onSaveComplete?.()
    } catch (err) {
      notifyApiError(err, { title: ai('saveError') })
    }
  }, [generatedTemplate, editedTemplate, uploadTemplate, ai, errors, onSaveComplete, notifyApiError])

  if (!hasAccess) {
    return <UpgradePrompt feature={ai('featureName')} />
  }

  const displayRemaining = isUnlimited
    ? ai('unlimited')
    : `${Math.max(0, remainingGenerations)} / ${aiLimit}`

  const isGenerating = submitAIGeneration.isPending || !!currentJobId

  // Initial centered composer (design handoff) vs working preview/chat states
  const showComposer = flowStep === 'prompt' && !generatedTemplate

  return (
    <div className={showComposer ? 'relative' : 'relative h-[calc(100vh-10rem)]'}>
      {/* Header with usage indicator and save button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-fg-dim">
            <Sparkles className="h-3.5 w-3.5 text-brand-text" strokeWidth={1.9} />
            {ai('remainingGenerations')}: <span className="text-fg-muted">{displayRemaining}</span>
          </span>
          {!isUnlimited && remainingGenerations <= 2 && remainingGenerations > 0 && (
            <span className="font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-warn">
              {ai('limitWarning')}
            </span>
          )}
          {!isUnlimited && remainingGenerations <= 0 && (
            <span className="font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-danger">
              {ai('limitReached')}
            </span>
          )}
        </div>

        {generatedTemplate && (
          <button
            onClick={handleSave}
            disabled={uploadTemplate.isPending}
            className="flex h-9 items-center gap-2 rounded-[9px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-[18px] text-sm font-semibold text-white shadow-[0_6px_18px_rgba(124,92,255,0.4)] transition-all hover:-translate-y-px disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {uploadTemplate.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {common('loading')}
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" strokeWidth={2} />
                {ai('chat.saveTemplate')}
              </>
            )}
          </button>
        )}
      </div>

      {/* Question Form (shown during 'questions' step) */}
      {flowStep === 'questions' && analysisResult && (
        <div className="flex h-full flex-col overflow-hidden rounded-[14px] border border-ink/[0.09] bg-surface-raised">
          <div className="flex items-center justify-between border-b border-ink/[0.07] px-6 py-4">
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-fg">
              {ai('questionsTitle') || 'Help us understand your template needs'}
            </h2>
            <button
              onClick={handleBackToPrompt}
              className="flex items-center gap-2 rounded-[9px] px-3 py-1.5 text-[13px] font-medium text-fg-muted transition-colors hover:bg-ink/[0.06] hover:text-fg"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {ai('startOver') || 'Start Over'}
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden p-6">
            <QuestionForm
              questions={analysisResult.questions}
              imageAnalysis={analysisResult.imageAnalysis}
              onSubmit={handleQuestionSubmit}
              onBack={handleBackToPrompt}
              isSubmitting={isGenerating}
            />
          </div>
        </div>
      )}

      {/* Centered composer (initial prompt state) */}
      {showComposer && (
        <div className="mx-auto max-w-[760px]">
          {/* Centered hero */}
          <div className="pb-[30px] pt-4 text-center">
            <div className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.14] text-brand-text">
              <Sparkles className="h-6 w-6" strokeWidth={1.7} />
            </div>
            <h1 className="mb-2 text-[26px] font-bold tracking-[-0.025em] text-fg">
              {ai('hero.title')}
            </h1>
            <p className="text-[14.5px] text-fg-muted">{ai('hero.subtitle')}</p>
          </div>

          {/* Prompt card */}
          <div className="mb-4 overflow-hidden rounded-2xl border border-[#8C6CFF]/30 bg-surface-raised shadow-[0_0_0_4px_rgba(124,92,255,0.06)] transition-colors focus-within:border-[#8C6CFF]/50">
            <textarea
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={ai('hero.placeholder')}
              disabled={isGenerating}
              rows={4}
              className="block min-h-[110px] w-full resize-none border-0 bg-transparent px-5 py-[18px] text-[15px] leading-[1.6] text-fg placeholder:text-fg-faint focus:outline-none focus:ring-0 disabled:opacity-60"
            />

            {/* Selected brand-asset preview */}
            {composerImage && (
              <div className="px-5 pb-3">
                <div className="relative inline-block">
                  <img
                    src={composerImage.preview}
                    alt={ai('hero.attach')}
                    className="h-16 w-16 rounded-[9px] border border-ink/[0.09] object-cover"
                  />
                  <button
                    onClick={() => setComposerImage(null)}
                    aria-label={ai('hero.removeImage')}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-ink/[0.12] bg-surface-overlay text-fg-muted transition-colors hover:text-fg"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Card footer: attach + generate */}
            <div className="flex items-center justify-between border-t border-ink/[0.07] px-3.5 py-3">
              <input
                ref={composerFileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleComposerImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => composerFileRef.current?.click()}
                disabled={isGenerating}
                className="flex items-center gap-[7px] rounded-lg px-2 py-1.5 text-[13px] text-fg-dim transition-colors hover:text-fg-muted disabled:opacity-50"
              >
                <Paperclip className="h-3.5 w-3.5" strokeWidth={2} />
                {ai('hero.attach')}
              </button>
              <button
                type="button"
                onClick={handleComposerSubmit}
                disabled={(!promptValue.trim() && !composerImage) || isGenerating}
                className="flex h-9 items-center gap-2 rounded-[9px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-[18px] text-sm font-semibold text-white shadow-[0_6px_18px_rgba(124,92,255,0.4)] transition-all hover:-translate-y-px disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {ai('hero.generate')}
              </button>
            </div>
          </div>

          {/* Example chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPromptValue(ai(`examples.${key}.prompt`))}
                disabled={isGenerating}
                className="rounded-full border border-ink/[0.09] bg-ink/[0.03] px-3.5 py-[7px] text-[13px] text-fg-muted transition-colors hover:border-[#8C6CFF]/40 hover:text-brand-strong disabled:opacity-50"
              >
                {ai(`examples.${key}.label`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full-screen preview (shown when generating or after completion) */}
      {flowStep !== 'questions' && !showComposer && (
        <>
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
        </>
      )}
    </div>
  )
}
