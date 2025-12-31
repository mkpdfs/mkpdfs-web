'use client'

import { useState, useCallback, useMemo } from 'react'
import { Sparkles, Save, RefreshCw, MessageSquare } from 'lucide-react'
import { Card, CardContent, Button, Spinner, Label } from '@/components/ui'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { ImageUploadZone, type ImageData } from './ImageUploadZone'
import { CodeEditor } from './CodeEditor'
import { LivePreview } from './LivePreview'
import { VersionComparison } from './VersionComparison'
import { useProfile, useGenerateAITemplate, useUploadTemplate, useGeneratePdf } from '@/hooks/useApi'
import { toast } from '@/hooks/useToast'
import { useTranslations } from 'next-intl'
import type { GenerateAITemplateResponse } from '@/types'

interface AIGenerateSectionProps {
  onSaveComplete?: () => void
}

interface VersionData {
  template: string
  name: string
  description: string
  sampleData: Record<string, unknown>
}

export function AIGenerateSection({ onSaveComplete }: AIGenerateSectionProps) {
  const t = useTranslations('templates')
  const common = useTranslations('common')
  const errors = useTranslations('errors')
  const ai = useTranslations('ai')

  const { data: profile } = useProfile()
  const generateTemplate = useGenerateAITemplate()
  const uploadTemplate = useUploadTemplate()
  const generatePdf = useGeneratePdf()

  // Input state
  const [prompt, setPrompt] = useState('')
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showFeedbackInput, setShowFeedbackInput] = useState(false)

  // Generated content state
  const [generatedResult, setGeneratedResult] = useState<GenerateAITemplateResponse | null>(null)
  const [editedTemplate, setEditedTemplate] = useState('')
  const [editedData, setEditedData] = useState('')

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  // Version comparison state
  const [previousVersion, setPreviousVersion] = useState<VersionData | null>(null)
  const [isComparing, setIsComparing] = useState(false)

  // Subscription checks
  const plan = profile?.subscription?.plan || 'free'
  const hasAccess = plan !== 'free'
  const aiLimit = profile?.subscriptionLimits?.aiGenerationsPerMonth ?? 0
  const isUnlimited = aiLimit === -1
  const remainingGenerations = generatedResult?.remainingGenerations ?? (isUnlimited ? -1 : aiLimit)

  // Parse sample data for preview
  const parsedSampleData = useMemo(() => {
    try {
      return JSON.parse(editedData || '{}')
    } catch {
      return {}
    }
  }, [editedData])

  if (!hasAccess) {
    return <UpgradePrompt feature={ai('featureName')} requiredPlan="starter" />
  }

  const handleGenerate = async (withFeedback = false) => {
    if (!prompt.trim()) return

    try {
      // If regenerating with feedback, save current version for comparison
      if (withFeedback && generatedResult) {
        setPreviousVersion({
          template: editedTemplate || generatedResult.template.content,
          name: generatedResult.template.name,
          description: generatedResult.template.description,
          sampleData: parsedSampleData,
        })
      }

      const result = await generateTemplate.mutateAsync({
        prompt: prompt.trim(),
        imageBase64: imageData?.base64,
        imageMediaType: imageData?.mediaType,
        previousTemplate: withFeedback ? (editedTemplate || generatedResult?.template.content) : undefined,
        feedback: withFeedback ? feedback.trim() : undefined,
      })

      setGeneratedResult(result)
      setEditedTemplate(result.template.content)
      setEditedData(JSON.stringify(result.sampleData, null, 2))
      setFeedback('')
      setShowFeedbackInput(false)

      // Show comparison if this was a feedback-based regeneration
      if (withFeedback && previousVersion) {
        setIsComparing(true)
      }

      // Generate PDF preview
      await generatePreview(result)
    } catch (err) {
      toast({
        title: ai('generateError'),
        description: err instanceof Error ? err.message : errors('generic'),
        variant: 'destructive',
      })
    }
  }

  const generatePreview = async (result: GenerateAITemplateResponse) => {
    setIsPreviewLoading(true)
    setPreviewUrl(null)

    try {
      // First, upload the template temporarily
      const templateBlob = new Blob([result.template.content], { type: 'text/html' })
      const templateFile = new File([templateBlob], `preview-${Date.now()}.hbs`)

      const uploadedTemplate = await uploadTemplate.mutateAsync({
        file: templateFile,
        name: `_preview_${Date.now()}`,
        description: 'AI Preview - Temporary',
      })

      // Generate PDF preview
      const pdfResult = await generatePdf.mutateAsync({
        templateId: uploadedTemplate.id,
        data: result.sampleData,
      })

      if (pdfResult.pdfUrl) {
        setPreviewUrl(pdfResult.pdfUrl)
      }
    } catch (err) {
      console.error('Preview generation failed:', err)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleRequestPdfPreview = useCallback(async () => {
    if (!editedTemplate) return

    setIsPreviewLoading(true)
    setPreviewUrl(null)

    try {
      const templateBlob = new Blob([editedTemplate], { type: 'text/html' })
      const templateFile = new File([templateBlob], `preview-${Date.now()}.hbs`)

      const uploadedTemplate = await uploadTemplate.mutateAsync({
        file: templateFile,
        name: `_preview_${Date.now()}`,
        description: 'AI Preview - Temporary',
      })

      const pdfResult = await generatePdf.mutateAsync({
        templateId: uploadedTemplate.id,
        data: parsedSampleData,
      })

      if (pdfResult.pdfUrl) {
        setPreviewUrl(pdfResult.pdfUrl)
      }
    } catch (err) {
      console.error('Preview generation failed:', err)
    } finally {
      setIsPreviewLoading(false)
    }
  }, [editedTemplate, parsedSampleData, uploadTemplate, generatePdf])

  const handleSave = async () => {
    if (!generatedResult) return

    try {
      const templateBlob = new Blob([editedTemplate || generatedResult.template.content], { type: 'text/html' })
      const templateFile = new File([templateBlob], `${generatedResult.template.name}.hbs`)

      await uploadTemplate.mutateAsync({
        file: templateFile,
        name: generatedResult.template.name,
        description: generatedResult.template.description,
      })

      toast({
        title: ai('saveSuccess'),
        description: `"${generatedResult.template.name}"`,
      })

      // Clear all state after saving
      setGeneratedResult(null)
      setEditedTemplate('')
      setEditedData('')
      setPreviewUrl(null)
      setPrompt('')
      setImageData(null)
      setPreviousVersion(null)
      setIsComparing(false)

      onSaveComplete?.()
    } catch (err) {
      toast({
        title: ai('saveError'),
        description: err instanceof Error ? err.message : errors('generic'),
        variant: 'destructive',
      })
    }
  }

  const handleAcceptCurrent = () => {
    setIsComparing(false)
    setPreviousVersion(null)
  }

  const handleRevertToPrevious = () => {
    if (previousVersion) {
      setEditedTemplate(previousVersion.template)
      setEditedData(JSON.stringify(previousVersion.sampleData, null, 2))
      setIsComparing(false)
      setPreviousVersion(null)
    }
  }

  const displayRemaining = isUnlimited
    ? ai('unlimited')
    : `${Math.max(0, remainingGenerations)} / ${aiLimit}`

  const canGenerate = prompt.trim().length > 0 &&
    !generateTemplate.isPending &&
    (isUnlimited || remainingGenerations > 0)

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Usage Indicator */}
      <div className="flex items-center justify-between text-sm text-foreground-light mb-4">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {ai('remainingGenerations')}: {displayRemaining}
        </span>
        {!isUnlimited && remainingGenerations <= 0 && (
          <span className="text-destructive font-medium">{ai('limitReached')}</span>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Panel - Input & Editor */}
        <div className="w-2/5 flex flex-col gap-4 min-h-0">
          {/* Prompt Input */}
          <Card className="shrink-0">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="prompt">{ai('promptLabel')}</Label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder={ai('promptPlaceholder')}
                  className="w-full rounded-md border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  disabled={generateTemplate.isPending}
                />
              </div>

              {/* Image Upload */}
              <ImageUploadZone
                imageData={imageData}
                onImageSelect={setImageData}
                disabled={generateTemplate.isPending}
              />

              {/* Generate Button */}
              <Button
                onClick={() => handleGenerate(false)}
                disabled={!canGenerate}
                className="w-full"
              >
                {generateTemplate.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    {ai('generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {ai('generateButton')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Code Editor (visible after generation) */}
          {generatedResult && (
            <>
              <CodeEditor
                templateValue={editedTemplate}
                dataValue={editedData}
                onTemplateChange={setEditedTemplate}
                onDataChange={setEditedData}
                disabled={generateTemplate.isPending}
                className="flex-1 min-h-0"
              />

              {/* Feedback Input */}
              {showFeedbackInput && (
                <Card className="shrink-0">
                  <CardContent className="p-3 space-y-2">
                    <Label>{ai('feedback.label')}</Label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={2}
                      placeholder={ai('feedback.placeholder')}
                      className="w-full rounded-md border border-border bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleGenerate(true)}
                        disabled={!feedback.trim() || generateTemplate.isPending}
                        className="flex-1"
                      >
                        {generateTemplate.isPending ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {ai('feedback.regenerateWith')}
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowFeedbackInput(false)
                          setFeedback('')
                        }}
                      >
                        {common('cancel')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 shrink-0">
                {!showFeedbackInput && (
                  <Button
                    variant="outline"
                    onClick={() => setShowFeedbackInput(true)}
                    disabled={generateTemplate.isPending || (!isUnlimited && remainingGenerations <= 0)}
                    className="flex-1"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {ai('regenerate')}
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={uploadTemplate.isPending}
                  className="flex-1"
                >
                  {uploadTemplate.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      {common('loading')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {ai('saveTemplate')}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Preview & Comparison */}
        <div className="w-3/5 flex flex-col gap-4 min-h-0">
          {/* Live Preview */}
          <LivePreview
            templateContent={editedTemplate}
            sampleData={parsedSampleData}
            pdfUrl={previewUrl}
            isPdfLoading={isPreviewLoading}
            onRequestPdf={handleRequestPdfPreview}
            className="flex-1 min-h-0"
          />

          {/* Version Comparison (when comparing) */}
          {isComparing && previousVersion && generatedResult && (
            <VersionComparison
              previousVersion={{
                template: previousVersion.template,
                name: previousVersion.name,
                description: previousVersion.description,
              }}
              currentVersion={{
                template: editedTemplate,
                name: generatedResult.template.name,
                description: generatedResult.template.description,
              }}
              onAcceptCurrent={handleAcceptCurrent}
              onRevertToPrevious={handleRevertToPrevious}
              className="h-64 shrink-0"
            />
          )}

          {/* Template Info (when generated) */}
          {generatedResult && !isComparing && (
            <Card className="shrink-0">
              <CardContent className="p-3">
                <h3 className="font-medium text-foreground-dark">
                  {generatedResult.template.name}
                </h3>
                <p className="text-sm text-foreground-light mt-1">
                  {generatedResult.template.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
