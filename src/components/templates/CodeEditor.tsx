'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { html } from '@codemirror/lang-html'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { Code, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type EditorMode = 'template' | 'data'

interface CodeEditorProps {
  templateValue: string
  dataValue: string
  onTemplateChange: (value: string) => void
  onDataChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function CodeEditor({
  templateValue,
  dataValue,
  onTemplateChange,
  onDataChange,
  disabled = false,
  className,
}: CodeEditorProps) {
  const t = useTranslations('ai')
  const [activeTab, setActiveTab] = useState<EditorMode>('template')
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  // Debounced change handler
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = useCallback((value: string, mode: EditorMode) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      if (mode === 'template') {
        onTemplateChange(value)
      } else {
        onDataChange(value)
      }
    }, 300)
  }, [onTemplateChange, onDataChange])

  // Create/recreate editor when tab changes
  useEffect(() => {
    if (!editorRef.current) return

    // Destroy existing editor
    if (viewRef.current) {
      viewRef.current.destroy()
    }

    const isTemplate = activeTab === 'template'
    const value = isTemplate ? templateValue : dataValue

    const extensions = [
      basicSetup,
      oneDark,
      isTemplate ? html() : json(),
      EditorView.editable.of(!disabled),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          handleChange(update.state.doc.toString(), activeTab)
        }
      }),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '13px',
        },
        '.cm-scroller': {
          overflow: 'auto',
        },
        '.cm-content': {
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        },
      }),
    ]

    const state = EditorState.create({
      doc: value,
      extensions,
    })

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    })

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [activeTab, disabled]) // Don't include values to avoid recreating on every keystroke

  // Update editor content when external values change (e.g., after generation)
  useEffect(() => {
    if (!viewRef.current) return
    const currentDoc = viewRef.current.state.doc.toString()
    const newValue = activeTab === 'template' ? templateValue : dataValue

    if (currentDoc !== newValue) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: newValue,
        },
      })
    }
  }, [templateValue, dataValue, activeTab])

  return (
    <div className={cn('flex flex-col rounded-lg border border-border overflow-hidden', className)}>
      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1">
        <button
          onClick={() => setActiveTab('template')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            activeTab === 'template'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Code className="h-4 w-4" />
          {t('codeEditor.templateTab')}
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            activeTab === 'data'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Database className="h-4 w-4" />
          {t('codeEditor.dataTab')}
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className={cn(
          'flex-1 min-h-0 bg-zinc-950',
          disabled && 'opacity-50'
        )}
      />
    </div>
  )
}
