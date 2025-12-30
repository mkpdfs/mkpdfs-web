'use client'

import { useState } from 'react'
import { useTokens, useCreateToken, useDeleteToken } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Spinner } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import { Key, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ApiKeysPage() {
  const { data: tokens, isLoading } = useTokens()
  const createToken = useCreateToken()
  const deleteToken = useDeleteToken()
  const t = useTranslations('apiKeys')
  const common = useTranslations('common')
  const errors = useTranslations('errors')

  const [newTokenName, setNewTokenName] = useState('')
  const [newToken, setNewToken] = useState<string | null>(null)
  const [showToken, setShowToken] = useState(false)

  const handleCreate = async () => {
    if (!newTokenName.trim()) {
      toast({
        title: common('error'),
        description: t('createDialog.nameHint'),
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await createToken.mutateAsync({ name: newTokenName.trim() })
      setNewToken(result.token)
      setNewTokenName('')
      toast({
        title: t('createDialog.success'),
        description: t('warning'),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : t('createDialog.error')
      const isLimitError = message.toLowerCase().includes('limit')
      toast({
        title: isLimitError ? errors('limitReached') : common('error'),
        description: message,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (tokenId: string, tokenName: string) => {
    if (!confirm(t('card.revokeConfirm'))) return

    try {
      await deleteToken.mutateAsync(tokenId)
      toast({
        title: t('card.revoke'),
        description: `"${tokenName}"`,
      })
    } catch (err) {
      toast({
        title: common('error'),
        description: errors('generic'),
        variant: 'destructive',
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: common('copied') })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-dark">{t('title')}</h1>
        <p className="mt-1 text-sm text-foreground-light">
          {t('subtitle')}
        </p>
      </div>

      {/* Create New Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('create')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('createDialog.namePlaceholder')}
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} isLoading={createToken.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createDialog.submit')}
            </Button>
          </div>

          {newToken && (
            <div className="mt-4 rounded-lg bg-warning/10 p-4">
              <p className="mb-2 text-sm font-medium text-warning-foreground">
                {t('warning')}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background p-2 font-mono text-sm">
                  {showToken ? newToken : '••••••••••••••••••••••••'}
                </code>
                <Button variant="ghost" size="icon" onClick={() => setShowToken(!showToken)}>
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(newToken)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('yourKeys')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : tokens?.length === 0 ? (
            <div className="py-8 text-center text-foreground-light">
              <Key className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4">{t('empty.description')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens?.map((token) => (
                <div
                  key={token.tokenId}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary-50 p-2">
                      <Key className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground-dark">{token.name}</p>
                      <p className="text-sm text-foreground-light">
                        {t('card.created', { date: formatDate(token.createdAt) })}
                        {token.lastUsed && ` • ${t('card.lastUsed', { date: formatDate(token.lastUsed) })}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(token.tokenId, token.name)}
                    className="text-foreground-light hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
