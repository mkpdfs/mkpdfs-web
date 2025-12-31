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
