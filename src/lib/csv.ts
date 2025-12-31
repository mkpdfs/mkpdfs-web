import Papa from 'papaparse'

export interface ParseCsvResult {
  data: Record<string, unknown>[]
  errors: string[]
  headers: string[]
}

/**
 * Parse CSV content into an array of objects
 * Headers become keys, each row becomes an object
 */
export function parseCSV(content: string): ParseCsvResult {
  const result = Papa.parse(content, {
    header: true,           // First row = column names
    skipEmptyLines: true,   // Ignore blank rows
    dynamicTyping: true,    // Auto-convert numbers/booleans
    transformHeader: (header) => header.trim(), // Trim whitespace from headers
  })

  const errors: string[] = []

  if (result.errors.length > 0) {
    result.errors.forEach((error) => {
      errors.push(`Row ${error.row}: ${error.message}`)
    })
  }

  // Get headers from meta
  const headers = result.meta.fields || []

  return {
    data: result.data as Record<string, unknown>[],
    errors,
    headers,
  }
}

/**
 * Validate if the CSV has at least one data row
 */
export function isValidCsv(content: string): boolean {
  const lines = content.trim().split('\n')
  return lines.length >= 2 // At least header + 1 data row
}

/**
 * Convert a JSON object or array to CSV string
 */
export function jsonToCsv(data: Record<string, unknown> | Record<string, unknown>[]): string {
  const dataArray = Array.isArray(data) ? data : [data]
  if (dataArray.length === 0) return ''

  // Get all unique keys from all objects
  const headers = Array.from(
    new Set(dataArray.flatMap(obj => Object.keys(obj)))
  )

  // Build CSV rows
  const headerRow = headers.join(',')
  const dataRows = dataArray.map(obj =>
    headers.map(header => {
      const value = obj[header]
      if (value === null || value === undefined) return ''
      const strValue = String(value)
      // Escape values containing commas, quotes, or newlines
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`
      }
      return strValue
    }).join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}
