'use client'

import { useState, useEffect } from 'react'

interface TypewriterCodeProps {
  code: string
  typingSpeed?: number
  startDelay?: number
}

export function TypewriterCode({
  code,
  typingSpeed = 30,
  startDelay = 500,
}: TypewriterCodeProps) {
  const [displayedCode, setDisplayedCode] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true)
      setIsTyping(true)
    }, startDelay)

    return () => clearTimeout(startTimer)
  }, [startDelay])

  useEffect(() => {
    if (!hasStarted) return

    if (displayedCode.length < code.length) {
      const timer = setTimeout(() => {
        setDisplayedCode(code.slice(0, displayedCode.length + 1))
      }, typingSpeed)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [displayedCode, code, typingSpeed, hasStarted])

  return (
    <pre className="mt-4 overflow-x-auto text-sm text-gray-300 whitespace-pre min-h-[200px]">
      <code className="block">
        {displayedCode}
        {isTyping && (
          <span className="inline-block w-2 h-4 ml-0.5 bg-gray-300 animate-blink align-middle" />
        )}
        {/* Reserve space for full code to prevent layout shift */}
        <span className="invisible whitespace-pre">{code.slice(displayedCode.length)}</span>
      </code>
    </pre>
  )
}
