'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui'
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
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <span>🔍</span>
            {t('imageAnalysisTitle') || 'We detected the following from your image:'}
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>
              <strong>{t('documentType') || 'Document Type'}:</strong> {imageAnalysis.documentType}
            </li>
            <li>
              <strong>{t('suggestedLayout') || 'Layout'}:</strong> {imageAnalysis.suggestedLayout}
            </li>
            {imageAnalysis.detectedFields.length > 0 && (
              <li>
                <strong>{t('detectedFields') || 'Fields'}:</strong>{' '}
                {imageAnalysis.detectedFields.join(', ')}
              </li>
            )}
          </ul>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
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
              <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <span>{config.icon}</span>
                {config.label}
              </h3>

              {categoryQuestions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {question.helperText && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {question.helperText}
                    </p>
                  )}

                  {/* Single Choice (Radio) */}
                  {question.type === 'single_choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) =>
                              handleSingleChoiceChange(question.id, e.target.value)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
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
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
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
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
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
                            ? 'bg-blue-600'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            answers[question.id] === true ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="flex-1">
          {t('back') || 'Back'}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="flex-1"
        >
          {isSubmitting
            ? t('generating') || 'Generating...'
            : t('generateTemplate') || 'Generate Template'}
        </Button>
      </div>
    </div>
  )
}
