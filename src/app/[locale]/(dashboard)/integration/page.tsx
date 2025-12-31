'use client'

import { useState, useEffect } from 'react'
import {
  useTemplates,
  useTokens,
  useCreateToken,
  useMarketplaceTemplate,
  useGeneratePdf,
  useGeneratePdfAsync,
  useJobStatus,
} from '@/hooks/useApi'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Spinner,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { toast } from '@/hooks/useToast'
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
  Plus,
  Trash2,
  Braces,
  List,
  ChevronRight,
  ChevronLeft,
  Play,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Upload,
  Table,
} from 'lucide-react'
import { parseCSV, type ParseCsvResult } from '@/lib/csv'

type Language = 'curl' | 'javascript' | 'python' | 'go'
type BodyMode = 'json' | 'keyvalue' | 'csv'
type CsvInputMode = 'inline' | 'upload'
type GenerationMode = 'sync' | 'async'
type KeyValuePair = { key: string; value: string }

const API_URL = 'https://apis.mkpdfs.com'
const MAX_CSV_ROWS = 50

const languages: { id: Language; label: string }[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
]

const defaultJsonData = '{\n  "name": "John Doe",\n  "date": "2025-01-01"\n}'

// ============================================
// Helper Functions
// ============================================

function jsonToKeyValuePairs(jsonStr: string): KeyValuePair[] {
  try {
    const obj = JSON.parse(jsonStr)
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      return Object.entries(obj).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      }))
    }
  } catch {
    // Invalid JSON
  }
  return [{ key: '', value: '' }]
}

function keyValuePairsToJson(pairs: KeyValuePair[]): string {
  const obj: Record<string, unknown> = {}
  pairs.forEach(({ key, value }) => {
    if (key.trim()) {
      try {
        obj[key] = JSON.parse(value)
      } catch {
        obj[key] = value
      }
    }
  })
  return JSON.stringify(obj, null, 2)
}

function formatJsObject(obj: unknown, indent: number = 0): string {
  const indentStr = ' '.repeat(indent)
  const innerIndent = ' '.repeat(indent + 2)

  if (obj === null) return 'null'
  if (typeof obj === 'string') return `'${obj}'`
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    const items = obj.map((item) => `${innerIndent}${formatJsObject(item, indent + 2)}`).join(',\n')
    return `[\n${items}\n${indentStr}]`
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj)
    if (entries.length === 0) return '{}'
    const items = entries
      .map(([k, v]) => `${innerIndent}${k}: ${formatJsObject(v, indent + 2)}`)
      .join(',\n')
    return `{\n${items},\n${indentStr}}`
  }
  return String(obj)
}

function formatPythonDict(obj: unknown, indent: number = 0): string {
  const indentStr = ' '.repeat(indent)
  const innerIndent = ' '.repeat(indent + 4)

  if (obj === null) return 'None'
  if (typeof obj === 'string') return `'${obj}'`
  if (typeof obj === 'boolean') return obj ? 'True' : 'False'
  if (typeof obj === 'number') return String(obj)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    const items = obj.map((item) => `${innerIndent}${formatPythonDict(item, indent + 4)}`).join(',\n')
    return `[\n${items}\n${indentStr}]`
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj)
    if (entries.length === 0) return '{}'
    const items = entries
      .map(([k, v]) => `${innerIndent}'${k}': ${formatPythonDict(v, indent + 4)}`)
      .join(',\n')
    return `{\n${items},\n${indentStr}}`
  }
  return String(obj)
}

function formatGoMap(obj: unknown, indent: number = 0): string {
  const indentStr = ' '.repeat(indent)
  const innerIndent = ' '.repeat(indent + 4)

  if (obj === null) return 'nil'
  if (typeof obj === 'string') return `"${obj}"`
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]interface{}{}'
    const items = obj.map((item) => `${innerIndent}${formatGoMap(item, indent + 4)}`).join(',\n')
    return `[]interface{}{\n${items},\n${indentStr}}`
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj)
    if (entries.length === 0) return 'map[string]interface{}{}'
    const items = entries
      .map(([k, v]) => `${innerIndent}"${k}": ${formatGoMap(v, indent + 4)}`)
      .join(',\n')
    return `map[string]interface{}{\n${items},\n${indentStr}}`
  }
  return String(obj)
}

