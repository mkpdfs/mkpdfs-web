'use client'

import { useState } from 'react'
import { useTemplates, useDeleteTemplate, useUploadTemplate } from '@/hooks/useApi'
import { Card, CardContent, Button, Spinner, Input, Label, DropZone } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import { FileText, Trash2, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function TemplatesPage() {
  const { data: templates, isLoading, error } = useTemplates()
  const deleteTemplate = useDeleteTemplate()
  const uploadTemplate = useUploadTemplate()
  const t = useTranslations('templates')
  const common = useTranslations('common')
  const errors = useTranslations('errors')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [description, setDescription] = useState('')

  const filteredTemplates = templates?.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const nameWithoutExt = file.name.replace(/\.(hbs|handlebars|html)$/i, '')
    setTemplateName(nameWithoutExt)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setTemplateName('')
    setDescription('')
  }

  const handleUpload = async () => {
    if (!selectedFile || !templateName.trim()) return

    try {
      await uploadTemplate.mutateAsync({
        file: selectedFile,
        name: templateName.trim(),
        description: description.trim() || undefined,
      })
      toast({
        title: t('uploadDialog.success'),
        description: `"${templateName}"`,
      })
      handleClearFile()
    } catch (err) {
      toast({
        title: t('uploadDialog.error'),
        description: err instanceof Error ? err.message : errors('generic'),
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(t('card.deleteConfirm'))) {
      return
    }

    try {
      await deleteTemplate.mutateAsync(templateId)
      toast({
        title: t('card.delete'),
        description: `"${templateName}"`,
      })
    } catch (err) {
      toast({
        title: common('error'),
        description: errors('generic'),
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

      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          {!selectedFile ? (
            <DropZone onFileSelect={handleFileSelect} disabled={uploadTemplate.isPending} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearFile}
                  disabled={uploadTemplate.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="templateName">{t('uploadDialog.name')} *</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder={t('uploadDialog.namePlaceholder')}
                    disabled={uploadTemplate.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('uploadDialog.description')}</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('uploadDialog.descriptionPlaceholder')}
                    disabled={uploadTemplate.isPending}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={!templateName.trim() || uploadTemplate.isPending}
                >
                  {uploadTemplate.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      {common('loading')}
                    </>
                  ) : (
                    t('uploadDialog.submit')
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={common('search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{errors('generic')}</p>
          </CardContent>
        </Card>
      ) : filteredTemplates?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-foreground-dark">
              {searchQuery ? t('empty.noResults') : t('empty.title')}
            </h3>
            <p className="mt-2 text-sm text-foreground-light">
              {searchQuery ? t('empty.tryAgain') : t('empty.description')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates?.map((template) => (
            <Card key={template.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary-50 p-2.5">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground-dark">{template.name}</h3>
                      <p className="text-sm text-foreground-light">
                        {formatDate(template.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(template.id, template.name)}
                    disabled={deleteTemplate.isPending}
                    className="text-foreground-light hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {template.description && (
                  <p className="mt-3 text-sm text-foreground-light line-clamp-2">
                    {template.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
