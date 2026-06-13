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
  Activity,
  Package,
} from 'lucide-react'
import { parseCSV, jsonToCsv, type ParseCsvResult } from '@/lib/csv'

type Language = 'curl' | 'javascript' | 'python' | 'go'
type BodyMode = 'json' | 'keyvalue' | 'csv'
type CsvInputMode = 'inline' | 'upload'
type GenerationMode = 'sync' | 'async'
type KeyValuePair = { key: string; value: string }

const API_URL = 'https://apis.mkpdfs.com'
const MAX_CSV_ROWS = 50

const languages: { id: Language; label: string }[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'Node' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
]

const defaultJsonData = '{\n  "name": "John Doe",\n  "date": "2025-01-01"\n}'

// ============================================
// Shared dark style fragments
// ============================================

const cardCls =
  'rounded-[14px] border border-ink/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))] px-[22px] py-5'

const fieldCls =
  'w-full rounded-[9px] border border-ink/10 bg-ink/[0.03] px-3 py-2.5 text-sm text-fg transition-colors placeholder:text-fg-faint focus:border-[#8C6CFF]/60 focus:outline-none'

const selectCls = `${fieldCls} [&>option]:bg-surface-card [&>option]:text-fg`

const monoFieldCls =
  'w-full rounded-[9px] border border-ink/10 bg-ink/[0.03] px-3 py-2.5 font-geist-mono text-[12.5px] leading-[1.7] text-brand-strong transition-colors placeholder:text-fg-faint focus:border-[#8C6CFF]/60 focus:outline-none'

const btnPrimaryCls =
  'inline-flex items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-5 py-[10px] text-sm font-semibold text-white shadow-[0_6px_20px_rgba(124,92,255,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(124,92,255,0.5)] disabled:pointer-events-none disabled:opacity-40'

const btnSecondaryCls =
  'inline-flex items-center justify-center gap-2 rounded-[10px] border border-ink/10 bg-ink/[0.05] px-4 py-[10px] text-sm font-medium text-fg-muted transition-colors hover:bg-ink/[0.08] hover:text-fg disabled:pointer-events-none disabled:opacity-40'

const pillActiveCls = 'bg-[#8C6CFF]/[0.18] text-brand-strong'
const pillIdleCls = 'bg-transparent text-fg-dim hover:text-fg-muted'
const pillBaseCls =
  'flex items-center gap-1.5 rounded-[7px] px-3 py-[5px] font-geist-mono text-[12.5px] transition-all'

const sectionLabelCls =
  'mb-3 font-geist-mono text-[11.5px] uppercase tracking-[0.1em] text-fg-dim'

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

function CopyButton({
  code,
  label,
  copiedLabel,
}: {
  code: string
  label: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-auto flex h-[30px] items-center gap-[7px] rounded-lg border border-ink/10 bg-ink/[0.05] px-3 text-[12.5px] font-medium text-fg-muted transition-colors hover:text-fg"
    >
      {copied ? (
        <>
          <Check className="h-[13px] w-[13px] text-ok" strokeWidth={2.2} />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="h-[13px] w-[13px]" strokeWidth={2} />
          {label}
        </>
      )}
    </button>
  )
}

