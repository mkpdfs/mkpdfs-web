'use client'

import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useTokens, useCreateToken, useDeleteToken, useProfile } from '@/hooks/useApi'
import { Spinner } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import { useApiError } from '@/hooks/useApiError'
import { Key, Plus, Trash2, Copy, Eye, EyeOff, X, AlertTriangle, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

const gradientButtonClass =
  'inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-[18px] text-sm font-semibold text-white shadow-[0_6px_20px_rgba(124,92,255,0.35)] transition-all hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(124,92,255,0.5)] disabled:pointer-events-none disabled:opacity-60'

const ghostIconButtonClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-ink/[0.12] bg-ink/[0.04] text-fg-muted transition-colors hover:bg-ink/[0.08] hover:text-fg'

function maskTokenId(tokenId: string) {
  if (tokenId.length <= 10) return tokenId
  return `${tokenId.slice(0, 6)}…${tokenId.slice(-4)}`
}

export default function ApiKeysPage() {
  const { data: tokens, isLoading } = useTokens()
  const { data: profile } = useProfile()
  const createToken = useCreateToken()
  const deleteToken = useDeleteToken()
  const t = useTranslations('apiKeys')
  const common = useTranslations('common')
  const errors = useTranslations('errors')
  const notifyApiError = useApiError()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [newToken, setNewToken] = useState<string | null>(null)
  const [showToken, setShowToken] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<{ tokenId: string; name: string } | null>(null)

  const keyCount = tokens?.length ?? 0
  const keyLimit = profile?.subscriptionLimits?.apiTokensAllowed ?? 3

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
      setShowToken(true)
      setNewTokenName('')
      setDialogOpen(false)
      toast({
        title: t('createDialog.success'),
        description: t('warning'),
      })
    } catch (err) {
      // The backend message is always English (server-side), so matching on it
      // here is locale-safe; the user-facing description is localized.
      const isLimitError =
        err instanceof Error && err.message.toLowerCase().includes('limit')
      notifyApiError(err, isLimitError ? { title: errors('limitReached') } : undefined)
    }
  }

  const confirmRevoke = async () => {
    if (!revokeTarget) return
    const { tokenId, name } = revokeTarget
    try {
      await deleteToken.mutateAsync(tokenId)
      toast({ title: t('card.revoke'), description: `"${name}"` })
    } catch (err) {
      notifyApiError(err)
    } finally {
      setRevokeTarget(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: common('copied') })
  }

  const downloadKey = (token: string) => {
    const payload = JSON.stringify({ apiKey: token, createdAt: new Date().toISOString() }, null, 2)
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'mkpdfs-api-key.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="mb-1.5 text-[26px] font-bold tracking-[-0.025em]">{t('title')}</h1>
          <p className="text-[14.5px] text-fg-muted">
            {t('subtitleScoped')}{' '}
            <span className="font-geist-mono text-fg-dim">
              {keyCount} / {keyLimit === -1 ? '∞' : keyLimit}
            </span>
          </p>
        </div>
        <button onClick={() => setDialogOpen(true)} className={gradientButtonClass}>
          <Plus className="h-[15px] w-[15px]" strokeWidth={2.2} />
          {t('createKey')}
        </button>
      </div>

      {/* New key reveal — shown ONCE; the secret is hashed server-side and cannot be recovered */}
      {newToken && (
        <div className="mb-6 rounded-[14px] border border-[#8C6CFF]/40 bg-[#8C6CFF]/[0.08] p-5">
          <div className="mb-1.5 flex items-center gap-2">
            <AlertTriangle className="h-[17px] w-[17px] shrink-0 text-brand-strong" strokeWidth={2.2} />
            <p className="text-[15px] font-semibold text-brand-strong">{t('reveal.title')}</p>
          </div>
          <p className="mb-4 text-[13px] leading-relaxed text-fg-muted">{t('reveal.warning')}</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-[9px] border border-ink/10 bg-ink/[0.05] px-3.5 py-2.5 font-geist-mono text-[13px] text-fg">
              {showToken ? newToken : '••••••••••••••••••••••••'}
            </code>
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className={ghostIconButtonClass}
              aria-label={showToken ? common('hide') : common('show')}
              title={showToken ? common('hide') : common('show')}
            >
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(newToken)}
              className={gradientButtonClass}
            >
              <Copy className="h-4 w-4" strokeWidth={2.1} />
              {t('reveal.copyKey')}
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => downloadKey(newToken)}
              className="inline-flex h-[34px] items-center gap-2 rounded-[9px] border border-ink/[0.12] bg-ink/[0.04] px-3.5 text-[13px] font-medium text-fg-muted transition-colors hover:bg-ink/[0.08] hover:text-fg"
            >
              <Download className="h-[15px] w-[15px]" />
              {t('reveal.download')}
            </button>
            <button
              type="button"
              onClick={() => setNewToken(null)}
              className="text-[13px] font-medium text-fg-muted transition-colors hover:text-fg"
            >
              {t('reveal.done')}
            </button>
          </div>
        </div>
      )}

      {/* Keys */}
      {isLoading ? (
        <div className="flex justify-center py-16 text-fg-muted">
          <Spinner />
        </div>
      ) : keyCount === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/[0.15] px-8 py-16 text-center">
          <div className="mb-[18px] flex h-14 w-14 items-center justify-center rounded-[15px] border border-[#8C6CFF]/25 bg-[#8C6CFF]/10 text-brand-text">
            <Key className="h-[26px] w-[26px]" strokeWidth={1.7} />
          </div>
          <h2 className="mb-2 text-lg font-semibold">{t('empty.title')}</h2>
          <p className="mb-6 max-w-[400px] text-[14.5px] text-fg-muted">{t('empty.body')}</p>
          <button onClick={() => setDialogOpen(true)} className={gradientButtonClass}>
            {t('empty.cta')}
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-ink/[0.09] bg-surface">
          {/* Column headers */}
          <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_88px] items-center gap-4 border-b border-ink/[0.08] bg-ink/[0.02] px-[18px] py-[11px] sm:grid">
            <span className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim">
              {t('table.name')}
            </span>
            <span className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim">
              {t('table.key')}
            </span>
            <span className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim">
              {t('table.created')}
            </span>
            <span className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim">
              {t('table.lastUsed')}
            </span>
            <span />
          </div>

          {tokens?.map((token) => (
            <div
              key={token.tokenId}
              className="grid grid-cols-1 items-center gap-2 border-b border-ink/[0.05] px-[18px] py-[13px] transition-colors last:border-b-0 hover:bg-ink/[0.025] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_88px] sm:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Key className="h-4 w-4 shrink-0 text-brand-text" strokeWidth={1.9} />
                <span className="truncate text-[14px] font-medium text-fg">
                  {token.name}
                </span>
              </div>
              <div>
                <span className="inline-flex max-w-full items-center truncate rounded-md border border-ink/[0.08] bg-ink/[0.05] px-[9px] py-[3px] font-geist-mono text-[11.5px] text-fg-muted">
                  {token.keyHint ?? maskTokenId(token.tokenId)}
                </span>
              </div>
              <div className="text-[13px] text-fg-dim">
                <span className="sm:hidden">{t('card.created', { date: formatDate(token.createdAt) })}</span>
                <span className="hidden sm:inline">{formatDate(token.createdAt)}</span>
              </div>
              <div className="text-[13px] text-fg-dim">
                {token.lastUsed ? (
                  <>
                    <span className="sm:hidden">{t('card.lastUsed', { date: formatDate(token.lastUsed) })}</span>
                    <span className="hidden sm:inline">{formatDate(token.lastUsed)}</span>
                  </>
                ) : (
                  t('card.neverUsed')
                )}
              </div>
              <div className="sm:justify-self-end">
                <button
                  type="button"
                  onClick={() => setRevokeTarget({ tokenId: token.tokenId, name: token.name })}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[rgb(var(--danger-soft)/0.35)] bg-[rgb(var(--danger-soft)/0.1)] px-3 text-[12.5px] font-medium text-danger-soft transition-colors hover:bg-[rgb(var(--danger-soft)/0.18)]"
                >
                  <Trash2 className="h-[13px] w-[13px]" strokeWidth={2} />
                  {t('card.revoke')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create key dialog */}
      <DialogPrimitive.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-ink/10 bg-surface-card p-6 text-fg shadow-[0_24px_60px_rgba(0,0,0,0.55)] duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
            <DialogPrimitive.Title className="text-[17px] font-semibold tracking-[-0.015em]">
              {t('createDialog.title')}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1.5 text-[13.5px] text-fg-muted">
              {t('createDialog.description')}
            </DialogPrimitive.Description>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleCreate()
              }}
              className="mt-5"
            >
              <label
                htmlFor="api-key-name"
                className="mb-2 block font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim"
              >
                {t('createDialog.name')}
              </label>
              <input
                id="api-key-name"
                autoFocus
                placeholder={t('createDialog.namePlaceholder')}
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="w-full rounded-[9px] border border-ink/10 bg-ink/[0.03] px-3.5 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-[rgba(124,92,255,0.5)]"
              />
              <p className="mt-2 text-[12.5px] text-fg-dim">{t('createDialog.nameHint')}</p>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="inline-flex h-[38px] items-center rounded-[10px] border border-ink/[0.12] bg-ink/[0.04] px-4 text-sm font-medium text-fg-muted transition-colors hover:bg-ink/[0.08] hover:text-fg"
                >
                  {common('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createToken.isPending}
                  className={gradientButtonClass}
                >
                  {createToken.isPending && <Spinner size="sm" className="text-white" />}
                  {t('createDialog.submit')}
                </button>
              </div>
            </form>

            <DialogPrimitive.Close
              aria-label={common('close')}
              className="absolute right-4 top-4 flex h-[30px] w-[30px] items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg"
            >
              <X className="h-[15px] w-[15px]" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Revoke confirmation dialog (styled — replaces window.confirm) */}
      <DialogPrimitive.Root open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-ink/10 bg-surface-card p-6 text-fg shadow-[0_24px_60px_rgba(0,0,0,0.55)] duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(var(--danger-soft)/0.3)] bg-[rgb(var(--danger-soft)/0.12)] text-danger-soft">
              <Trash2 className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <DialogPrimitive.Title className="text-[17px] font-semibold tracking-[-0.015em]">
              {t('revokeDialog.title')}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1.5 text-[13.5px] leading-relaxed text-fg-muted">
              {revokeTarget ? t('revokeDialog.body', { name: revokeTarget.name }) : ''}
            </DialogPrimitive.Description>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRevokeTarget(null)}
                className="inline-flex h-[38px] items-center rounded-[10px] border border-ink/[0.12] bg-ink/[0.04] px-4 text-sm font-medium text-fg-muted transition-colors hover:bg-ink/[0.08] hover:text-fg"
              >
                {common('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmRevoke}
                disabled={deleteToken.isPending}
                className="inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-[rgb(var(--danger-soft))] px-[18px] text-sm font-semibold text-white shadow-[0_6px_20px_rgb(var(--danger-soft)/0.35)] transition-all hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60"
              >
                {deleteToken.isPending && <Spinner size="sm" className="text-white" />}
                {t('card.revoke')}
              </button>
            </div>

            <DialogPrimitive.Close
              aria-label={common('close')}
              className="absolute right-4 top-4 flex h-[30px] w-[30px] items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg"
            >
              <X className="h-[15px] w-[15px]" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}
