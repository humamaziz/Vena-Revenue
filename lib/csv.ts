// Minimal, dependency-free RFC4180 CSV parser. Handles quoted fields,
// embedded commas/newlines inside quotes, and escaped quotes ("").
// Good enough for the lead-import use case without pulling in a parsing
// library for a few thousand simple rows.

export function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  // Normalize line endings so \r\n inside/outside quotes behaves consistently
  const input = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ',') {
      row.push(field)
      field = ''
      continue
    }

    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }

    field += char
  }

  // Flush trailing field/row (file may or may not end with a newline)
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  // Drop fully-blank trailing rows (common with trailing newlines)
  while (rows.length > 0 && rows[rows.length - 1].every((c) => c.trim() === '')) {
    rows.pop()
  }

  return rows
}

export interface ParsedCsvRow {
  rowNumber: number // 1-based, counting from the first data row (excludes header)
  data: Record<string, string>
}

/**
 * Parses CSV text into header-keyed row objects. Header matching is
 * case-insensitive and ignores surrounding whitespace, so "Company Name",
 * "companyName", and "company_name" all map the same if you pass the
 * right aliases.
 */
export function parseCSVWithHeaders(
  text: string,
  headerAliases: Record<string, string[]>
): { rows: ParsedCsvRow[]; unmappedHeaders: string[] } {
  const allRows = parseCSV(text)
  if (allRows.length === 0) return { rows: [], unmappedHeaders: [] }

  const rawHeaders = allRows[0].map((h) => h.trim())
  const normalized = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, '')

  const headerToField = new Map<number, string>()
  const unmappedHeaders: string[] = []

  rawHeaders.forEach((header, idx) => {
    const norm = normalized(header)
    let matchedField: string | null = null
    for (const [field, aliases] of Object.entries(headerAliases)) {
      if (aliases.some((alias) => normalized(alias) === norm)) {
        matchedField = field
        break
      }
    }
    if (matchedField) headerToField.set(idx, matchedField)
    else if (header) unmappedHeaders.push(header)
  })

  const rows: ParsedCsvRow[] = []
  for (let i = 1; i < allRows.length; i++) {
    const raw = allRows[i]
    if (raw.every((c) => c.trim() === '')) continue // skip blank rows
    const data: Record<string, string> = {}
    headerToField.forEach((field, idx) => {
      data[field] = (raw[idx] ?? '').trim()
    })
    rows.push({ rowNumber: i, data })
  }

  return { rows, unmappedHeaders }
}