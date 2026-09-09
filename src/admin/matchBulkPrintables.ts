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
  const slug = fileKey(row.slug)
  return slug ? basePrintableSlug(slug) : ''
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
  const seen = new Map<string, number>()
  const duplicates: string[] = []
  for (const file of files) {
    if (!isImageFile(file)) continue
    const key = fileKey(file.name)
    if (!key) continue
    const count = (seen.get(key) ?? 0) + 1
    seen.set(key, count)
    if (count === 1) byName.set(key, file)
    else if (count === 2) duplicates.push(key)
  }
  return { byName, duplicates }
}

export function duplicateDroppedImageNames(files: File[]) {
  return indexImageFiles(files).duplicates
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

function findVariantFile(byName: Map<string, File>, baseSlug: string, variant: 'b' | 'c') {
  const base = fileKey(baseSlug)
  if (!base || base.startsWith('__row-')) return undefined
  return acceptVariantFile(findImageFile(byName, `${base}_${variant}.jpg`), base, variant)
}

export function isPairCategory(row: ParsedPrintableRow) {
  return Boolean(rowVariant(row)) || isExplicitVariantRow(row)
}

export function expectedImageNames(row: ParsedPrintableRow, mode: BulkImageMode) {
  const base = groupKeyForRow(row)
  if (mode === 'single') {
    return {
      bw: withDefaultExt(base || fileKey(row.slug)),
      color: '',
    }
  }
  return {
    bw: `${base}_b.jpg`,
    color: `${base}_c.jpg`,
  }
}

export function matchBulkPrintables(rows: ParsedPrintableRow[], files: File[]): BulkMatchRow[] {
  const { byName } = indexImageFiles(files)
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
    const slug = fileKey(baseSlug)
    const bwFile = findVariantFile(byName, slug, 'b')
    const colorFile = findVariantFile(byName, slug, 'c')
    const wantsPair = Boolean(bwFile || colorFile || group.rows.some((row) => rowVariant(row)))

    if (wantsPair) {
      const expectedBw = `${slug}_b.jpg`
      const expectedColor = `${slug}_c.jpg`
      const missing: string[] = []
      if (!bwFile) missing.push(expectedBw)
      if (!colorFile) missing.push(expectedColor)
      const slugAligned = pairFilesShareGroupSlug(bwFile, colorFile, slug)
      if (!slugAligned) {
        if (bwFile && basePrintableSlug(bwFile.name) !== slug) missing.push(expectedBw)
        if (colorFile && basePrintableSlug(colorFile.name) !== slug) missing.push(expectedColor)
        if (!missing.length) {
          missing.push(expectedBw)
          missing.push(expectedColor)
        }
      }
      const matched = missing.length === 0 && slugAligned
      return {
        index: group.index,
        row: { ...meta, slug, type: meta.type.trim() || 'bw' },
        mode: 'pair' as const,
        status: matched ? 'matched' : 'missing',
        missing: [...new Set(missing)],
        bwFile: fileMatchesVariant(bwFile, slug, 'b') ? bwFile : undefined,
        colorFile: fileMatchesVariant(colorFile, slug, 'c') ? colorFile : undefined,
        expectedBw,
        expectedColor,
        baseSlug: slug,
      }
    }

    const expectedBw = withDefaultExt(slug)
    const found = findImageFile(byName, expectedBw)
    const singleFile =
      found && variantOf(found.name) === null && basePrintableSlug(found.name) === slug ? found : undefined
    const missing: string[] = []
    if (!slug) missing.push('slug')
    else if (!singleFile) missing.push(expectedBw)

    return {
      index: group.index,
      row: { ...meta, slug: slug || meta.slug },
      mode: 'single' as const,
      status: singleFile && missing.length === 0 ? 'matched' : 'missing',
      missing,
      bwFile: singleFile,
      expectedBw,
      expectedColor: '',
      baseSlug: slug || meta.slug,
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
