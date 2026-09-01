import type { ParsedPrintableRow } from '@/admin/parsePrintableSheet'

export type BulkMatchStatus = 'matched' | 'missing'
export type BulkImageMode = 'pair' | 'single'

export type BulkMatchRow = {
  index: number
  row: ParsedPrintableRow
  mode: BulkImageMode
  status: BulkMatchStatus
  missing: string[]
  bwFile?: File
  colorFile?: File
  expectedBw: string
  expectedColor: string
  baseSlug: string
}

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i
const VARIANT_STEM = /_[bc]$/i

export function isImageFile(file: File) {
  return IMAGE_EXT.test(file.name) || file.type.startsWith('image/')
}

export function fileKey(name: string) {
  return name.toLowerCase().trim().replace(/\\/g, '/').split('/').pop() ?? ''
}

export function basenameFromCell(value: string) {
  const raw = value.trim()
  if (!raw) return ''
  try {
    return fileKey(decodeURIComponent(raw.split('?')[0] ?? raw))
  } catch {
    return fileKey(raw)
  }
}

function stem(name: string) {
  return fileKey(name).replace(IMAGE_EXT, '')
}

function withDefaultExt(name: string) {
  const key = fileKey(name)
  if (!key) return ''
  return IMAGE_EXT.test(key) ? key : `${key}.jpg`
}

export function basePrintableSlug(value: string) {
  return stem(value).replace(/_[bc]$/i, '')
}

export function variantOf(name: string): 'b' | 'c' | null {
  const value = stem(name)
  if (/_b$/i.test(value)) return 'b'
  if (/_c$/i.test(value)) return 'c'
  return null
}

function explicitImageName(row: ParsedPrintableRow) {
  return (
    basenameFromCell(row.image_url) ||
    basenameFromCell(row.image_bw_url) ||
    basenameFromCell(row.filename ?? '')
  )
}

function isVariantStem(name: string) {
  return VARIANT_STEM.test(stem(name))
}

export function isExplicitVariantRow(row: ParsedPrintableRow) {
  return isVariantStem(explicitImageName(row)) || isVariantStem(row.slug)
}

function rowVariant(row: ParsedPrintableRow): 'b' | 'c' | null {
  return variantOf(explicitImageName(row)) || variantOf(row.slug) || typeVariant(row.type)
}

function typeVariant(type: string): 'b' | 'c' | null {
  const value = type.trim().toLowerCase()
  if (value === 'bw' || value === 'line' || value === 'b') return 'b'
  if (value === 'color' || value === 'colour' || value === 'c') return 'c'
  return null
}

export function groupKeyForRow(row: ParsedPrintableRow) {
  return basePrintableSlug(explicitImageName(row) || row.slug) || fileKey(row.slug)
}

function pickMetaRow(rows: ParsedPrintableRow[]) {
  return (
    rows.find((row) => rowVariant(row) === 'b') ||
    rows.find((row) => typeVariant(row.type) === 'b') ||
    rows[0]
  )
}

export function indexImageFiles(files: File[]) {
  const byName = new Map<string, File>()
  for (const file of files) {
    if (!isImageFile(file)) continue
    const key = fileKey(file.name.toLowerCase().trim())
    if (key) byName.set(key, file)
  }
  return byName
}

export function findImageFile(byName: Map<string, File>, wanted: string) {
  const key = fileKey(wanted.toLowerCase().trim())
  if (!key) return undefined
  const exact = byName.get(key)
  if (exact) return exact

  const wantedStem = stem(key)
  if (!IMAGE_EXT.test(key)) {
    for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
      const hit = byName.get(`${wantedStem}${ext}`.toLowerCase().trim())
      if (hit) return hit
    }
  }

  for (const [name, file] of byName) {
    if (stem(name.toLowerCase().trim()) === wantedStem) return file
  }
  return undefined
}

function fileMatchesVariant(file: File | undefined, baseSlug: string, variant: 'b' | 'c'): file is File {
  if (!file) return false
  const base = fileKey(baseSlug)
  if (!base || base.startsWith('__row-')) return false
  const fileStem = stem(file.name)
  const expected = `${base}_${variant}`
  return fileStem === expected && basePrintableSlug(file.name) === base
}

function acceptVariantFile(file: File | undefined, baseSlug: string, variant: 'b' | 'c') {
  return fileMatchesVariant(file, baseSlug, variant) ? file : undefined
}

function pairFilesShareGroupSlug(bwFile: File | undefined, colorFile: File | undefined, baseSlug: string) {
  if (!bwFile || !colorFile) return true
  const base = fileKey(baseSlug)
  const bwBase = basePrintableSlug(bwFile.name)
  const colorBase = basePrintableSlug(colorFile.name)
  return Boolean(base) && bwBase === base && colorBase === base && bwBase === colorBase
}

