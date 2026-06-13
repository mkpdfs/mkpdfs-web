'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, X, Minimize2, Paperclip, Send, Code2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  timestamp: Date
  isLoading?: boolean
}

interface FloatingChatWidgetProps {
  messages: ChatMessage[]
  onSendMessage: (message: string, imageBase64?: string, imageMediaType?: string) => void
  onToggleCodeEditor?: () => void
  showCodeEditorToggle?: boolean
  isGenerating?: boolean
  className?: string
}

export function FloatingChatWidget({
  messages,
  onSendMessage,
  onToggleCodeEditor,
  showCodeEditorToggle = false,
  isGenerating = false,
  className,
}: FloatingChatWidgetProps) {
  const t = useTranslations('ai')
  const [isExpanded, setIsExpanded] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mediaType: string; preview: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  const handleSend = useCallback(() => {
    if (!inputValue.trim() && !selectedImage) return

    onSendMessage(
      inputValue.trim(),
      selectedImage?.base64,
      selectedImage?.mediaType
    )
    setInputValue('')
    setSelectedImage(null)
  }, [inputValue, selectedImage, onSendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1]
      setSelectedImage({
        base64,
        mediaType: file.type as 'image/png' | 'image/jpeg' | 'image/webp',
        preview: result,
      })
    }
    reader.readAsDataURL(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const removeImage = useCallback(() => {
    setSelectedImage(null)
  }, [])

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50',
          'flex items-center gap-2 rounded-full bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(124,92,255,0.4)]',
          'transition-all hover:-translate-y-px',
          className
        )}
      >
        <MessageSquare className="h-5 w-5" strokeWidth={1.9} />
        <span className="font-semibold">{t('chat.open')}</span>
        {messages.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-geist-mono text-xs font-bold text-[#5B3FE0]">
            {messages.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'flex flex-col w-[380px] max-h-[500px] rounded-[14px] border border-ink/[0.09] bg-surface-raised shadow-[0_24px_60px_rgba(0,0,0,0.6)]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-[18px] w-[18px] text-brand-text" strokeWidth={1.9} />
          <span className="text-sm font-semibold text-fg">{t('chat.title')}</span>
        </div>
        <div className="flex items-center gap-1">
          {showCodeEditorToggle && (
            <button
              onClick={onToggleCodeEditor}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg"
              title={t('chat.toggleCode')}
            >
              <Code2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-fg-faint" strokeWidth={1.5} />
            <p className="text-sm text-fg-muted">{t('chat.welcome')}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-[11px] px-3 py-2',
                  message.role === 'user'
                    ? 'bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] text-white'
                    : 'border border-ink/[0.07] bg-ink/[0.04] text-fg-muted'
                )}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Uploaded"
                    className="max-w-full h-auto rounded mb-2"
                  />
                )}
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-text" />
                    <span className="font-geist-mono text-[12.5px] text-fg-muted">{t('chat.thinking')}</span>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img
              src={selectedImage.preview}
              alt="Selected"
              className="h-16 w-16 rounded-[9px] border border-ink/[0.09] object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-ink/[0.12] bg-surface-overlay text-fg-muted transition-colors hover:text-fg"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-ink/[0.07] p-3">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg-muted disabled:opacity-50"
            disabled={isGenerating}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            className="flex-1 resize-none rounded-[9px] border border-ink/[0.09] bg-ink/[0.04] px-3 py-2 text-sm text-fg placeholder:text-fg-faint transition-colors focus:border-[#8C6CFF]/50 focus:outline-none disabled:opacity-60"
            rows={1}
            disabled={isGenerating}
          />
          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !selectedImage) || isGenerating}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] text-white shadow-[0_6px_18px_rgba(124,92,255,0.4)] transition-all hover:-translate-y-px disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