function TabbedCodeBlock({
  code,
  selectedLang,
  onSelectLang,
  copyLabel,
  copiedLabel,
}: {
  code: string
  selectedLang: Language
  onSelectLang: (lang: Language) => void
  copyLabel: string
  copiedLabel: string
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-ink/10 bg-[linear-gradient(180deg,rgb(var(--surface-card)),rgb(var(--surface-raised)))]">
      <div className="flex flex-wrap items-center gap-1 border-b border-ink/[0.07] px-3.5 py-[11px]">
        {languages.map((lang) => (
          <button
            key={lang.id}
            type="button"
            onClick={() => onSelectLang(lang.id)}
            className={`rounded-[7px] px-3 py-[5px] font-geist-mono text-[12.5px] transition-all active:scale-95 ${
              selectedLang === lang.id ? pillActiveCls : pillIdleCls
            }`}
          >
            {lang.label}
          </button>
        ))}
        <CopyButton code={code} label={copyLabel} copiedLabel={copiedLabel} />
      </div>
      <pre className="m-0 min-h-[230px] overflow-x-auto px-[22px] py-5 font-geist-mono text-[13px] leading-[1.7] text-brand-strong">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function LabeledCodeBlock({
  code,
  label,
  copyLabel,
  copiedLabel,
}: {
  code: string
  label: string
  copyLabel: string
  copiedLabel: string
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-ink/10 bg-[linear-gradient(180deg,rgb(var(--surface-card)),rgb(var(--surface-raised)))]">
      <div className="flex items-center border-b border-ink/[0.07] px-3.5 py-[9px]">
        <span className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-faint">
          {label}
        </span>
        <CopyButton code={code} label={copyLabel} copiedLabel={copiedLabel} />
      </div>
      <pre className="m-0 overflow-x-auto px-[22px] py-4 font-geist-mono text-[12.5px] leading-[1.7] text-brand-strong">
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
      className={`flex items-center gap-2.5 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
    >
      <span
        className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] font-geist-mono text-xs font-semibold transition-colors ${
          isCompleted
            ? 'border-ok/50 bg-ok/[0.15] text-ok'
            : isCurrent
              ? 'border-[#8C6CFF]/60 bg-[#8C6CFF]/[0.15] text-brand-text'
              : 'border-ink/15 text-fg-faint'
        }`}
      >
        {isCompleted ? <Check className="h-[13px] w-[13px]" strokeWidth={2.6} /> : step}
      </span>
      <span
        className={`text-sm font-medium ${isCurrent ? 'text-fg' : 'text-fg-dim'}`}
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
      <DialogContent className="border-ink/10 bg-surface-card font-geist text-fg sm:rounded-[14px]">
        <DialogHeader>
          <DialogTitle className="tracking-[-0.015em] text-fg">
            {t('createDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-[13.5px] text-fg-muted">
            {t('createDialog.description')}
          </DialogDescription>
        </DialogHeader>

        {!newToken ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('createDialog.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldCls}
            />
            <DialogFooter className="gap-2">
              <button className={btnSecondaryCls} onClick={() => onOpenChange(false)}>
                {common('cancel')}
              </button>
              <button
                className={btnPrimaryCls}
                onClick={handleCreate}
                disabled={createToken.isPending}
              >
                {createToken.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2.2} />
                )}
                {t('createDialog.submit')}
              </button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[10px] border border-warn/30 bg-warn/[0.08] p-4">
              <p className="mb-2 text-sm font-medium text-warn">{t('warning')}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-[9px] border border-ink/10 bg-surface p-2.5 font-geist-mono text-[12.5px] text-brand-strong">
                  {showToken ? newToken : '••••••••••••••••••••••••'}
                </code>
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-ink/[0.06] hover:text-fg"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(newToken)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-ink/[0.06] hover:text-fg"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <DialogFooter>
              <button className={btnPrimaryCls} onClick={handleClose}>
                <Check className="h-4 w-4" strokeWidth={2.2} />
                Done
              </button>
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
        // Also update CSV data
        const csvContent = jsonToCsv(parsed)
        setCsvText(csvContent)
        setParsedCsvData(parseCSV(csvContent))
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

  // Body mode handlers
  const handleModeChange = (newMode: BodyMode) => {
    if (newMode === 'keyvalue' && bodyMode === 'json') {
      setKeyValuePairs(jsonToKeyValuePairs(jsonData))
    } else if (newMode === 'json' && bodyMode === 'keyvalue') {
      setJsonData(keyValuePairsToJson(keyValuePairs))
    }
    // When switching to CSV mode, convert current JSON data to CSV
    if (newMode === 'csv' && bodyMode !== 'csv') {
      try {
        const parsed = JSON.parse(jsonData)
        const csvContent = jsonToCsv(parsed)
        setCsvText(csvContent)
        setParsedCsvData(parseCSV(csvContent))
      } catch {
        // If JSON is invalid, just parse current CSV text
        setParsedCsvData(parseCSV(csvText))
      }
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
      <div className="mb-7">
        <h1 className="mb-1.5 text-[26px] font-bold tracking-[-0.025em]">{t('header.title')}</h1>
        <p className="text-[14.5px] text-fg-muted">{t('header.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Step Indicators */}
          <div className="flex flex-wrap items-center gap-4 border-b border-ink/[0.08] pb-4">
            {steps.map((s, index) => (
              <div key={s.step} className="flex items-center gap-2.5">
                <StepIndicator
                  step={s.step}
                  currentStep={currentStep}
                  title={s.title}
                  onClick={() => currentStep >= s.step && setCurrentStep(s.step)}
                />
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-fg-faint" />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Configuration */}
          {currentStep === 1 && (
            <div className={cardCls}>
              <div className="mb-5 flex items-center gap-2.5">
                <FileText className="h-[17px] w-[17px] text-brand-text" strokeWidth={1.9} />
                <span className="text-[15px] font-semibold">{t('steps.configuration')}</span>
              </div>
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Template Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-fg">
                      {t('selectTemplate')}
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">{t('selectTemplatePlaceholder')}</option>
                      {templates?.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    {templates?.length === 0 && (
                      <p className="text-xs text-fg-dim">
                        {t('noTemplates')}{' '}
                        <Link href="/templates" className="text-brand-text hover:underline">
                          {t('createOne')}
                        </Link>
                      </p>
                    )}
                  </div>

                  {/* Token Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-fg">
                      {t('selectToken')}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className={`flex-1 ${selectCls}`}
                      >
                        <option value="">{t('selectTokenPlaceholder')}</option>
                        {tokens?.map((token) => (
                          <option key={token.tokenId} value={token.tokenId}>
                            {token.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowCreateKeyModal(true)}
                        title={t('createApiKey')}
                        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[9px] border border-ink/10 bg-ink/[0.05] text-fg-muted transition-colors hover:bg-ink/[0.08] hover:text-fg"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.2} />
                      </button>
                    </div>
                    {tokens?.length === 0 && (
                      <p className="text-xs text-fg-dim">{t('noTokens')}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    className={btnPrimaryCls}
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStep1Valid}
                  >
                    {t('next')}
                    <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Request Body */}
          {currentStep === 2 && (
            <div className={cardCls}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Braces className="h-[17px] w-[17px] text-brand-text" strokeWidth={1.9} />
                  <span className="text-[15px] font-semibold">{t('body.title')}</span>
                </div>
                <div className="flex gap-1 rounded-[10px] border border-ink/10 bg-ink/[0.03] p-1">
                  <button
                    onClick={() => handleModeChange('json')}
                    className={`${pillBaseCls} ${bodyMode === 'json' ? pillActiveCls : pillIdleCls}`}
                  >
                    <Braces className="h-3.5 w-3.5" />
                    JSON
                  </button>
                  <button
                    onClick={() => handleModeChange('keyvalue')}
                    className={`${pillBaseCls} ${bodyMode === 'keyvalue' ? pillActiveCls : pillIdleCls}`}
                  >
                    <List className="h-3.5 w-3.5" />
                    {t('body.keyValue')}
                  </button>
                  <button
                    onClick={() => handleModeChange('csv')}
                    className={`${pillBaseCls} ${bodyMode === 'csv' ? pillActiveCls : pillIdleCls}`}
                  >
                    <Table className="h-3.5 w-3.5" />
                    CSV
                  </button>
                </div>
              </div>
              <p className="mb-5 text-[13.5px] text-fg-muted">{t('body.description')}</p>
              <div className="space-y-6">
                {bodyMode === 'json' && (
                  <textarea
                    value={jsonData}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    rows={12}
                    className={monoFieldCls}
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
                          className={`w-1/3 ${monoFieldCls}`}
                        />
                        <input
                          type="text"
                          value={pair.value}
                          onChange={(e) => handleKeyValueChange(index, 'value', e.target.value)}
                          placeholder={t('body.valuePlaceholder')}
                          className={`flex-1 ${monoFieldCls}`}
                        />
                        <button
                          onClick={() => removeKeyValuePair(index)}
                          disabled={keyValuePairs.length <= 1}
                          className="rounded-lg p-2 text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addKeyValuePair}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-[#8C6CFF]/[0.12]"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.2} />
                      {t('body.addField')}
                    </button>
                  </div>
                )}

                {bodyMode === 'csv' && (
                  <div className="space-y-4">
                    {/* CSV Input Mode Toggle */}
                    <div className="flex gap-1 self-start rounded-[10px] border border-ink/10 bg-ink/[0.03] p-1">
                      <button
                        onClick={() => setCsvInputMode('inline')}
                        className={`${pillBaseCls} ${csvInputMode === 'inline' ? pillActiveCls : pillIdleCls}`}
                      >
                        <Braces className="h-3.5 w-3.5" />
                        {t('body.csvPasteType')}
                      </button>
                      <button
                        onClick={() => setCsvInputMode('upload')}
                        className={`${pillBaseCls} ${csvInputMode === 'upload' ? pillActiveCls : pillIdleCls}`}
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
                        className={monoFieldCls}
                        placeholder={t('body.csvPlaceholder')}
                      />
                    )}

                    {/* File Upload */}
                    {csvInputMode === 'upload' && (
                      <div className="space-y-3">
                        {!csvFile ? (
                          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-ink/15 p-8 transition-colors hover:border-[#8C6CFF]/50 hover:bg-ink/[0.02]">
                            <Upload className="mb-2 h-8 w-8 text-fg-dim" strokeWidth={1.7} />
                            <span className="text-sm font-medium text-fg">
                              {t('body.csvDropzone')}
                            </span>
                            <span className="mt-1 font-geist-mono text-xs text-fg-faint">.csv</span>
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
                          <div className="flex items-center justify-between rounded-[12px] border border-ink/[0.09] bg-ink/[0.03] p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-brand-text" strokeWidth={1.7} />
                              <div>
                                <p className="font-medium text-fg">{csvFile.name}</p>
                                <p className="font-geist-mono text-xs text-fg-dim">
                                  {parsedCsvData ? `${parsedCsvData.data.length} rows` : 'Parsing...'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleCsvFileRemove}
                              className="rounded-lg p-2 text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CSV Preview */}
                    {parsedCsvData && parsedCsvData.data.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-fg">{t('body.csvPreview')}</h4>
                          <span className="font-geist-mono text-[12.5px] text-fg-dim">
                            {t('body.csvRowCount', { count: parsedCsvData.data.length })}
                          </span>
                        </div>
                        <div className="max-h-48 overflow-auto rounded-[10px] border border-ink/[0.09]">
                          <table className="w-full text-[13px]">
                            <thead className="sticky top-0 bg-surface-card">
                              <tr>
                                {parsedCsvData.headers.map((header) => (
                                  <th
                                    key={header}
                                    className="border-b border-ink/[0.08] px-3 py-2 text-left font-geist-mono text-[11px] font-medium uppercase tracking-[0.08em] text-fg-dim"
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {parsedCsvData.data.slice(0, 5).map((row, i) => (
                                <tr key={i} className="border-b border-ink/[0.06] last:border-0">
                                  {parsedCsvData.headers.map((header) => (
                                    <td key={header} className="px-3 py-2 text-fg-muted">
                                      {String(row[header] ?? '')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              {parsedCsvData.data.length > 5 && (
                                <tr>
                                  <td
                                    colSpan={parsedCsvData.headers.length}
                                    className="px-3 py-2 text-center text-fg-dim"
                                  >
                                    ... {parsedCsvData.data.length - 5} more rows
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {isCsvOverLimit && (
                          <div className="flex items-start gap-2 rounded-[10px] border border-danger/30 bg-danger/[0.08] p-3">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
                            <div>
                              <p className="text-sm font-medium text-danger">{t('body.csvTooManyRows')}</p>
                              <p className="mt-1 text-xs text-danger/80">
                                {t('body.csvMaxRows', { count: MAX_CSV_ROWS, current: csvRowCount })}
                              </p>
                            </div>
                          </div>
                        )}
                        {parsedCsvData.errors.length > 0 && (
                          <div className="rounded-[10px] border border-danger/30 bg-danger/[0.08] p-3">
                            <p className="text-sm font-medium text-danger">{t('body.csvInvalid')}</p>
                            <ul className="mt-1 text-xs text-danger/80">
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
                  <button className={btnSecondaryCls} onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                    {t('back')}
                  </button>
                  <button
                    className={btnPrimaryCls}
                    onClick={() => setCurrentStep(3)}
                    disabled={!isStep2Valid}
                  >
                    {t('next')}
                    <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Generation Method */}
          {currentStep === 3 && (
            <div className={cardCls}>
              <div className="mb-2 flex items-center gap-2.5">
                <Zap className="h-[17px] w-[17px] text-brand-text" strokeWidth={1.9} />
                <span className="text-[15px] font-semibold">{t('steps.method')}</span>
              </div>
              <p className="mb-5 text-[13.5px] text-fg-muted">{t('method.description')}</p>
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Sync Option */}
                  <button
                    onClick={() => setGenerationMode('sync')}
                    className={`rounded-[12px] border p-4 text-left transition-colors ${
                      generationMode === 'sync'
                        ? 'border-[#8C6CFF]/60 bg-[#8C6CFF]/[0.08]'
                        : 'border-ink/[0.09] hover:border-[#8C6CFF]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-[17px] w-[17px] text-ok" strokeWidth={1.9} />
                      <span className="text-[15px] font-semibold text-fg">{t('sync.title')}</span>
                    </div>
                    <p className="mt-2 text-[13.5px] leading-[1.6] text-fg-muted">{t('sync.description')}</p>
                    <div className="mt-3 flex items-center gap-2 font-geist-mono text-[11.5px] text-warn">
                      <AlertCircle className="h-3 w-3" />
                      {t('sync.timeout')}
                    </div>
                  </button>

                  {/* Async Option */}
                  <button
                    onClick={() => setGenerationMode('async')}
                    className={`rounded-[12px] border p-4 text-left transition-colors ${
                      generationMode === 'async'
                        ? 'border-[#8C6CFF]/60 bg-[#8C6CFF]/[0.08]'
                        : 'border-ink/[0.09] hover:border-[#8C6CFF]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-[17px] w-[17px] text-brand-text" strokeWidth={1.9} />
                      <span className="text-[15px] font-semibold text-fg">{t('async.title')}</span>
                    </div>
                    <p className="mt-2 text-[13.5px] leading-[1.6] text-fg-muted">{t('async.description')}</p>
                    <div className="mt-3 flex items-center gap-2 font-geist-mono text-[11.5px] text-brand-text">
                      <Webhook className="h-3 w-3" />
                      {t('async.webhookSupport')}
                    </div>
                  </button>
                </div>

                {/* Webhook URL (only for async) */}
                {generationMode === 'async' && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-fg">
                      <Webhook className="h-4 w-4 text-brand-text" strokeWidth={1.9} />
                      {t('async.webhookUrl')}
                      <span className="font-normal text-fg-dim">({t('optional')})</span>
                    </label>
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-server.com/webhook"
                      className={monoFieldCls}
                    />
                    <p className="text-xs text-fg-dim">{t('async.webhookDescription')}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button className={btnSecondaryCls} onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                    {t('back')}
                  </button>
                  <button className={btnPrimaryCls} onClick={() => setCurrentStep(4)}>
                    {t('next')}
                    <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Test */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className={cardCls}>
                <div className="mb-2 flex items-center gap-2.5">
                  <Play className="h-[17px] w-[17px] text-brand-text" strokeWidth={1.9} />
                  <span className="text-[15px] font-semibold">{t('steps.test')}</span>
                </div>
                <p className="mb-5 text-[13.5px] text-fg-muted">{t('test.description')}</p>
                <div className="space-y-4">
                  {/* Test button */}
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={handleTestApi}
                      disabled={isTestLoading}
                      className={`flex-shrink-0 ${btnPrimaryCls}`}
                    >
                      {isTestLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" strokeWidth={2.2} />
                      )}
                      {t('test.tryIt')}
                    </button>
                    <p className="text-[13px] text-fg-dim">{t('test.note')}</p>
                  </div>

                  {/* Test Result */}
                  {testResult && (
                    <div
                      className={`rounded-[12px] border p-4 ${
                        testResult.type === 'success'
                          ? 'border-ok/30 bg-ok/[0.08]'
                          : 'border-danger/30 bg-danger/[0.08]'
                      }`}
                    >
                      {testResult.type === 'success' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-ok">
                            <CheckCircle2 className="h-5 w-5" strokeWidth={1.9} />
                            <span className="font-medium">
                              {testResult.pdfUrl ? t('test.success') : t('test.asyncStarted')}
                            </span>
                          </div>

                          {/* Sync result: PDF download */}
                          {testResult.pdfUrl && (
                            <div className="flex flex-wrap items-center gap-3">
                              <a
                                href={testResult.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-[10px] border border-ok/50 bg-ok/[0.18] px-3.5 py-2 text-sm font-semibold text-ok transition-colors hover:bg-ok/[0.28]"
                              >
                                <Download className="h-4 w-4" strokeWidth={2} />
                                {t('test.downloadPdf')}
                              </a>
                              <a
                                href={testResult.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-ok/90 hover:underline"
                              >
                                {t('test.openInNewTab')}
                              </a>
                            </div>
                          )}

                          {/* Async result: Job ID */}
                          {testResult.jobId && (
                            <div className="space-y-3">
                              <p className="text-sm text-ok">
                                Job ID:{' '}
                                <code className="rounded-[5px] bg-ink/[0.06] px-1.5 py-0.5 font-geist-mono text-[12.5px] text-brand-strong">
                                  {testResult.jobId}
                                </code>
                              </p>
                              <p className="text-sm text-fg-muted">{t('test.jobQueued')}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-danger">
                          <XCircle className="h-5 w-5" strokeWidth={1.9} />
                          <span>{testResult.message}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raw API Response */}
                  {rawResponse && (
                    <div className="space-y-2">
                      <h4 className="font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-fg-dim">
                        {t('test.rawResponse')}
                      </h4>
                      <pre className="max-h-48 overflow-auto rounded-[10px] border border-ink/[0.08] bg-surface p-4 font-geist-mono text-xs leading-[1.7] text-brand-strong">
                        {rawResponse}
                      </pre>
                    </div>
                  )}

                  {/* Job Status Checker (for async) */}
                  {activeJobId && (
                    <div className="rounded-[12px] border border-[#8C6CFF]/40 bg-[#8C6CFF]/[0.06] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-fg">{t('test.jobStatus')}</h4>
                          <p className="text-[13px] text-fg-muted">{t('test.checkStatusHint')}</p>
                        </div>
                        <button
                          className={btnSecondaryCls}
                          onClick={() => refetchJobStatus()}
                          disabled={jobStatusLoading}
                        >
                          {jobStatusLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" strokeWidth={2} />
                          )}
                          {t('test.checkIfCompleted')}
                        </button>
                      </div>
                      {jobStatus && (
                        <div className="mt-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-fg-dim">{t('test.status')}:</span>
                            <span
                              className={`rounded-[5px] px-2 py-0.5 font-geist-mono text-[11px] font-medium ${
                                jobStatus.status === 'completed'
                                  ? 'bg-ok/[0.15] text-ok'
                                  : jobStatus.status === 'failed'
                                    ? 'bg-danger/[0.15] text-danger'
                                    : 'bg-[#8C6CFF]/[0.15] text-brand-text'
                              }`}
                            >
                              {jobStatus.status}
                            </span>
                          </div>
                          {jobStatus.status === 'completed' && jobStatus.pdfUrl && (
                            <div className="flex flex-wrap items-center gap-3">
                              <a
                                href={jobStatus.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={btnPrimaryCls}
                              >
                                <Download className="h-4 w-4" strokeWidth={2} />
                                {t('test.downloadPdf')}
                              </a>
                              <a
                                href={jobStatus.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-brand-text hover:underline"
                              >
                                {t('test.openInNewTab')}
                              </a>
                            </div>
                          )}
                          {jobStatus.status === 'failed' && jobStatus.error && (
                            <p className="text-sm text-danger">{jobStatus.error}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Code Snippets — tabbed terminal block */}
              <div>
                <div className={sectionLabelCls}>
                  {generationMode === 'sync'
                    ? t('codeSnippets.syncGeneration')
                    : t('codeSnippets.asyncGeneration')}
                </div>
                <TabbedCodeBlock
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
                  selectedLang={selectedLang}
                  onSelectLang={setSelectedLang}
                  copyLabel={common('copy')}
                  copiedLabel={common('copied')}
                />
              </div>

              {/* Async-only: Check Status + Webhook payload */}
              {generationMode === 'async' && (
                <>
                  <LabeledCodeBlock
                    label={t('codeSnippets.checkStatus')}
                    copyLabel={common('copy')}
                    copiedLabel={common('copied')}
                    code={generateCheckStatusSnippet(
                      selectedLang,
                      selectedToken,
                      activeJobId || 'YOUR_JOB_ID'
                    )}
                  />

                  <div>
                    <div className={sectionLabelCls}>{t('codeSnippets.webhookPayload')}</div>
                    <p className="mb-3 text-[13.5px] text-fg-muted">
                      {t('codeSnippets.webhookDescription')}
                    </p>
                    <LabeledCodeBlock
                      label="POST → webhookUrl"
                      copyLabel={common('copy')}
                      copiedLabel={common('copied')}
                      code={generateWebhookPayloadExample()}
                    />
                  </div>
                </>
              )}

              {/* API Reference (Collapsible) */}
              <div className="rounded-[14px] border border-ink/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]">
                <button
                  onClick={() => setShowApiRef(!showApiRef)}
                  className="flex w-full items-center justify-between px-[22px] py-5 text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Code className="h-[17px] w-[17px] text-brand-text" strokeWidth={1.9} />
                    <span className="text-[15px] font-semibold">{t('apiRef.title')}</span>
                  </span>
                  {showApiRef ? (
                    <ChevronUp className="h-[18px] w-[18px] text-fg-dim" />
                  ) : (
                    <ChevronDown className="h-[18px] w-[18px] text-fg-dim" />
                  )}
                </button>
                {showApiRef && (
                  <div className="space-y-6 border-t border-ink/[0.07] px-[22px] pb-6 pt-6">
                    {/* Authentication */}
                    <div>
                      <h4 className="text-sm font-semibold text-fg">{t('apiRef.auth.title')}</h4>
                      <p className="mt-1 text-[13.5px] text-fg-muted">
                        {t('apiRef.auth.description')}
                      </p>
                      <div className="mt-2 rounded-[9px] border border-ink/10 bg-ink/[0.03] px-3 py-2.5">
                        <code className="font-geist-mono text-[12.5px] text-brand-strong">
                          X-Api-Key: your_api_key
                        </code>
                      </div>
                    </div>

                    {/* Sync Endpoint */}
                    <div>
                      <h4 className="text-sm font-semibold text-fg">{t('apiRef.sync.title')}</h4>
                      <div className="mt-2 space-y-3">
                        <div className="rounded-[9px] border border-ink/10 bg-ink/[0.03] px-3 py-2.5 font-geist-mono text-[12.5px] text-brand-strong">
                          <span className="text-ok">POST</span> /pdf/generate
                        </div>
                        <div className="text-sm">
                          <p className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim">
                            {t('apiRef.request')}
                          </p>
                          <pre className="mt-1.5 rounded-[10px] border border-ink/[0.08] bg-surface p-3 font-geist-mono text-xs leading-[1.7] text-brand-strong">
                            {`{
  "templateId": "string (required)",
  "data": "object | array (required)"
}`}
                          </pre>
                        </div>
                        <div className="text-sm">
                          <p className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim">
                            {t('apiRef.response')}
                          </p>
                          <pre className="mt-1.5 rounded-[10px] border border-ink/[0.08] bg-surface p-3 font-geist-mono text-xs leading-[1.7] text-brand-strong">
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
                      <h4 className="text-sm font-semibold text-fg">{t('apiRef.async.title')}</h4>
                      <div className="mt-2 space-y-3">
                        <div className="rounded-[9px] border border-ink/10 bg-ink/[0.03] px-3 py-2.5 font-geist-mono text-[12.5px] text-brand-strong">
                          <span className="text-ok">POST</span> /pdf/generate-async
                        </div>
                        <div className="text-sm">
                          <p className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim">
                            {t('apiRef.request')}
                          </p>
                          <pre className="mt-1.5 rounded-[10px] border border-ink/[0.08] bg-surface p-3 font-geist-mono text-xs leading-[1.7] text-brand-strong">
                            {`{
  "templateId": "string (required)",
  "data": "object | array (required)",
  "webhookUrl": "string (optional)"
}`}
                          </pre>
                        </div>
                        <div className="text-sm">
                          <p className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim">
                            {t('apiRef.response')}
                          </p>
                          <pre className="mt-1.5 rounded-[10px] border border-ink/[0.08] bg-surface p-3 font-geist-mono text-xs leading-[1.7] text-brand-strong">
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
                      <h4 className="text-sm font-semibold text-fg">
                        {t('apiRef.jobStatus.title')}
                      </h4>
                      <div className="mt-2 space-y-3">
                        <div className="rounded-[9px] border border-ink/10 bg-ink/[0.03] px-3 py-2.5 font-geist-mono text-[12.5px] text-brand-strong">
                          <span className="text-ok">GET</span> /jobs/:jobId
                        </div>
                        <div className="text-sm">
                          <p className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim">
                            {t('apiRef.response')}
                          </p>
                          <pre className="mt-1.5 rounded-[10px] border border-ink/[0.08] bg-surface p-3 font-geist-mono text-xs leading-[1.7] text-brand-strong">
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Webhooks + SDKs cards (design) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Webhooks */}
            <div className={cardCls}>
              <div className="mb-2.5 flex items-center gap-2.5">
                <Activity className="h-[17px] w-[17px] text-brand-text" strokeWidth={1.9} />
                <span className="text-[15px] font-semibold">{t('cards.webhooks.title')}</span>
                <span className="ml-auto rounded-[5px] bg-ink/[0.05] px-2 py-0.5 font-geist-mono text-[10.5px] text-fg-dim">
                  {t('cards.webhooks.chip')}
                </span>
              </div>
              <p className="mb-3.5 text-[13.5px] leading-[1.6] text-fg-muted">
                {t('cards.webhooks.body')}
              </p>
              <div className="flex h-9 items-center gap-2 overflow-x-auto whitespace-nowrap rounded-[9px] border border-ink/10 bg-ink/[0.03] px-3 font-geist-mono text-[12.5px] text-fg-faint">
                https://yourapp.com/hooks/mkpdfs
              </div>
            </div>

            {/* Official SDKs */}
            <div className={cardCls}>
              <div className="mb-2.5 flex items-center gap-2.5">
                <Package className="h-[17px] w-[17px] text-brand-text" strokeWidth={1.9} />
                <span className="text-[15px] font-semibold">{t('cards.sdks.title')}</span>
              </div>
              <p className="mb-3.5 text-[13.5px] leading-[1.6] text-fg-muted">
                {t('cards.sdks.body')}
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex h-9 items-center gap-2 rounded-[9px] border border-ink/10 bg-ink/[0.03] px-3 font-geist-mono text-[12.5px] text-brand-strong">
                  <span className="text-ok">$</span> npm install mkpdfs
                </div>
                <div className="flex h-9 items-center gap-2 rounded-[9px] border border-ink/10 bg-ink/[0.03] px-3 font-geist-mono text-[12.5px] text-brand-strong">
                  <span className="text-ok">$</span> pip install mkpdfs
                </div>
              </div>
            </div>
          </div>

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
