'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Copy, Check, Code } from 'lucide-react'

type Language = 'curl' | 'javascript' | 'python' | 'go'

interface CodeSnippetsProps {
  templateId: string
  jsonData: string
}

const API_URL = 'https://apis.mkpdfs.com/pdf/generate'

function generateSnippet(language: Language, templateId: string, jsonData: string): string {
  const dataStr = jsonData.trim() || '{}'
  const templateIdStr = templateId || 'YOUR_TEMPLATE_ID'

  switch (language) {
    case 'curl':
      return `curl -X POST ${API_URL} \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "${templateIdStr}",
    "data": ${dataStr}
  }'`

    case 'javascript':
      return `const response = await fetch('${API_URL}', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    templateId: '${templateIdStr}',
    data: ${dataStr},
  }),
});

const { pdfUrl } = await response.json();
console.log('PDF URL:', pdfUrl);`

    case 'python':
      return `import requests

response = requests.post(
    '${API_URL}',
    headers={
        'X-Api-Key': 'YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'templateId': '${templateIdStr}',
        'data': ${dataStr},
    },
)

pdf_url = response.json()['pdfUrl']
print('PDF URL:', pdf_url)`

    case 'go':
      return `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func main() {
    payload := map[string]interface{}{
        "templateId": "${templateIdStr}",
        "data":       ${dataStr},
    }
    body, _ := json.Marshal(payload)

    req, _ := http.NewRequest("POST", "${API_URL}", bytes.NewBuffer(body))
    req.Header.Set("X-Api-Key", "YOUR_API_KEY")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    respBody, _ := io.ReadAll(resp.Body)
    fmt.Println(string(respBody))
}`

    default:
      return ''
  }
}

const languages: { id: Language; label: string }[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
]

export function CodeSnippets({ templateId, jsonData }: CodeSnippetsProps) {
  const [selectedLang, setSelectedLang] = useState<Language>('curl')
  const [copied, setCopied] = useState(false)

  const snippet = generateSnippet(selectedLang, templateId, jsonData)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Code className="h-5 w-5" />
            API Integration
          </CardTitle>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Language Tabs */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedLang === lang.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Code Block */}
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
            <code>{snippet}</code>
          </pre>
        </div>

        <p className="text-xs text-muted-foreground">
          Replace <code className="rounded bg-muted px-1 py-0.5">YOUR_API_KEY</code> with your API key from the{' '}
          <a href="/en/api-keys" className="text-primary hover:underline">
            API Keys
          </a>{' '}
          page.
        </p>
      </CardContent>
    </Card>
  )
}
