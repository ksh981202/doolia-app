import { catalogToPrintableCategory, PRINTABLE_LOCALE_FIELDS, resolveCatalogSlug } from '@/admin/adminOptions'
import type { ParsedPrintableRow } from '@/admin/parsePrintableSheet'
import { convertToOptimizedWebP } from '@/features/admin/lib/imageOptimization'
import { supabase } from '@/lib/supabase'
import { fetchPrintables } from '@/services/printableService'
import { deleteR2PrintableFiles, uploadR2PrintableFile } from '@/services/r2MediaService'
import { normalizePrintable, type Printable } from '@/types/printable'

export type AdminPrintable = Printable & {
  catalog_slug: string
  published: boolean
  description: string
}

const LOCAL_KEY = 'doolia-admin-printables'

function readLocal(): AdminPrintable[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as AdminPrintable[]) : []
  } catch {
    return []
  }
}

function writeLocal(items: AdminPrintable[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
}

function toAdmin(item: Printable, extra?: Partial<AdminPrintable>): AdminPrintable {
  return {
    ...item,
    catalog_slug: extra?.catalog_slug ?? item.tags.find((tag) => tag.startsWith('cat:'))?.slice(4) ?? '',
    published: extra?.published ?? !item.tags.includes('hidden'),
    description: extra?.description ?? item.description_ko ?? '',
  }
}

function str(value?: string | null) {
  return value?.trim() ?? ''
}

function normalizeAssetType(type?: string | null) {
  const value = str(type).toLowerCase()
  if (!value || value === 'coloring' || value === 'coloring-pages' || value === 'colouring') return 'bw'
  return str(type) || 'bw'
}

function localeFieldsFrom(source: object) {
  const record = source as Record<string, string | undefined | null>
  return Object.fromEntries(PRINTABLE_LOCALE_FIELDS.map((key) => [key, str(record[key])])) as {
    title_ko: string
    title_en: string
    title_ja: string
    title_zh: string
    title_es: string
    title_pt: string
    title_de: string
    title_fr: string
    title_it: string
    title_vi: string
    parent_guide_ko: string
    parent_guide_en: string
    parent_guide_ja: string
    parent_guide_zh: string
    parent_guide_es: string
    parent_guide_pt: string
    parent_guide_de: string
    parent_guide_fr: string
    parent_guide_it: string
    parent_guide_vi: string
    description_ko: string
    description_en: string
    description_ja: string
    description_zh: string
    description_es: string
    description_pt: string
    description_de: string
    description_fr: string
    description_it: string
    description_vi: string
  }
}

function missingColumnName(error: { message?: string } | null | undefined) {
  const message = error?.message ?? ''
  const match =
    message.match(/Could not find the '([^']+)' column/i) ||
    message.match(/column "([^"]+)" of relation/i) ||
    message.match(/column ([a-z_][a-z0-9_]*) does not exist/i)
  return match?.[1]
}

export type PrintableDraft = {
  id?: string
  slug: string
  title_ko: string
  title_en: string
  catalog_slug: string
  age: string
  tags: string
  image_bw_url: string
  image_color_url: string
  pdf_url: string
  published: boolean
  description: string
  type?: string
  title_ja?: string
  title_zh?: string
  title_es?: string
  title_pt?: string
  title_de?: string
  title_fr?: string
  title_it?: string
  title_vi?: string
  category_ko?: string
  category_en?: string
  age_group?: string
  age_group_en?: string
  theme_ko?: string
  theme_en?: string
  benefit_1?: string
  benefit_2?: string
  benefit_3?: string
  parent_guide_ko?: string
  parent_guide_en?: string
  parent_guide_ja?: string
  parent_guide_zh?: string
  parent_guide_es?: string
  parent_guide_pt?: string
  parent_guide_de?: string
  parent_guide_fr?: string
  parent_guide_it?: string
  parent_guide_vi?: string
  description_ko?: string
  description_en?: string
  description_ja?: string
  description_zh?: string
  description_es?: string
  description_pt?: string
  description_de?: string
  description_fr?: string
  description_it?: string
  description_vi?: string
}

