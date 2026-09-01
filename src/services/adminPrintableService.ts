import { catalogToPrintableCategory, resolveCatalogSlug } from '@/admin/adminOptions'
import type { ParsedPrintableRow } from '@/admin/parsePrintableSheet'
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
  title_es?: string
  title_de?: string
  title_fr?: string
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
  parent_guide_es?: string
  parent_guide_de?: string
  parent_guide_fr?: string
  description_ko?: string
  description_en?: string
  description_ja?: string
  description_es?: string
  description_de?: string
  description_fr?: string
}

export function draftFromParsedRow(
  row: ParsedPrintableRow,
  images?: { bw?: string; color?: string },
): PrintableDraft {
  const publishedRaw = str(row.published).toLowerCase()
  return {
    id: str(row.id) || undefined,
    slug: str(row.slug).replace(/_[bc]$/i, '') || str(row.slug),
    type: str(row.type) || 'bw',
    title_ko: str(row.title_ko),
    title_en: str(row.title_en),
    title_ja: str(row.title_ja),
    title_es: str(row.title_es),
    title_de: str(row.title_de),
    title_fr: str(row.title_fr),
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
    parent_guide_ko: str(row.parent_guide_ko),
    parent_guide_en: str(row.parent_guide_en),
    parent_guide_ja: str(row.parent_guide_ja),
    parent_guide_es: str(row.parent_guide_es),
    parent_guide_de: str(row.parent_guide_de),
    parent_guide_fr: str(row.parent_guide_fr),
    description: str(row.description_ko) || str(row.description),
    description_ko: str(row.description_ko) || str(row.description),
    description_en: str(row.description_en),
    description_ja: str(row.description_ja),
    description_es: str(row.description_es),
    description_de: str(row.description_de),
    description_fr: str(row.description_fr),
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
  return {
    id,
    slug: str(draft.slug) || id,
    type: str(draft.type) || 'bw',
    title: titleKo,
    title_ko: titleKo,
    title_en: str(draft.title_en) || titleKo,
    title_ja: str(draft.title_ja),
    title_es: str(draft.title_es),
    title_de: str(draft.title_de),
    title_fr: str(draft.title_fr),
    category,
    catalog_slug: catalogSlug,
    age_group: ageGroup,
    age_group_en: str(draft.age_group_en),
    theme_en: str(draft.theme_en),
    benefit_1: str(draft.benefit_1),
    benefit_2: str(draft.benefit_2),
    benefit_3: str(draft.benefit_3),
    parent_guide_ko: str(draft.parent_guide_ko),
    parent_guide_en: str(draft.parent_guide_en),
    parent_guide_ja: str(draft.parent_guide_ja),
    parent_guide_es: str(draft.parent_guide_es),
    parent_guide_de: str(draft.parent_guide_de),
    parent_guide_fr: str(draft.parent_guide_fr),
    description: descriptionKo,
    description_ko: descriptionKo,
    description_en: str(draft.description_en),
    description_ja: str(draft.description_ja),
    description_es: str(draft.description_es),
    description_de: str(draft.description_de),
    description_fr: str(draft.description_fr),
    tags,
    line_art_url: str(draft.image_bw_url),
    color_image_url: str(draft.image_color_url),
    image_bw_url: str(draft.image_bw_url),
    image_color_url: str(draft.image_color_url),
    pdf_url: str(draft.pdf_url),
    published: draft.published,
    views: 0,
    downloads: 0,
  }
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
      theme_ko: str(draft.theme_ko),
      created_at: new Date().toISOString(),
    }),
    catalog_slug: row.catalog_slug,
    published: row.published,
    description: row.description,
  }

  if (supabase) {
    const { error } = await supabase.from('printables').upsert(row)
    if (error) {
      const bySlug = await supabase.from('printables').upsert(row, { onConflict: 'slug' })
      if (bySlug.error) {
        const minimal = {
          id: row.id,
          title: row.title,
          category: row.category,
          tags: row.tags,
          color_image_url: row.color_image_url,
          line_art_url: row.line_art_url,
          pdf_url: row.pdf_url,
          slug: row.slug,
        }
        const retry = await supabase.from('printables').upsert(minimal)
        if (retry.error) {
          const last = await supabase.from('printables').upsert(minimal, { onConflict: 'slug' })
          if (last.error) throw last.error
        }
      }
    }
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

  if (bucket === 'printables' && isImage) {
    try {
      const item = await uploadR2PrintableFile(file)
      if (item.url) return item.url
    } catch (error) {
      const connected = Boolean(error && typeof error === 'object' && 'connected' in error && error.connected)
      if (connected) throw error
    }
  }

  if (!supabase) {
    return URL.createObjectURL(file)
  }
  const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
