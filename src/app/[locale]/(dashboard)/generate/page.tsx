'use client'

import { useState } from 'react'
import { useTemplates, useGeneratePdf } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Button, Label, Spinner } from '@/components/ui'
import { CodeSnippets } from '@/components/CodeSnippets'
import { toast } from '@/hooks/useToast'
import { Sparkles, FileText, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function GeneratePage() {
  const { data: templates, isLoading: templatesLoading } = useTemplates()
  const generatePdf = useGeneratePdf()
  const t = useTranslations('generate')
  const common = useTranslations('common')
  const errors = useTranslations('errors')

  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [jsonData, setJsonData] = useState('{\n  "name": "John Doe",\n  "date": "2025-01-01"\n}')
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast({
        title: common('error'),
        description: t('noTemplates'),
        variant: 'destructive',
      })
      return
    }

    let parsedData
    try {
      parsedData = JSON.parse(jsonData)
    } catch (e) {
      toast({
        title: t('invalidJson'),
        description: errors('validationError'),
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await generatePdf.mutateAsync({
        templateId: selectedTemplate,
        data: parsedData,
      })

      if (result.pdfUrl) {
        setGeneratedUrl(result.pdfUrl)
        toast({
          title: t('success'),
          description: t('successDescription'),
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : errors('generic')
      const isLimitError = message.toLowerCase().includes('limit')
      toast({
        title: isLimitError ? errors('limitReached') : t('error'),
        description: message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground-dark">{t('title')}</h1>
        <p className="mt-1 text-sm text-foreground-light">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('configuration')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">{t('selectTemplate')}</Label>
              {templatesLoading ? (
                <Spinner size="sm" />
              ) : (
                <select
                  id="template"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">{t('selectTemplatePlaceholder')}</option>
                  {templates?.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">{t('jsonData')}</Label>
              <textarea
                id="data"
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                rows={10}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder={t('jsonDataPlaceholder')}
              />
            </div>

            <Button
              onClick={handleGenerate}
              isLoading={generatePdf.isPending}
              disabled={!selectedTemplate || templatesLoading}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t('submit')}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">{t('preview')}</CardTitle>
            {generatedUrl && (
              <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  {common('download')}
                </Button>
              </a>
            )}
          </CardHeader>
          <CardContent className="flex-1">
            {generatedUrl ? (
              <iframe
                src={generatedUrl}
                className="h-[500px] w-full rounded-md border"
                title={t('preview')}
              />
            ) : (
              <div className="flex h-[500px] flex-col items-center justify-center rounded-md border border-dashed text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-foreground-light">
                  {t('previewPlaceholder')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Code Snippets */}
      <CodeSnippets templateId={selectedTemplate} jsonData={jsonData} />
    </div>
  )
}