export function draftFromParsedRow(
  row: ParsedPrintableRow,
  images?: { bw?: string; color?: string },
): PrintableDraft {
  const publishedRaw = str(row.published).toLowerCase()
  const locales = localeFieldsFrom(row)
  return {
    id: str(row.id) || undefined,
    slug: str(row.slug).replace(/_[bc]$/i, '') || str(row.slug),
    type: normalizeAssetType(row.type),
    ...locales,
    title_ko: locales.title_ko,
    title_en: locales.title_en,
    category_ko: str(row.category_ko),
    category_en: str(row.category_en),
    catalog_slug:
      str(row.catalog_slug) || resolveCatalogSlug(row.category_en, row.category_ko, row.category) || 'coloring-pages',
    age: str(row.age_group) || str(row.age),
    age_group: str(row.age_group) || str(row.age),
    age_group_en: str(row.age_group_en),
    theme_ko: str(row.theme_ko) || str(row.theme),
    theme_en: str(row.theme_en),
    benefit_1: str(row.benefit_1),
    benefit_2: str(row.benefit_2),
    benefit_3: str(row.benefit_3),
    description: locales.description_ko || str(row.description),
    description_ko: locales.description_ko || str(row.description),
    tags: [row.tags, row.theme_ko, row.theme, row.category_ko].filter(Boolean).join(','),
    image_bw_url: images?.bw ?? str(row.image_bw_url) ?? str(row.image_url),
    image_color_url: images?.color ?? images?.bw ?? str(row.image_color_url),
    pdf_url: str(row.pdf_url),
    published: !['false', '0', 'hidden', '숨김'].includes(publishedRaw),
  }
}

