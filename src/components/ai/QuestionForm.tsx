'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import type { StructuredQuestion, QuestionAnswer, ImageAnalysis } from '@/lib/api'

interface QuestionFormProps {
  questions: StructuredQuestion[]
  imageAnalysis?: ImageAnalysis
  onSubmit: (answers: QuestionAnswer[]) => void
  onBack: () => void
  isSubmitting: boolean
}

// Category display names and icons
const categoryConfig: Record<string, { label: string; icon: string }> = {
  fields: { label: 'Fields & Data', icon: '📝' },
  images: { label: 'Images & Logos', icon: '🖼️' },
  tables: { label: 'Tables & Lists', icon: '📊' },
  layout: { label: 'Layout & Format', icon: '📐' },
}

export function QuestionForm({
  questions,
  imageAnalysis,
  onSubmit,
  onBack,
  isSubmitting,
}: QuestionFormProps) {
  const t = useTranslations('ai')

  // Initialize answers with default values
  const [answers, setAnswers] = useState<Record<string, string | string[] | boolean>>(() => {
    const defaults: Record<string, string | string[] | boolean> = {}
    questions.forEach((q) => {
      if (q.defaultValue !== undefined) {
        defaults[q.id] = q.defaultValue
      } else if (q.type === 'boolean') {
        defaults[q.id] = false
      } else if (q.type === 'multiple_choice') {
        defaults[q.id] = []
      } else {
        defaults[q.id] = ''
      }
    })
    return defaults
  })

  // Group questions by category
  const groupedQuestions = questions.reduce(
    (acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = []
      }
      acc[q.category].push(q)
      return acc
    },
    {} as Record<string, StructuredQuestion[]>
  )

  const handleSingleChoiceChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }, [])

  const handleMultipleChoiceChange = useCallback(
    (questionId: string, option: string, checked: boolean) => {
      setAnswers((prev) => {
        const current = (prev[questionId] as string[]) || []
        if (checked) {
          return { ...prev, [questionId]: [...current, option] }
        } else {
          return { ...prev, [questionId]: current.filter((o) => o !== option) }
        }
      })
    },
    []
  )

  const handleBooleanChange = useCallback((questionId: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }, [])

  const handleTextChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }, [])

  const handleSubmit = () => {
    const formattedAnswers: QuestionAnswer[] = Object.entries(answers).map(
      ([questionId, value]) => ({
        questionId,
        value,
      })
    )
    onSubmit(formattedAnswers)
  }

  // Check if all required questions are answered
  const isValid = questions.every((q) => {
    if (!q.required) return true
    const answer = answers[q.id]
    if (q.type === 'multiple_choice') {
      return Array.isArray(answer) && answer.length > 0
    }
    if (q.type === 'boolean') {
      return true // boolean always has a value
    }
    return answer !== undefined && answer !== ''
  })

  return (
    <div className="flex flex-col h-full">
      {/* Image Analysis Summary */}
      {imageAnalysis && (
        <div className="mb-6 rounded-[14px] border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.08] p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-strong">
            <span>🔍</span>
            {t('imageAnalysisTitle') || 'We detected the following from your image:'}
          </h3>
          <ul className="space-y-1 text-sm text-fg-muted">
            <li>
              <strong className="font-semibold text-brand-text">{t('documentType') || 'Document Type'}:</strong> {imageAnalysis.documentType}
            </li>
            <li>
              <strong className="font-semibold text-brand-text">{t('suggestedLayout') || 'Layout'}:</strong> {imageAnalysis.suggestedLayout}
            </li>
            {imageAnalysis.detectedFields.length > 0 && (
              <li>
                <strong className="font-semibold text-brand-text">{t('detectedFields') || 'Fields'}:</strong>{' '}
                {imageAnalysis.detectedFields.join(', ')}
              </li>
            )}
          </ul>
          <p className="mt-2 text-xs text-fg-dim">
            {t('imageAnalysisHint') ||
              'Please confirm or adjust your preferences below based on your needs.'}
          </p>
        </div>
      )}

      {/* Questions by Category */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => {
          const config = categoryConfig[category] || { label: category, icon: '❓' }
          return (
            <div key={category} className="space-y-4">
              <h3 className="flex items-center gap-2 border-b border-ink/[0.07] pb-2 font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-fg-muted">
                <span>{config.icon}</span>
                {config.label}
              </h3>

              {categoryQuestions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <label className="block text-sm font-medium text-fg">
                    {question.question}
                    {question.required && <span className="ml-1 text-danger">*</span>}
                  </label>

                  {question.helperText && (
                    <p className="text-xs text-fg-dim">
                      {question.helperText}
                    </p>
                  )}

                  {/* Single Choice (Radio) */}
                  {question.type === 'single_choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-3 rounded-[9px] p-2 transition-colors hover:bg-ink/[0.04]"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) =>
                              handleSingleChoiceChange(question.id, e.target.value)
                            }
                            className="h-4 w-4 accent-[#8C6CFF]"
                          />
                          <span className="text-sm text-fg-muted">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Multiple Choice (Checkbox) */}
                  {question.type === 'multiple_choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-3 rounded-[9px] p-2 transition-colors hover:bg-ink/[0.04]"
                        >
                          <input
                            type="checkbox"
                            value={option}
                            checked={
                              Array.isArray(answers[question.id]) &&
                              (answers[question.id] as string[]).includes(option)
                            }
                            onChange={(e) =>
                              handleMultipleChoiceChange(question.id, option, e.target.checked)
                            }
                            className="h-4 w-4 rounded accent-[#8C6CFF]"
                          />
                          <span className="text-sm text-fg-muted">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Boolean (Switch) */}
                  {question.type === 'boolean' && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={answers[question.id] === true}
                        onClick={() =>
                          handleBooleanChange(question.id, answers[question.id] !== true)
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          answers[question.id] === true
                            ? 'bg-[#8C6CFF]'
                            : 'bg-ink/[0.12]'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            answers[question.id] === true ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-fg-muted">
                        {answers[question.id] === true
                          ? t('yes') || 'Yes'
                          : t('no') || 'No'}
                      </span>
                    </label>
                  )}

                  {/* Text Input */}
                  {question.type === 'text' && (
                    <input
                      type="text"
                      value={(answers[question.id] as string) || ''}
                      onChange={(e) => handleTextChange(question.id, e.target.value)}
                      className="w-full rounded-[9px] border border-ink/[0.09] bg-ink/[0.04] px-3 py-2 text-sm text-fg placeholder:text-fg-faint transition-colors focus:border-[#8C6CFF]/50 focus:outline-none"
                      placeholder={t('enterYourAnswer') || 'Enter your answer...'}
                    />
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3 border-t border-ink/[0.07] pt-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="h-10 flex-1 rounded-[10px] border border-ink/[0.12] bg-ink/[0.04] text-sm font-semibold text-fg transition-colors hover:bg-ink/[0.08] disabled:opacity-50"
        >
          {t('back') || 'Back'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="h-10 flex-1 rounded-[10px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] text-sm font-semibold text-white shadow-[0_6px_18px_rgba(124,92,255,0.4)] transition-all hover:-translate-y-px disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
        >
          {isSubmitting
            ? t('generating') || 'Generating...'
            : t('generateTemplate') || 'Generate Template'}
        </button>
      </div>
    </div>
  )
}
