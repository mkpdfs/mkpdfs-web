'use client'

import { useState } from 'react'
import { useTemplates, useTokens } from '@/hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import {
  Code,
  Copy,
  Check,
  Key,
  FileText,
  Zap,
  Clock,
  Webhook,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

type Language = 'curl' | 'javascript' | 'python' | 'go'

const API_URL = 'https://apis.mkpdfs.com'

const languages: { id: Language; label: string }[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
]

function generateSyncSnippet(language: Language, templateId: string, apiKey: string): string {
  const templateIdStr = templateId || 'YOUR_TEMPLATE_ID'
  const apiKeyStr = apiKey || 'YOUR_API_KEY'

  switch (language) {
    case 'curl':
      return `curl -X POST ${API_URL}/pdf/generate \\
  -H "X-Api-Key: ${apiKeyStr}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "${templateIdStr}",
    "data": {
      "name": "John Doe",
      "date": "2024-01-15"
    }
  }'`

    case 'javascript':
      return `const response = await fetch('${API_URL}/pdf/generate', {
  method: 'POST',
  headers: {
    'X-Api-Key': '${apiKeyStr}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    templateId: '${templateIdStr}',
    data: {
      name: 'John Doe',
      date: '2024-01-15',
    },
  }),
});

const { pdfUrl, size, pagesGenerated } = await response.json();
console.log('PDF URL:', pdfUrl);`

    case 'python':
      return `import requests

response = requests.post(
    '${API_URL}/pdf/generate',
    headers={
        'X-Api-Key': '${apiKeyStr}',
        'Content-Type': 'application/json',
    },
    json={
        'templateId': '${templateIdStr}',
        'data': {
            'name': 'John Doe',
            'date': '2024-01-15',
        },
    },
)

result = response.json()
print('PDF URL:', result['pdfUrl'])`

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
        "data": map[string]interface{}{
            "name": "John Doe",
            "date": "2024-01-15",
        },
    }
    body, _ := json.Marshal(payload)

    req, _ := http.NewRequest("POST", "${API_URL}/pdf/generate", bytes.NewBuffer(body))
    req.Header.Set("X-Api-Key", "${apiKeyStr}")
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

function generateAsyncSnippet(language: Language, templateId: string, apiKey: string): string {
  const templateIdStr = templateId || 'YOUR_TEMPLATE_ID'
  const apiKeyStr = apiKey || 'YOUR_API_KEY'

  switch (language) {
    case 'curl':
      return `# Start async job
curl -X POST ${API_URL}/pdf/generate-async \\
  -H "X-Api-Key: ${apiKeyStr}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "${templateIdStr}",
    "data": [...],
    "webhookUrl": "https://your-server.com/webhook"
  }'

# Response: { "jobId": "abc-123", "status": "pending" }

# Poll job status (optional if using webhook)
curl ${API_URL}/jobs/abc-123 \\
  -H "X-Api-Key: ${apiKeyStr}"`

    case 'javascript':
      return `// Start async job
const startResponse = await fetch('${API_URL}/pdf/generate-async', {
  method: 'POST',
  headers: {
    'X-Api-Key': '${apiKeyStr}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    templateId: '${templateIdStr}',
    data: largeDataArray, // Array of objects, each = 1 page
    webhookUrl: 'https://your-server.com/webhook', // Optional
  }),
});

const { jobId, status } = await startResponse.json();
console.log('Job started:', jobId);

// Poll for status (if not using webhook)
const checkStatus = async (jobId) => {
  const response = await fetch(\`${API_URL}/jobs/\${jobId}\`, {
    headers: { 'X-Api-Key': '${apiKeyStr}' },
  });
  return response.json();
};

// Example polling loop
let job = await checkStatus(jobId);
while (job.status === 'pending' || job.status === 'processing') {
  await new Promise(r => setTimeout(r, 2000)); // Wait 2s
  job = await checkStatus(jobId);
}

if (job.status === 'completed') {
  console.log('PDF ready:', job.pdfUrl);
}`

    case 'python':
      return `import requests
import time

# Start async job
start_response = requests.post(
    '${API_URL}/pdf/generate-async',
    headers={
        'X-Api-Key': '${apiKeyStr}',
        'Content-Type': 'application/json',
    },
    json={
        'templateId': '${templateIdStr}',
        'data': large_data_array,  # List of dicts, each = 1 page
        'webhookUrl': 'https://your-server.com/webhook',  # Optional
    },
)

result = start_response.json()
job_id = result['jobId']
print(f'Job started: {job_id}')

# Poll for status (if not using webhook)
def check_status(job_id):
    response = requests.get(
        f'${API_URL}/jobs/{job_id}',
        headers={'X-Api-Key': '${apiKeyStr}'},
    )
    return response.json()

# Example polling loop
job = check_status(job_id)
while job['status'] in ['pending', 'processing']:
    time.sleep(2)  # Wait 2 seconds
    job = check_status(job_id)

if job['status'] == 'completed':
    print('PDF ready:', job['pdfUrl'])`

    case 'go':
      return `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
)

func main() {
    // Start async job
    payload := map[string]interface{}{
        "templateId": "${templateIdStr}",
        "data":       largeDataArray, // []map[string]interface{}, each = 1 page
        "webhookUrl": "https://your-server.com/webhook", // Optional
    }
    body, _ := json.Marshal(payload)

    req, _ := http.NewRequest("POST", "${API_URL}/pdf/generate-async", bytes.NewBuffer(body))
    req.Header.Set("X-Api-Key", "${apiKeyStr}")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    respBody, _ := io.ReadAll(resp.Body)
    resp.Body.Close()

    var result map[string]interface{}
    json.Unmarshal(respBody, &result)
    jobId := result["jobId"].(string)
    fmt.Println("Job started:", jobId)

    // Poll for status (if not using webhook)
    for {
        req, _ := http.NewRequest("GET", "${API_URL}/jobs/"+jobId, nil)
        req.Header.Set("X-Api-Key", "${apiKeyStr}")
        resp, _ := client.Do(req)
        respBody, _ := io.ReadAll(resp.Body)
        resp.Body.Close()

        json.Unmarshal(respBody, &result)
        status := result["status"].(string)

        if status == "completed" {
            fmt.Println("PDF ready:", result["pdfUrl"])
            break
        } else if status == "failed" {
            fmt.Println("Job failed:", result["error"])
            break
        }
        time.Sleep(2 * time.Second)
    }
}`

    default:
      return ''
  }
}

function generateWebhookSnippet(): string {
  return `// Express.js webhook handler example
app.post('/webhook', (req, res) => {
  const { jobId, status, pdfUrl, size, pagesGenerated, error } = req.body;

  if (status === 'completed') {
    console.log('PDF ready:', pdfUrl);
    console.log('Size:', size, 'bytes');
    console.log('Pages:', pagesGenerated);
    // Process the PDF...
  } else if (status === 'failed') {
    console.error('Job failed:', error);
    // Handle error...
  }

  // Always respond with 200 to acknowledge receipt
  res.sendStatus(200);
});`
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-green-400" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy
          </>
        )}
      </button>
      <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function IntegrationPage() {
  const t = useTranslations('integration')
  const common = useTranslations('common')

  const { data: templates, isLoading: templatesLoading } = useTemplates()
  const { data: tokens, isLoading: tokensLoading } = useTokens()

  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedToken, setSelectedToken] = useState('')
  const [syncLang, setSyncLang] = useState<Language>('curl')
  const [asyncLang, setAsyncLang] = useState<Language>('javascript')
  const [showApiRef, setShowApiRef] = useState(false)

  // Get the actual token value if selected
  const selectedTokenValue = tokens?.find((t) => t.tokenId === selectedToken)?.tokenId
    ? selectedToken.startsWith('tk_')
      ? selectedToken
      : 'YOUR_API_KEY'
    : ''

  const isLoading = templatesLoading || tokensLoading

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground-dark">{t('title')}</h1>
        <p className="mt-1 text-sm text-foreground-light">{t('subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Selectors */}
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Template Selector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground-dark">
                    <FileText className="h-4 w-4" />
                    {t('selectTemplate')}
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full rounded-md border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t('selectTemplatePlaceholder')}</option>
                    {templates?.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  {templates?.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t('noTemplates')}{' '}
                      <Link href="/templates" className="text-primary hover:underline">
                        {t('createOne')}
                      </Link>
                    </p>
                  )}
                </div>

                {/* Token Selector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground-dark">
                    <Key className="h-4 w-4" />
                    {t('selectToken')}
                  </label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full rounded-md border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t('selectTokenPlaceholder')}</option>
                    {tokens?.map((token) => (
                      <option key={token.tokenId} value={token.tokenId}>
                        {token.name}
                      </option>
                    ))}
                  </select>
                  {tokens?.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t('noTokens')}{' '}
                      <Link href="/api-keys" className="text-primary hover:underline">
                        {t('createOne')}
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <h3 className="flex items-center gap-2 font-medium text-foreground-dark">
                <Zap className="h-5 w-5 text-primary" />
                {t('quickStart.title')}
              </h3>
              <ol className="mt-3 space-y-2 text-sm text-foreground-light">
                <li>1. {t('quickStart.step1')}</li>
                <li>2. {t('quickStart.step2')}</li>
                <li>3. {t('quickStart.step3')}</li>
              </ol>
            </CardContent>
          </Card>

          {/* Synchronous Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                {t('sync.title')}
              </CardTitle>
              <p className="text-sm text-foreground-light">{t('sync.description')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 rounded-lg bg-muted p-1">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSyncLang(lang.id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      syncLang === lang.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <CodeBlock code={generateSyncSnippet(syncLang, selectedTemplate, selectedToken)} />
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{t('sync.timeout')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Asynchronous Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                {t('async.title')}
              </CardTitle>
              <p className="text-sm text-foreground-light">{t('async.description')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 rounded-lg bg-muted p-1">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setAsyncLang(lang.id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      asyncLang === lang.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <CodeBlock code={generateAsyncSnippet(asyncLang, selectedTemplate, selectedToken)} />

              {/* Webhook Example */}
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="flex items-center gap-2 font-medium text-foreground-dark">
                  <Webhook className="h-4 w-4" />
                  {t('async.webhookTitle')}
                </h4>
                <p className="text-sm text-foreground-light">{t('async.webhookDescription')}</p>
                <CodeBlock code={generateWebhookSnippet()} language="javascript" />
              </div>
            </CardContent>
          </Card>

          {/* API Reference (Collapsible) */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowApiRef(!showApiRef)}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t('apiRef.title')}
                </span>
                {showApiRef ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            {showApiRef && (
              <CardContent className="space-y-6 border-t border-border pt-6">
                {/* Authentication */}
                <div>
                  <h4 className="font-medium text-foreground-dark">{t('apiRef.auth.title')}</h4>
                  <p className="mt-1 text-sm text-foreground-light">{t('apiRef.auth.description')}</p>
                  <div className="mt-2 rounded-lg bg-muted p-3">
                    <code className="text-sm">X-Api-Key: your_api_key</code>
                  </div>
                </div>

                {/* Sync Endpoint */}
                <div>
                  <h4 className="font-medium text-foreground-dark">{t('apiRef.sync.title')}</h4>
                  <div className="mt-2 space-y-3">
                    <div className="rounded-lg bg-muted p-3">
                      <code className="text-sm font-medium">POST /pdf/generate</code>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground-dark">{t('apiRef.request')}</p>
                      <pre className="mt-1 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">
{`{
  "templateId": "string (required)",
  "data": "object | array (required)",
}`}
                      </pre>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground-dark">{t('apiRef.response')}</p>
                      <pre className="mt-1 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">
{`{
  "success": true,
  "pdfUrl": "https://...",
  "expiresIn": "5 days",
  "size": 25000,
  "pagesGenerated": 1
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Async Endpoint */}
                <div>
                  <h4 className="font-medium text-foreground-dark">{t('apiRef.async.title')}</h4>
                  <div className="mt-2 space-y-3">
                    <div className="rounded-lg bg-muted p-3">
                      <code className="text-sm font-medium">POST /pdf/generate-async</code>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground-dark">{t('apiRef.request')}</p>
                      <pre className="mt-1 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">
{`{
  "templateId": "string (required)",
  "data": "object | array (required)",
  "webhookUrl": "string (optional)"
}`}
                      </pre>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground-dark">{t('apiRef.response')}</p>
                      <pre className="mt-1 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">
{`{
  "success": true,
  "jobId": "abc-123-def",
  "status": "pending"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Job Status Endpoint */}
                <div>
                  <h4 className="font-medium text-foreground-dark">{t('apiRef.jobStatus.title')}</h4>
                  <div className="mt-2 space-y-3">
                    <div className="rounded-lg bg-muted p-3">
                      <code className="text-sm font-medium">GET /jobs/:jobId</code>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground-dark">{t('apiRef.response')}</p>
                      <pre className="mt-1 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">
{`{
  "jobId": "abc-123-def",
  "status": "pending | processing | completed | failed",
  "pdfUrl": "https://... (when completed)",
  "size": 25000,
  "pagesGenerated": 50,
  "error": "string (when failed)",
  "createdAt": "2024-01-15T10:00:00Z",
  "completedAt": "2024-01-15T10:01:00Z"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Webhook Payload */}
                <div>
                  <h4 className="font-medium text-foreground-dark">{t('apiRef.webhook.title')}</h4>
                  <p className="mt-1 text-sm text-foreground-light">{t('apiRef.webhook.description')}</p>
                  <pre className="mt-2 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">
{`{
  "jobId": "abc-123-def",
  "status": "completed | failed",
  "pdfUrl": "https://...",
  "size": 25000,
  "pagesGenerated": 50,
  "error": "string (when failed)"
}`}
                  </pre>
                </div>

                {/* Batch Generation */}
                <div>
                  <h4 className="font-medium text-foreground-dark">{t('apiRef.batch.title')}</h4>
                  <p className="mt-1 text-sm text-foreground-light">{t('apiRef.batch.description')}</p>
                  <pre className="mt-2 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">
{`// Each object in the array = 1 page
{
  "templateId": "invoice-template",
  "data": [
    { "invoiceNumber": "001", "amount": 100 },
    { "invoiceNumber": "002", "amount": 200 },
    { "invoiceNumber": "003", "amount": 300 }
  ]
}
// Result: 3-page PDF (max 50 per request)`}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
