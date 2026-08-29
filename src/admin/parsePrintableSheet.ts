import { PRINTABLE_TSV_COLUMNS, type PrintableTsvColumn } from '@/admin/adminOptions'

export type ParsedPrintableRow = Record<PrintableTsvColumn, string>

function splitLine(line: string, delimiter: string) {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      quoted = !quoted
      continue
    }
    if (!quoted && ch === delimiter) {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current.trim())
  return cells
}

function detectDelimiter(header: string) {
  const tabs = (header.match(/\t/g) ?? []).length
  const commas = (header.match(/,/g) ?? []).length
  return tabs >= commas ? '\t' : ','
}

export function parsePrintableSheet(text: string): { rows: ParsedPrintableRow[]; errors: string[] } {
  const source = text.replace(/^\uFEFF/, '').trim()
  if (!source) return { rows: [], errors: ['붙여넣은 내용이 비어 있습니다.'] }

  const lines = source.split(/\r?\n/).filter((line) => line.trim())
  const delimiter = detectDelimiter(lines[0])
  const headerCells = splitLine(lines[0], delimiter).map((cell) => cell.trim().toLowerCase())
  const mapped = headerCells.map((name) =>
    PRINTABLE_TSV_COLUMNS.includes(name as PrintableTsvColumn) ? (name as PrintableTsvColumn) : null,
  )

  const known = mapped.filter(Boolean).length
  if (known < 3) {
    return {
      rows: [],
      errors: [
        `헤더를 읽지 못했습니다. 18개 컬럼 예: ${PRINTABLE_TSV_COLUMNS.join(', ')}`,
      ],
    }
  }

  const errors: string[] = []
  const rows: ParsedPrintableRow[] = []

  lines.slice(1).forEach((line, index) => {
    const cells = splitLine(line, delimiter)
    const row = Object.fromEntries(PRINTABLE_TSV_COLUMNS.map((key) => [key, ''])) as ParsedPrintableRow
    mapped.forEach((key, cellIndex) => {
      if (key) row[key] = cells[cellIndex] ?? ''
    })
    if (!row.title_ko && !row.slug) {
      errors.push(`${index + 2}행: title_ko 또는 slug가 필요합니다.`)
      return
    }
    rows.push(row)
  })

  return { rows, errors }
}
