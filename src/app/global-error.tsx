'use client'

// Last-resort boundary: catches errors thrown in the root layout itself, which
// is outside any locale/intl provider. It must render its own <html>/<body> and
// cannot rely on globals.css or translations, so styles are inline and copy is
// in English (the default locale).
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalErrorBoundary]', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#08080A',
          color: '#F5F5F8',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ color: '#A8A8B3', maxWidth: '28rem', margin: 0 }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            cursor: 'pointer',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff',
            background: 'linear-gradient(140deg, #8C6CFF, #5B3FE0)',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