function findVariantFile(
  byName: Map<string, File>,
  groupedRows: ParsedPrintableRow[],
  baseSlug: string,
  variant: 'b' | 'c',
) {
  for (const row of groupedRows) {
    if (rowVariant(row) !== variant) continue
    const named = explicitImageName(row)
    const hit = named ? findImageFile(byName, named) : undefined
    if (acceptVariantFile(hit, baseSlug, variant)) return hit
  }
  return acceptVariantFile(findImageFile(byName, `${baseSlug}_${variant}.jpg`), baseSlug, variant)
}

export function isPairCategory(row: ParsedPrintableRow) {
  return Boolean(rowVariant(row)) || isExplicitVariantRow(row)
}

export function expectedImageNames(row: ParsedPrintableRow, mode: BulkImageMode) {
  const base = groupKeyForRow(row)
  if (mode === 'single') {
    return {
      bw: withDefaultExt(explicitImageName(row) || row.slug.trim() || base),
      color: '',
    }
  }
  return {
    bw: `${base}_b.jpg`,
    color: `${base}_c.jpg`,
  }
}

export function matchBulkPrintables(rows: ParsedPrintableRow[], files: File[]): BulkMatchRow[] {
  const byName = indexImageFiles(files)
  const groups = new Map<string, { index: number; rows: ParsedPrintableRow[] }>()

  for (const [index, row] of rows.entries()) {
    const key = groupKeyForRow(row)
    if (!key) {
      const fallback = `__row-${index}`
      groups.set(fallback, { index, rows: [row] })
      continue
    }
    const current = groups.get(key)
    if (current) current.rows.push(row)
    else groups.set(key, { index, rows: [row] })
  }

  return [...groups.entries()].map(([baseSlug, group]) => {
    const meta = pickMetaRow(group.rows)
    const bwFile = findVariantFile(byName, group.rows, baseSlug, 'b')
    const colorFile = findVariantFile(byName, group.rows, baseSlug, 'c')
    const hasB = group.rows.some((row) => rowVariant(row) === 'b')
    const hasC = group.rows.some((row) => rowVariant(row) === 'c')
    const wantsPair = (hasB && hasC) || Boolean(bwFile && colorFile)

    if (wantsPair) {
      const expectedBw = `${baseSlug}_b.jpg`
      const expectedColor = `${baseSlug}_c.jpg`
      const missing: string[] = []
      if (!bwFile) missing.push(expectedBw)
      if (!colorFile) missing.push(expectedColor)
      const slugAligned = pairFilesShareGroupSlug(bwFile, colorFile, baseSlug)
      if (!slugAligned) {
        if (bwFile && basePrintableSlug(bwFile.name) !== fileKey(baseSlug)) missing.push(expectedBw)
        if (colorFile && basePrintableSlug(colorFile.name) !== fileKey(baseSlug)) missing.push(expectedColor)
        if (!missing.length) {
          missing.push(expectedBw)
          missing.push(expectedColor)
        }
      }
      const matched = missing.length === 0 && slugAligned
      return {
        index: group.index,
        row: { ...meta, slug: baseSlug, type: meta.type.trim() || 'bw' },
        mode: 'pair' as const,
        status: matched ? 'matched' : 'missing',
        missing: [...new Set(missing)],
        bwFile: fileMatchesVariant(bwFile, baseSlug, 'b') ? bwFile : undefined,
        colorFile: fileMatchesVariant(colorFile, baseSlug, 'c') ? colorFile : undefined,
        expectedBw,
        expectedColor,
        baseSlug,
      }
    }

    const expectedBw = withDefaultExt(explicitImageName(meta) || meta.slug || baseSlug)
    const found = findImageFile(byName, expectedBw) || bwFile || colorFile
    const singleFile =
      found && basePrintableSlug(found.name) === fileKey(baseSlug || meta.slug) ? found : undefined
    const missing: string[] = []
    if (!expectedBw) missing.push('파일명(slug 또는 image_url)')
    else if (!singleFile) missing.push(expectedBw)

    return {
      index: group.index,
      row: { ...meta, slug: baseSlug || meta.slug },
      mode: 'single' as const,
      status: singleFile && missing.length === 0 ? 'matched' : 'missing',
      missing,
      bwFile: singleFile,
      expectedBw,
      expectedColor: '',
      baseSlug: baseSlug || meta.slug,
    }
  })
}

export function unmatchedImageFiles(matches: BulkMatchRow[], files: File[]) {
  const used = new Set<File>()
  for (const item of matches) {
    if (item.bwFile) used.add(item.bwFile)
    if (item.colorFile) used.add(item.colorFile)
  }
  return files.filter((file) => isImageFile(file) && !used.has(file))
}
