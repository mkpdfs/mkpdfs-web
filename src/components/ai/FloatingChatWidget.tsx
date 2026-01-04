'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, X, Minimize2, Maximize2, Paperclip, Send, Code2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
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
          'flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg',
          'hover:bg-primary/90 transition-colors',
          className
        )}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="font-medium">{t('chat.open')}</span>
        {messages.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
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
        'flex flex-col w-[380px] max-h-[500px] rounded-lg border border-border bg-background shadow-xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-semibold">{t('chat.title')}</span>
        </div>
        <div className="flex items-center gap-1">
          {showCodeEditorToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCodeEditor}
              className="h-8 w-8 p-0"
              title={t('chat.toggleCode')}
            >
              <Code2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('chat.welcome')}</p>
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
                  'max-w-[85%] rounded-lg px-3 py-2',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{t('chat.thinking')}</span>
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
              className="h-16 w-16 object-cover rounded border border-border"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 w-9 p-0 shrink-0"
            disabled={isGenerating}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            rows={1}
            disabled={isGenerating}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={(!inputValue.trim() && !selectedImage) || isGenerating}
            className="h-9 w-9 p-0 shrink-0"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