function draftToRow(draft: PrintableDraft) {
  const catalogSlug =
    str(draft.catalog_slug) || resolveCatalogSlug(draft.category_en, draft.category_ko) || 'coloring-pages'
  const ageGroup = str(draft.age_group) || str(draft.age)
  const descriptionKo = str(draft.description_ko) || str(draft.description)
  const tags = [
    ...str(draft.tags)
      .split(/[,|#]+/)
      .map((item) => item.trim())
      .filter(Boolean),
    ageGroup ? `${ageGroup}세` : '',
    catalogSlug ? `cat:${catalogSlug}` : '',
    str(draft.theme_ko),
    str(draft.category_ko),
    draft.published ? '' : 'hidden',
  ].filter(Boolean)

  const id = draft.id || crypto.randomUUID()
  const category = catalogToPrintableCategory(catalogSlug)
  const titleKo = str(draft.title_ko)
  const locales = localeFieldsFrom(draft)
  return {
    id,
    slug: str(draft.slug) || id,
    type: normalizeAssetType(draft.type),
    ...locales,
    title: titleKo,
    title_ko: titleKo,
    title_en: locales.title_en || titleKo,
    category,
    catalog_slug: catalogSlug,
    age_group: ageGroup,
    age_group_en: str(draft.age_group_en),
    theme_ko: str(draft.theme_ko),
    theme_en: str(draft.theme_en),
    benefit_1: str(draft.benefit_1),
    benefit_2: str(draft.benefit_2),
    benefit_3: str(draft.benefit_3),
    description: descriptionKo,
    description_ko: descriptionKo,
    tags,
    line_art_url: str(draft.image_bw_url),
    color_image_url: str(draft.image_color_url),
    image_bw_url: str(draft.image_bw_url),
    image_color_url: str(draft.image_color_url),
    pdf_url: str(draft.pdf_url),
    published: draft.published,
  }
}

async function upsertPrintableRow(row: Record<string, unknown>) {
  if (!supabase) return
  const payload: Record<string, unknown> = { ...row }
  let lastError: { message?: string } | null = null

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const { error } = await supabase.from('printables').upsert(payload)
    if (!error) return

    const missing = missingColumnName(error)
    if (missing && missing in payload) {
      delete payload[missing]
      lastError = error
      continue
    }

    const bySlug = await supabase.from('printables').upsert(payload, { onConflict: 'slug' })
    if (!bySlug.error) return

    const slugMissing = missingColumnName(bySlug.error)
    if (slugMissing && slugMissing in payload) {
      delete payload[slugMissing]
      lastError = bySlug.error
      continue
    }

    throw bySlug.error
  }

  throw lastError ?? new Error('도안 저장에 실패했습니다.')
}

export async function listAdminPrintables(): Promise<AdminPrintable[]> {
  const local = readLocal()
  try {
    const remote = await fetchPrintables('all', { includeUnpublished: true })
    const mapped = remote.map((item) => toAdmin(item))
    const byId = new Map(mapped.map((item) => [item.id, item]))
    for (const item of local) byId.set(item.id, item)
    return [...byId.values()].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  } catch {
    return local
  }
}

export async function savePrintable(draft: PrintableDraft) {
  const slug = str(draft.slug).replace(/_[bc]$/i, '') || str(draft.slug)
  const id = str(draft.id) || (await findPrintableIdBySlug(slug)) || crypto.randomUUID()
  const row = draftToRow({ ...draft, id, slug })
  const record: AdminPrintable = {
    ...normalizePrintable({
      ...row,
      created_at: new Date().toISOString(),
    }),
    catalog_slug: row.catalog_slug,
    published: row.published,
    description: row.description,
  }

  if (supabase) {
    await upsertPrintableRow(row)
    await deleteLegacyVariantRows(slug)
  }

  const next = readLocal().filter(
    (item) => item.id !== record.id && item.slug !== slug && item.slug !== `${slug}_b` && item.slug !== `${slug}_c`,
  )
  writeLocal([record, ...next])
  return record
}

async function findPrintableIdBySlug(slug: string) {
  if (!slug) return ''
  const variants = [slug, `${slug}_b`, `${slug}_c`]
  const local = readLocal().find((item) => variants.includes(item.slug))
  if (!supabase) return local?.id ?? ''

  const { data } = await supabase.from('printables').select('id, slug').in('slug', variants)
  const rows = data ?? []
  return (
    rows.find((item) => item.slug === slug)?.id ||
    rows.find((item) => item.slug === `${slug}_b`)?.id ||
    rows.find((item) => item.slug === `${slug}_c`)?.id ||
    local?.id ||
    ''
  )
}

async function deleteLegacyVariantRows(slug: string) {
  if (!slug || !supabase) return
  await supabase.from('printables').delete().in('slug', [`${slug}_b`, `${slug}_c`])
}

export async function setPrintablePublished(id: string, published: boolean) {
  if (supabase) {
    const { error } = await supabase.from('printables').update({ published }).eq('id', id)
    if (error) {
      const current = (await listAdminPrintables()).find((item) => item.id === id)
      if (current) {
        const tags = published
          ? current.tags.filter((tag) => tag !== 'hidden')
          : [...current.tags.filter((tag) => tag !== 'hidden'), 'hidden']
        await supabase.from('printables').update({ tags }).eq('id', id)
      }
    }
  }
  writeLocal(readLocal().map((item) => (item.id === id ? { ...item, published } : item)))
}

async function collectPrintableAssetUrls(id: string) {
  const local = readLocal().find((item) => item.id === id)
  const urls = [
    local?.image_bw_url,
    local?.image_color_url,
    local?.line_art_url,
    local?.color_image_url,
    local?.pdf_url,
  ]
  let remoteExists = false

  if (supabase) {
    const { data } = await supabase
      .from('printables')
      .select('id, image_bw_url, image_color_url, line_art_url, color_image_url, pdf_url')
      .eq('id', id)
      .maybeSingle()
    if (data) {
      remoteExists = true
      urls.push(
        data.image_bw_url,
        data.image_color_url,
        data.line_art_url,
        data.color_image_url,
        data.pdf_url,
      )
    }
  }

  return { remoteExists, urls: [...new Set(urls.map((item) => str(item)).filter(Boolean))] }
}

export async function deletePrintable(id: string) {
  const { remoteExists, urls: assetUrls } = await collectPrintableAssetUrls(id)
  if (assetUrls.length) {
    await deleteR2PrintableFiles(assetUrls)
  }

  if (supabase) {
    const { data, error } = await supabase.from('printables').delete().eq('id', id).select('id')
    if (error) throw new Error(error.message || '도안 삭제에 실패했습니다.')
    if (remoteExists && !data?.length) {
      throw new Error('도안 삭제에 실패했습니다. (권한/RLS를 확인하세요)')
    }
  }
  writeLocal(readLocal().filter((item) => item.id !== id))
}

export async function importPrintableRows(rows: ParsedPrintableRow[]) {
  const saved: AdminPrintable[] = []
  const errors: string[] = []
  for (const [index, row] of rows.entries()) {
    try {
      saved.push(await savePrintable(draftFromParsedRow(row)))
    } catch (error) {
      errors.push(`${index + 1}행: ${error instanceof Error ? error.message : '저장 실패'}`)
    }
  }
  return { saved, errors }
}

export async function uploadAdminFile(bucket: 'printables' | 'parenting-tips', file: File) {
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name)
  const payload = bucket === 'printables' && isImage ? await convertToOptimizedWebP(file) : file

  if (bucket === 'printables' && isImage) {
    try {
      const item = await uploadR2PrintableFile(payload)
      if (item.url) return item.url
    } catch (error) {
      const connected = Boolean(error && typeof error === 'object' && 'connected' in error && error.connected)
      if (connected) throw error
    }
  }

  if (!supabase) {
    return URL.createObjectURL(payload)
  }
  const path = `${Date.now()}-${payload.name.replace(/\s+/g, '-').toLowerCase()}`
  const { error } = await supabase.storage.from(bucket).upload(path, payload, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
