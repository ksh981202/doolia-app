import {
  PRINTABLE_TSV_COLUMNS,
  isPrintableTsvColumn,
  resolveCatalogSlug,
  resolveTsvColumn,
  type PrintableTsvColumn,
} from '@/admin/adminOptions'

export type ParsedPrintableRow = Record<PrintableTsvColumn, string> & {
  id: string
  catalog_slug: string
  category: string
  image_bw_url: string
  image_color_url: string
  filename: string
  published: string
  pdf_url: string
  tags: string
  theme: string
  age: string
  description: string
}

const EXTRA_HEADERS = [
  'id',
  'catalog_slug',
  'category',
  'image_bw_url',
  'image_color_url',
  'filename',
  'published',
  'pdf_url',
  'tags',
  'theme',
  'age',
  'description',
] as const

type ExtraHeader = (typeof EXTRA_HEADERS)[number]
const EXTRA_HEADER_SET = new Set<string>(EXTRA_HEADERS)

function emptyRow(): ParsedPrintableRow {
  return {
    ...Object.fromEntries(PRINTABLE_TSV_COLUMNS.map((key) => [key, ''])),
    id: '',
    catalog_slug: '',
    category: '',
    image_bw_url: '',
    image_color_url: '',
    filename: '',
    published: '',
    pdf_url: '',
    tags: '',
    theme: '',
    age: '',
    description: '',
  } as ParsedPrintableRow
}

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

function hydrateMatchingFields(row: ParsedPrintableRow) {
  const imageName = row.image_url || row.image_bw_url || row.filename
  row.image_url = row.image_url || imageName
  row.image_bw_url = row.image_bw_url || imageName
  row.filename = row.filename || imageName
  row.catalog_slug = row.catalog_slug || resolveCatalogSlug(row.category_en, row.category_ko, row.category)
  row.category = row.category || row.category_en || row.catalog_slug || row.category_ko
  row.theme = row.theme || row.theme_ko
  row.age = row.age || row.age_group
  row.description = row.description || row.description_ko
  row.type = row.type.trim() || 'bw'
  row.description_ko = row.description_ko || row.description
}

export function parsePrintableSheet(text: string): { rows: ParsedPrintableRow[]; errors: string[] } {
  const source = text.replace(/^\uFEFF/, '').trim()
  if (!source) return { rows: [], errors: ['TSV/CSV 내용이 비어 있습니다.'] }

  const lines = source.split(/\r?\n/).filter((line) => line.trim())
  const delimiter = detectDelimiter(lines[0])
  const headerCells = splitLine(lines[0], delimiter).map((cell) => cell.trim().toLowerCase())
  const mapped = headerCells.map((name) => ({
    column: resolveTsvColumn(name),
    extra: EXTRA_HEADER_SET.has(name) ? (name as ExtraHeader) : null,
    official: isPrintableTsvColumn(name),
  }))

  const known = mapped.filter((item) => item.column || item.extra).length
  if (known < 3) {
    return {
      rows: [],
      errors: [`헤더를 읽지 못했습니다. 30개 컬럼 예: ${PRINTABLE_TSV_COLUMNS.join(', ')}`],
    }
  }

  const errors: string[] = []
  const rows: ParsedPrintableRow[] = []

  lines.slice(1).forEach((line, index) => {
    const cells = splitLine(line, delimiter)
    const row = emptyRow()
    mapped.forEach((target, cellIndex) => {
      const value = cells[cellIndex] ?? ''
      if (target.extra) row[target.extra] = value
      if (target.column) {
        if (target.official || !row[target.column]) row[target.column] = value
      }
    })
    hydrateMatchingFields(row)
    if (!row.title_ko && !row.slug) {
      errors.push(`${index + 2}행: title_ko 또는 slug가 필요합니다.`)
      return
    }
    rows.push(row)
  })

  return { rows, errors }
}
