'use client'

import { useState } from 'react'
import { Sparkles, Save, RefreshCw, Code, FileText, Database } from 'lucide-react'
import { Card, CardContent, Button, Spinner, Label } from '@/components/ui'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { useProfile, useGenerateAITemplate, useUploadTemplate, useGeneratePdf } from '@/hooks/useApi'
import { toast } from '@/hooks/useToast'
import { useTranslations } from 'next-intl'
import type { GenerateAITemplateResponse } from '@/types'

export function AIGenerateSection() {
  const t = useTranslations('templates')
  const common = useTranslations('common')
  const errors = useTranslations('errors')
  const ai = useTranslations('ai')

  const { data: profile } = useProfile()
  const generateTemplate = useGenerateAITemplate()
  const uploadTemplate = useUploadTemplate()
  const generatePdf = useGeneratePdf()

  const [prompt, setPrompt] = useState('')
  const [generatedResult, setGeneratedResult] = useState<GenerateAITemplateResponse | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'template' | 'data'>('template')

  // Check subscription access
  const plan = profile?.subscription?.plan || 'free'
  const hasAccess = plan !== 'free'
  const aiLimit = profile?.subscriptionLimits?.aiGenerationsPerMonth ?? 0
  const isUnlimited = aiLimit === -1

  // Calculate remaining (this is a rough estimate - the actual count comes from the API response)
  const remainingGenerations = generatedResult?.remainingGenerations ?? (isUnlimited ? -1 : aiLimit)

  if (!hasAccess) {
    return <UpgradePrompt feature={ai('featureName')} requiredPlan="starter" />
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    try {
      const result = await generateTemplate.mutateAsync({ prompt: prompt.trim() })
      setGeneratedResult(result)

      // Generate PDF preview
      if (result.template && result.sampleData) {
        await generatePreview(result)
      }
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
      // Don't show error toast - preview is optional
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generatedResult) return

    try {
      const templateBlob = new Blob([generatedResult.template.content], { type: 'text/html' })
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

      // Clear the generated result after saving
      setGeneratedResult(null)
      setPreviewUrl(null)
      setPrompt('')
    } catch (err) {
      toast({
        title: ai('saveError'),
        description: err instanceof Error ? err.message : errors('generic'),
        variant: 'destructive',
      })
    }
  }

  const handleRegenerate = () => {
    setGeneratedResult(null)
    setPreviewUrl(null)
    handleGenerate()
  }

  const displayRemaining = isUnlimited
    ? ai('unlimited')
    : `${Math.max(0, remainingGenerations)} / ${aiLimit}`

  return (
    <div className="space-y-6">
      {/* Usage Indicator */}
      <div className="flex items-center justify-between text-sm text-foreground-light">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {ai('remainingGenerations')}: {displayRemaining}
        </span>
        {!isUnlimited && remainingGenerations <= 0 && (
          <span className="text-destructive font-medium">{ai('limitReached')}</span>
        )}
      </div>

      {/* Prompt Input */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">{ai('promptLabel')}</Label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder={ai('promptPlaceholder')}
              className="w-full rounded-md border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              disabled={generateTemplate.isPending}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={
                !prompt.trim() ||
                generateTemplate.isPending ||
                (!isUnlimited && remainingGenerations <= 0)
              }
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
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {generatedResult && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Template/Data Preview */}
            <Card>
              <CardContent className="p-4">
                {/* Tabs */}
                <div className="flex gap-1 rounded-lg bg-muted p-1 mb-4">
                  <button
                    onClick={() => setActiveTab('template')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'template'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Code className="h-4 w-4" />
                    {ai('templateTab')}
                  </button>
                  <button
                    onClick={() => setActiveTab('data')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'data'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Database className="h-4 w-4" />
                    {ai('dataTab')}
                  </button>
                </div>

                {/* Content */}
                <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
                  {activeTab === 'template'
                    ? generatedResult.template.content
                    : JSON.stringify(generatedResult.sampleData, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* PDF Preview */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{ai('pdfPreview')}</span>
                </div>

                {isPreviewLoading ? (
                  <div className="h-96 border rounded-lg flex items-center justify-center bg-muted/50">
                    <div className="text-center">
                      <Spinner size="lg" className="mb-2" />
                      <p className="text-sm text-muted-foreground">{ai('generatingPreview')}</p>
                    </div>
                  </div>
                ) : previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-96 border rounded-lg"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="h-96 border rounded-lg flex items-center justify-center bg-muted/50">
                    <p className="text-sm text-muted-foreground">{ai('previewUnavailable')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Template Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground-dark">
                    {generatedResult.template.name}
                  </h3>
                  <p className="text-sm text-foreground-light mt-1">
                    {generatedResult.template.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={generateTemplate.isPending || (!isUnlimited && remainingGenerations <= 0)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {ai('regenerate')}
                  </Button>
                  <Button onClick={handleSave} disabled={uploadTemplate.isPending}>
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
