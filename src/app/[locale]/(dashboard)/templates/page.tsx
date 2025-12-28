'use client'

import { useState } from 'react'
import { useTemplates, useDeleteTemplate } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner, Input, Label } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import { FileText, Plus, Trash2, Upload, Search } from 'lucide-react'

export default function TemplatesPage() {
  const { data: templates, isLoading, error } = useTemplates()
  const deleteTemplate = useDeleteTemplate()

  const [searchQuery, setSearchQuery] = useState('')

  const filteredTemplates = templates?.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"?`)) {
      return
    }

    try {
      await deleteTemplate.mutateAsync(templateId)
      toast({
        title: 'Template deleted',
        description: `"${templateName}" has been deleted.`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete template.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground-dark">Templates</h1>
          <p className="mt-1 text-sm text-foreground-light">
            Manage your Handlebars templates for PDF generation.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
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
            <p className="text-destructive">Failed to load templates. Please try again.</p>
          </CardContent>
        </Card>
      ) : filteredTemplates?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground-dark">
              {searchQuery ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="mt-2 text-sm text-foreground-light">
              {searchQuery
                ? 'Try a different search term.'
                : 'Upload your first Handlebars template to get started.'}
            </p>
            {!searchQuery && (
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Upload Template
              </Button>
            )}
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