function generateCheckStatusSnippet(language: Language, apiKey: string, jobId: string = 'YOUR_JOB_ID'): string {
  const apiKeyStr = apiKey || 'YOUR_API_KEY'

  switch (language) {
    case 'curl':
      return `curl -X GET ${API_URL}/jobs/${jobId} \\
  -H "X-Api-Key: ${apiKeyStr}"`

    case 'javascript':
      return `const response = await fetch('${API_URL}/jobs/${jobId}', {
  method: 'GET',
  headers: {
    'X-Api-Key': '${apiKeyStr}',
  },
});

const { jobId, status, pdfUrl, error } = await response.json();

if (status === 'completed') {
  console.log('PDF URL:', pdfUrl);
} else if (status === 'failed') {
  console.error('Job failed:', error);
} else {
  console.log('Job status:', status); // pending or processing
}`

    case 'python':
      return `import requests

response = requests.get(
    '${API_URL}/jobs/${jobId}',
    headers={
        'X-Api-Key': '${apiKeyStr}',
    },
)

result = response.json()

if result['status'] == 'completed':
    print('PDF URL:', result['pdfUrl'])
elif result['status'] == 'failed':
    print('Job failed:', result.get('error'))
else:
    print('Job status:', result['status'])  # pending or processing`

    case 'go':
      return `package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func main() {
    req, _ := http.NewRequest("GET", "${API_URL}/jobs/${jobId}", nil)
    req.Header.Set("X-Api-Key", "${apiKeyStr}")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)

    var result map[string]interface{}
    json.Unmarshal(body, &result)

    fmt.Println("Status:", result["status"])
}`

    default:
      return ''
  }
}

function generateWebhookPayloadExample(): string {
  return `{
  "jobId": "abc-123-def-456",
  "status": "completed",
  "pdfUrl": "https://mkpdfs-prod-bucket.s3.amazonaws.com/pdfs/...",
  "size": 25000,
  "pagesGenerated": 1,
  "completedAt": "2025-01-15T10:01:00.000Z"
}`
}

function generateCodeSnippet(
  language: Language,
  templateId: string,
  apiKey: string,
  jsonData: string,
  mode: GenerationMode,
  webhookUrl?: string
): string {
  const templateIdStr = templateId || 'YOUR_TEMPLATE_ID'
  const apiKeyStr = apiKey || 'YOUR_API_KEY'
  const endpoint = mode === 'sync' ? '/pdf/generate' : '/pdf/generate-async'

  let dataObj: unknown
  try {
    dataObj = JSON.parse(jsonData)
  } catch {
    dataObj = { name: 'John Doe', date: '2025-01-01' }
  }

  const payload: Record<string, unknown> = {
    templateId: templateIdStr,
    data: dataObj,
  }
  if (mode === 'async' && webhookUrl) {
    payload.webhookUrl = webhookUrl
  }

  switch (language) {
    case 'curl':
      return `curl -X POST ${API_URL}${endpoint} \\
  -H "X-Api-Key: ${apiKeyStr}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2).split('\n').join('\n  ')}'`

    case 'javascript':
      return `const response = await fetch('${API_URL}${endpoint}', {
  method: 'POST',
  headers: {
    'X-Api-Key': '${apiKeyStr}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    templateId: '${templateIdStr}',
    data: ${formatJsObject(dataObj, 4)},${mode === 'async' && webhookUrl ? `\n    webhookUrl: '${webhookUrl}',` : ''}
  }),
});

const result = await response.json();
${mode === 'sync' ? "console.log('PDF URL:', result.pdfUrl);" : "console.log('Job ID:', result.jobId);"}`

    case 'python':
      return `import requests

response = requests.post(
    '${API_URL}${endpoint}',
    headers={
        'X-Api-Key': '${apiKeyStr}',
        'Content-Type': 'application/json',
    },
    json={
        'templateId': '${templateIdStr}',
        'data': ${formatPythonDict(dataObj, 8)},${mode === 'async' && webhookUrl ? `\n        'webhookUrl': '${webhookUrl}',` : ''}
    },
)

result = response.json()
${mode === 'sync' ? "print('PDF URL:', result['pdfUrl'])" : "print('Job ID:', result['jobId'])"}`

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
        "data": ${formatGoMap(dataObj, 8)},${mode === 'async' && webhookUrl ? `\n        "webhookUrl": "${webhookUrl}",` : ''}
    }
    body, _ := json.Marshal(payload)

    req, _ := http.NewRequest("POST", "${API_URL}${endpoint}", bytes.NewBuffer(body))
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

// ============================================
// Components
// ============================================

function CodeBlock({ code }: { code: string }) {
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

function StepIndicator({
  step,
  currentStep,
  title,
  onClick,
}: {
  step: number
  currentStep: number
  title: string
  onClick: () => void
}) {
  const isCompleted = currentStep > step
  const isCurrent = currentStep === step
  const isClickable = currentStep >= step

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`flex items-center gap-2 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
          isCompleted
            ? 'bg-green-500 text-white'
            : isCurrent
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground'
        }`}
      >
        {isCompleted ? <Check className="h-4 w-4" /> : step}
      </div>
      <span
        className={`text-sm font-medium ${isCurrent ? 'text-foreground-dark' : 'text-muted-foreground'}`}
      >
        {title}
      </span>
    </button>
  )
}

function CreateApiKeyModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (tokenId: string) => void
}) {
  const t = useTranslations('apiKeys')
  const common = useTranslations('common')
  const errors = useTranslations('errors')
  const createToken = useCreateToken()

  const [name, setName] = useState('')
  const [newToken, setNewToken] = useState<string | null>(null)
  const [showToken, setShowToken] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: common('error'),
        description: t('createDialog.nameHint'),
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await createToken.mutateAsync({ name: name.trim() })
      setNewToken(result.token)
      toast({
        title: t('createDialog.success'),
        description: t('warning'),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : t('createDialog.error')
      const isLimitError = message.toLowerCase().includes('limit')
      toast({
        title: isLimitError ? errors('limitReached') : common('error'),
        description: message,
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    if (newToken) {
      // Extract tokenId from the token (format: tk_xxx)
      onCreated(newToken)
    }
    setName('')
    setNewToken(null)
    setShowToken(false)
    onOpenChange(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: common('copied') })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
          <DialogDescription>{t('createDialog.description')}</DialogDescription>
        </DialogHeader>

        {!newToken ? (
          <div className="space-y-4">
            <Input
              placeholder={t('createDialog.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {common('cancel')}
              </Button>
              <Button onClick={handleCreate} isLoading={createToken.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                {t('createDialog.submit')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-warning/10 p-4">
              <p className="mb-2 text-sm font-medium text-warning-foreground">{t('warning')}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background p-2 font-mono text-sm">
                  {showToken ? newToken : '••••••••••••••••••••••••'}
                </code>
                <Button variant="ghost" size="icon" onClick={() => setShowToken(!showToken)}>
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(newToken)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>
                <Check className="mr-2 h-4 w-4" />
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Main Page Component
// ============================================

export default function IntegrationPage() {
  const t = useTranslations('integration')
  const common = useTranslations('common')
  const errors = useTranslations('errors')

  const { data: templates, isLoading: templatesLoading } = useTemplates()
  const { data: tokens, isLoading: tokensLoading } = useTokens()

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Configuration
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedToken, setSelectedToken] = useState('')
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false)

  // Step 2: Request Body
  const [bodyMode, setBodyMode] = useState<BodyMode>('json')
  const [jsonData, setJsonData] = useState(defaultJsonData)
  const [keyValuePairs, setKeyValuePairs] = useState<KeyValuePair[]>([
    { key: 'name', value: 'John Doe' },
    { key: 'date', value: '2025-01-01' },
  ])
  // CSV mode state
  const [csvInputMode, setCsvInputMode] = useState<CsvInputMode>('inline')
  const [csvText, setCsvText] = useState('name,date,amount\nJohn Doe,2025-01-01,100\nJane Smith,2025-01-02,200')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [parsedCsvData, setParsedCsvData] = useState<ParseCsvResult | null>(null)

  // Step 3: Generation Method
  const [generationMode, setGenerationMode] = useState<GenerationMode>('sync')
  const [webhookUrl, setWebhookUrl] = useState('')

  // Step 4: Code & Test
  const [selectedLang, setSelectedLang] = useState<Language>('curl')
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'error'
    pdfUrl?: string
    jobId?: string
    message?: string
  } | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [isTestLoading, setIsTestLoading] = useState(false)
  const [rawResponse, setRawResponse] = useState<string | null>(null)

  // Collapsible sections
  const [showCodeSnippets, setShowCodeSnippets] = useState(false)
  const [showApiRef, setShowApiRef] = useState(false)

  // Hooks
  const generatePdf = useGeneratePdf()
  const generatePdfAsync = useGeneratePdfAsync()
  const { data: jobStatus, isLoading: jobStatusLoading, refetch: refetchJobStatus } = useJobStatus(activeJobId)

  // Find selected template to check if it's from marketplace
  const selectedTemplateData = templates?.find((t) => t.id === selectedTemplate)
  const sourceMarketplaceId = selectedTemplateData?.sourceMarketplaceId
  const { data: marketplaceTemplate } = useMarketplaceTemplate(sourceMarketplaceId || '')

  // Load sample data when marketplace template is selected
  useEffect(() => {
    if (marketplaceTemplate?.sampleDataJson) {
      try {
        const parsed = JSON.parse(marketplaceTemplate.sampleDataJson)
        const formatted = JSON.stringify(parsed, null, 2)
        setJsonData(formatted)
        setKeyValuePairs(jsonToKeyValuePairs(formatted))
      } catch {
        // Keep current data
      }
    }
  }, [marketplaceTemplate])

  const isLoading = templatesLoading || tokensLoading

  // Step validation
  const isStep1Valid = selectedTemplate && selectedToken
  const csvRowCount = parsedCsvData?.data.length ?? 0
  const isCsvOverLimit = csvRowCount > MAX_CSV_ROWS
  const isStep2Valid = bodyMode === 'csv'
    ? (parsedCsvData && csvRowCount > 0 && !isCsvOverLimit)
    : jsonData.trim().length > 0
  const isStep3Valid = true // Always valid (sync is default)

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return isStep1Valid
      case 2:
        return isStep2Valid
      case 3:
        return isStep3Valid
      default:
        return true
    }
  }

  // Body mode handlers
  const handleModeChange = (newMode: BodyMode) => {
    if (newMode === 'keyvalue' && bodyMode === 'json') {
      setKeyValuePairs(jsonToKeyValuePairs(jsonData))
    } else if (newMode === 'json' && bodyMode === 'keyvalue') {
      setJsonData(keyValuePairsToJson(keyValuePairs))
    }
    // When switching to CSV mode, parse the initial CSV text
    if (newMode === 'csv' && bodyMode !== 'csv') {
      const result = parseCSV(csvText)
      setParsedCsvData(result)
    }
    setBodyMode(newMode)
  }

  // CSV handlers
  const handleCsvTextChange = (text: string) => {
    setCsvText(text)
    const result = parseCSV(text)
    setParsedCsvData(result)
  }

  const handleCsvFileUpload = (file: File) => {
    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvText(content)
      const result = parseCSV(content)
      setParsedCsvData(result)
    }
    reader.readAsText(file)
  }

  const handleCsvFileRemove = () => {
    setCsvFile(null)
    setCsvText('')
    setParsedCsvData(null)
  }

  const handleKeyValueChange = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = [...keyValuePairs]
    updated[index][field] = newValue
    setKeyValuePairs(updated)
    setJsonData(keyValuePairsToJson(updated))
  }

  const addKeyValuePair = () => {
    setKeyValuePairs([...keyValuePairs, { key: '', value: '' }])
  }

  const removeKeyValuePair = (index: number) => {
    if (keyValuePairs.length > 1) {
      const updated = keyValuePairs.filter((_, i) => i !== index)
      setKeyValuePairs(updated)
      setJsonData(keyValuePairsToJson(updated))
    }
  }

  const handleJsonChange = (newJson: string) => {
    setJsonData(newJson)
    try {
      const pairs = jsonToKeyValuePairs(newJson)
      if (pairs.length > 0 && pairs[0].key !== '') {
        setKeyValuePairs(pairs)
      }
    } catch {
      // Invalid JSON
    }
  }

  // Test API handler
  const handleTestApi = async () => {
    setTestResult(null)
    setActiveJobId(null)
    setRawResponse(null)
    setIsTestLoading(true)

    let parsedData: Record<string, unknown> | Record<string, unknown>[]

    if (bodyMode === 'csv') {
      // Use parsed CSV data (array of objects)
      if (!parsedCsvData || parsedCsvData.data.length === 0) {
        setIsTestLoading(false)
        toast({
          title: t('body.csvInvalid'),
          description: errors('validationError'),
          variant: 'destructive',
        })
        return
      }
      parsedData = parsedCsvData.data
    } else {
      // Use JSON data
      try {
        parsedData = JSON.parse(jsonData)
      } catch {
        setIsTestLoading(false)
        toast({
          title: t('body.invalidJson'),
          description: errors('validationError'),
          variant: 'destructive',
        })
        return
      }
    }

    try {
      if (generationMode === 'sync') {
        const result = await generatePdf.mutateAsync({
          templateId: selectedTemplate,
          data: parsedData,
        })
        setRawResponse(JSON.stringify(result, null, 2))
        if (result.pdfUrl) {
          setTestResult({
            type: 'success',
            pdfUrl: result.pdfUrl,
          })
          toast({ title: t('test.success') })
        }
      } else {
        const result = await generatePdfAsync.mutateAsync({
          templateId: selectedTemplate,
          data: parsedData,
          webhookUrl: webhookUrl || undefined,
        })
        setRawResponse(JSON.stringify(result, null, 2))
        if (result.jobId) {
          setActiveJobId(result.jobId)
          setTestResult({
            type: 'success',
            jobId: result.jobId,
            message: t('test.jobStarted'),
          })
          toast({ title: t('test.asyncStarted') })
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : errors('generic')
      setRawResponse(JSON.stringify({ error: message }, null, 2))
      setTestResult({
        type: 'error',
        message,
      })
      toast({
        title: t('test.error'),
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsTestLoading(false)
    }
  }

  const handleApiKeyCreated = (tokenId: string) => {
    setSelectedToken(tokenId)
  }

  // Step titles for the indicator
  const steps = [
    { step: 1, title: t('steps.configuration') },
    { step: 2, title: t('steps.requestBody') },
    { step: 3, title: t('steps.method') },
    { step: 4, title: t('steps.test') },
  ]

  return (
    <div className="space-y-6">
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
          {/* Step Indicators */}
          <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4">
            {steps.map((s, index) => (
              <div key={s.step} className="flex items-center gap-2">
                <StepIndicator
                  step={s.step}
                  currentStep={currentStep}
                  title={s.title}
                  onClick={() => currentStep >= s.step && setCurrentStep(s.step)}
                />
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Configuration */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('steps.configuration')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Template Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground-dark">
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
                    <label className="text-sm font-medium text-foreground-dark">
                      {t('selectToken')}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="flex-1 rounded-md border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">{t('selectTokenPlaceholder')}</option>
                        {tokens?.map((token) => (
                          <option key={token.tokenId} value={token.tokenId}>
                            {token.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowCreateKeyModal(true)}
                        title={t('createApiKey')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tokens?.length === 0 && (
                      <p className="text-xs text-muted-foreground">{t('noTokens')}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(2)} disabled={!isStep1Valid}>
                    {t('next')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Request Body */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Braces className="h-5 w-5" />
                    {t('body.title')}
                  </CardTitle>
                  <div className="flex gap-1 rounded-lg bg-muted p-1">
                    <button
                      onClick={() => handleModeChange('json')}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        bodyMode === 'json'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Braces className="h-3.5 w-3.5" />
                      JSON
                    </button>
                    <button
                      onClick={() => handleModeChange('keyvalue')}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        bodyMode === 'keyvalue'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                      {t('body.keyValue')}
                    </button>
                    <button
                      onClick={() => handleModeChange('csv')}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        bodyMode === 'csv'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Table className="h-3.5 w-3.5" />
                      CSV
                    </button>
                  </div>
                </div>
                <p className="text-sm text-foreground-light">{t('body.description')}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {bodyMode === 'json' && (
                  <textarea
                    value={jsonData}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    rows={12}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder={t('body.jsonPlaceholder')}
                  />
                )}

                {bodyMode === 'keyvalue' && (
                  <div className="space-y-3">
                    {keyValuePairs.map((pair, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pair.key}
                          onChange={(e) => handleKeyValueChange(index, 'key', e.target.value)}
                          placeholder={t('body.keyPlaceholder')}
                          className="w-1/3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <input
                          type="text"
                          value={pair.value}
                          onChange={(e) => handleKeyValueChange(index, 'value', e.target.value)}
                          placeholder={t('body.valuePlaceholder')}
                          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <button
                          onClick={() => removeKeyValuePair(index)}
                          disabled={keyValuePairs.length <= 1}
                          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addKeyValuePair}
                      className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <Plus className="h-4 w-4" />
                      {t('body.addField')}
                    </button>
                  </div>
                )}

                {bodyMode === 'csv' && (
                  <div className="space-y-4">
                    {/* CSV Input Mode Toggle */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCsvInputMode('inline')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          csvInputMode === 'inline'
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Braces className="h-3.5 w-3.5" />
                        {t('body.csvPasteType')}
                      </button>
                      <button
                        onClick={() => setCsvInputMode('upload')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          csvInputMode === 'upload'
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {t('body.csvUploadFile')}
                      </button>
                    </div>

                    {/* Inline CSV Editor */}
                    {csvInputMode === 'inline' && (
                      <textarea
                        value={csvText}
                        onChange={(e) => handleCsvTextChange(e.target.value)}
                        rows={10}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder={t('body.csvPlaceholder')}
                      />
                    )}

                    {/* File Upload */}
                    {csvInputMode === 'upload' && (
                      <div className="space-y-3">
                        {!csvFile ? (
                          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/50">
                            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground-dark">
                              {t('body.csvDropzone')}
                            </span>
                            <span className="mt-1 text-xs text-muted-foreground">.csv</span>
                            <input
                              type="file"
                              accept=".csv"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleCsvFileUpload(file)
                              }}
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-primary" />
                              <div>
                                <p className="font-medium text-foreground-dark">{csvFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {parsedCsvData ? `${parsedCsvData.data.length} rows` : 'Parsing...'}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleCsvFileRemove}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CSV Preview */}
                    {parsedCsvData && parsedCsvData.data.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-foreground-dark">{t('body.csvPreview')}</h4>
                          <span className="text-sm text-muted-foreground">
                            {t('body.csvRowCount', { count: parsedCsvData.data.length })}
                          </span>
                        </div>
                        <div className="max-h-48 overflow-auto rounded-lg border border-border">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-muted">
                              <tr>
                                {parsedCsvData.headers.map((header) => (
                                  <th key={header} className="border-b border-border px-3 py-2 text-left font-medium">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {parsedCsvData.data.slice(0, 5).map((row, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                  {parsedCsvData.headers.map((header) => (
                                    <td key={header} className="px-3 py-2 text-foreground-light">
                                      {String(row[header] ?? '')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              {parsedCsvData.data.length > 5 && (
                                <tr>
                                  <td colSpan={parsedCsvData.headers.length} className="px-3 py-2 text-center text-muted-foreground">
                                    ... {parsedCsvData.data.length - 5} more rows
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {isCsvOverLimit && (
                          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                            <div>
                              <p className="text-sm font-medium text-destructive">{t('body.csvTooManyRows')}</p>
                              <p className="mt-1 text-xs text-destructive">
                                {t('body.csvMaxRows', { count: MAX_CSV_ROWS, current: csvRowCount })}
                              </p>
                            </div>
                          </div>
                        )}
                        {parsedCsvData.errors.length > 0 && (
                          <div className="rounded-lg bg-destructive/10 p-3">
                            <p className="text-sm font-medium text-destructive">{t('body.csvInvalid')}</p>
                            <ul className="mt-1 text-xs text-destructive">
                              {parsedCsvData.errors.slice(0, 3).map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('back')}
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} disabled={!isStep2Valid}>
                    {t('next')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Generation Method */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t('steps.method')}
                </CardTitle>
                <p className="text-sm text-foreground-light">{t('method.description')}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Sync Option */}
                  <button
                    onClick={() => setGenerationMode('sync')}
                    className={`rounded-lg border-2 p-4 text-left transition-colors ${
                      generationMode === 'sync'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{t('sync.title')}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground-light">{t('sync.description')}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      {t('sync.timeout')}
                    </div>
                  </button>

                  {/* Async Option */}
                  <button
                    onClick={() => setGenerationMode('async')}
                    className={`rounded-lg border-2 p-4 text-left transition-colors ${
                      generationMode === 'async'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">{t('async.title')}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground-light">{t('async.description')}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                      <Webhook className="h-3 w-3" />
                      {t('async.webhookSupport')}
                    </div>
                  </button>
                </div>

                {/* Webhook URL (only for async) */}
                {generationMode === 'async' && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground-dark">
                      <Webhook className="h-4 w-4" />
                      {t('async.webhookUrl')}
                      <span className="text-muted-foreground">({t('optional')})</span>
                    </label>
                    <Input
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-server.com/webhook"
                    />
                    <p className="text-xs text-muted-foreground">{t('async.webhookDescription')}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('back')}
                  </Button>
                  <Button onClick={() => setCurrentStep(4)}>
                    {t('next')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Test */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    {t('steps.test')}
                  </CardTitle>
                  <p className="text-sm text-foreground-light">{t('test.description')}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Test button */}
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleTestApi}
                      disabled={isTestLoading}
                      className="flex-shrink-0"
                    >
                      {isTestLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="mr-2 h-4 w-4" />
                      )}
                      {t('test.tryIt')}
                    </Button>
                    <p className="text-sm text-muted-foreground">{t('test.note')}</p>
                  </div>

                  {/* Test Result */}
                  {testResult && (
                    <div
                      className={`rounded-lg p-4 ${
                        testResult.type === 'success' ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      {testResult.type === 'success' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">
                              {testResult.pdfUrl ? t('test.success') : t('test.asyncStarted')}
                            </span>
                          </div>

                          {/* Sync result: PDF download */}
                          {testResult.pdfUrl && (
                            <div className="flex items-center gap-2">
                              <a
                                href={testResult.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                              >
                                <Download className="h-4 w-4" />
                                {t('test.downloadPdf')}
                              </a>
                              <a
                                href={testResult.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-green-700 hover:underline"
                              >
                                {t('test.openInNewTab')}
                              </a>
                            </div>
                          )}

                          {/* Async result: Job ID */}
                          {testResult.jobId && (
                            <div className="space-y-3">
                              <p className="text-sm text-green-700">
                                Job ID: <code className="rounded bg-green-100 px-1 font-mono">{testResult.jobId}</code>
                              </p>
                              <p className="text-sm text-foreground-light">{t('test.jobQueued')}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-700">
                          <XCircle className="h-5 w-5" />
                          <span>{testResult.message}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raw API Response */}
                  {rawResponse && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground-dark">{t('test.rawResponse')}</h4>
                      <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-4 text-xs font-mono">
                        {rawResponse}
                      </pre>
                    </div>
                  )}

                  {/* Job Status Checker (for async) */}
                  {activeJobId && (
                    <div className="rounded-lg border-2 border-primary/50 bg-primary/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('test.jobStatus')}</h4>
                          <p className="text-sm text-muted-foreground">{t('test.checkStatusHint')}</p>
                        </div>
                        <Button
                          onClick={() => refetchJobStatus()}
                          disabled={jobStatusLoading}
                        >
                          {jobStatusLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          {t('test.checkIfCompleted')}
                        </Button>
                      </div>
                      {jobStatus && (
                        <div className="mt-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{t('test.status')}:</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                jobStatus.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : jobStatus.status === 'failed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {jobStatus.status}
                            </span>
                          </div>
                          {jobStatus.status === 'completed' && jobStatus.pdfUrl && (
                            <div className="flex items-center gap-2">
                              <a
                                href={jobStatus.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
                              >
                                <Download className="h-4 w-4" />
                                {t('test.downloadPdf')}
                              </a>
                              <a
                                href={jobStatus.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                {t('test.openInNewTab')}
                              </a>
                            </div>
                          )}
                          {jobStatus.status === 'failed' && jobStatus.error && (
                            <p className="text-sm text-red-600">{jobStatus.error}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Code Snippets (Collapsible) */}
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => setShowCodeSnippets(!showCodeSnippets)}>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      {t('codeSnippets.title')}
                    </span>
                    {showCodeSnippets ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
                {showCodeSnippets && (
                  <CardContent className="space-y-6 border-t border-border pt-6">
                    {/* Language selector */}
                    <div className="flex flex-wrap gap-2 rounded-lg bg-muted p-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setSelectedLang(lang.id)}
                          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            selectedLang === lang.id
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>

                    {/* Generation Code */}
                    <div>
                      <h4 className="mb-2 font-medium text-foreground-dark">
                        {generationMode === 'sync' ? t('codeSnippets.syncGeneration') : t('codeSnippets.asyncGeneration')}
                      </h4>
                      <CodeBlock
                        code={generateCodeSnippet(
                          selectedLang,
                          selectedTemplate,
                          selectedToken,
                          bodyMode === 'csv' && parsedCsvData
                            ? JSON.stringify(parsedCsvData.data, null, 2)
                            : jsonData,
                          generationMode,
                          webhookUrl
                        )}
                      />
                    </div>

                    {/* Async-only: Check Status Code */}
                    {generationMode === 'async' && (
                      <>
                        <div>
                          <h4 className="mb-2 font-medium text-foreground-dark">{t('codeSnippets.checkStatus')}</h4>
                          <CodeBlock
                            code={generateCheckStatusSnippet(
                              selectedLang,
                              selectedToken,
                              activeJobId || 'YOUR_JOB_ID'
                            )}
                          />
                        </div>

                        <div>
                          <h4 className="mb-2 font-medium text-foreground-dark">{t('codeSnippets.webhookPayload')}</h4>
                          <p className="mb-2 text-sm text-foreground-light">{t('codeSnippets.webhookDescription')}</p>
                          <CodeBlock code={generateWebhookPayloadExample()} />
                        </div>
                      </>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* API Reference (Collapsible) */}
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => setShowApiRef(!showApiRef)}>
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
                      <p className="mt-1 text-sm text-foreground-light">
                        {t('apiRef.auth.description')}
                      </p>
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
  "data": "object | array (required)"
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

                    {/* Job Status */}
                    <div>
                      <h4 className="font-medium text-foreground-dark">
                        {t('apiRef.jobStatus.title')}
                      </h4>
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
                  </CardContent>
                )}
              </Card>
            </div>
          )}

          {/* Create API Key Modal */}
          <CreateApiKeyModal
            open={showCreateKeyModal}
            onOpenChange={setShowCreateKeyModal}
            onCreated={handleApiKeyCreated}
          />
        </>
      )}
    </div>
  )
}
