'use client'

import { useState } from 'react'
import { useTokens, useCreateToken, useDeleteToken } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Spinner } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import { Key, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react'

export default function ApiKeysPage() {
  const { data: tokens, isLoading } = useTokens()
  const createToken = useCreateToken()
  const deleteToken = useDeleteToken()

  const [newTokenName, setNewTokenName] = useState('')
  const [newToken, setNewToken] = useState<string | null>(null)
  const [showToken, setShowToken] = useState(false)

  const handleCreate = async () => {
    if (!newTokenName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your API key.',
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await createToken.mutateAsync({ name: newTokenName.trim() })
      setNewToken(result.token)
      setNewTokenName('')
      toast({
        title: 'API Key Created',
        description: 'Make sure to copy your key - it won\'t be shown again.',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create API key.'
      const isLimitError = message.toLowerCase().includes('limit')
      toast({
        title: isLimitError ? 'Limit Reached' : 'Error',
        description: message,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (tokenId: string, tokenName: string) => {
    if (!confirm(`Are you sure you want to delete "${tokenName}"?`)) return

    try {
      await deleteToken.mutateAsync(tokenId)
      toast({
        title: 'API Key Deleted',
        description: `"${tokenName}" has been deleted.`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete API key.',
        variant: 'destructive',
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied to clipboard' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-dark">API Keys</h1>
        <p className="mt-1 text-sm text-foreground-light">
          Manage API keys for programmatic access to mkpdfs.
        </p>
      </div>

      {/* Create New Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create New API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="API Key Name (e.g., Production, Development)"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} isLoading={createToken.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </div>

          {newToken && (
            <div className="mt-4 rounded-lg bg-warning/10 p-4">
              <p className="mb-2 text-sm font-medium text-warning-foreground">
                Save this key now - it won&apos;t be shown again!
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
          <CardTitle className="text-lg">Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : tokens?.length === 0 ? (
            <div className="py-8 text-center text-foreground-light">
              <Key className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4">No API keys yet. Create one above.</p>
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
                        Created {formatDate(token.createdAt)}
                        {token.lastUsed && ` • Last used ${formatDate(token.lastUsed)}`}
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
