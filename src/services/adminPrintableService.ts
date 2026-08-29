import { catalogToPrintableCategory } from '@/admin/adminOptions'
import type { ParsedPrintableRow } from '@/admin/parsePrintableSheet'
import { supabase } from '@/lib/supabase'
import { fetchPrintables } from '@/services/printableService'
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
    description: extra?.description ?? '',
  }
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
}

function draftToRow(draft: PrintableDraft) {
  const tags = [
    ...draft.tags.split(/[,|#]+/).map((item) => item.trim()).filter(Boolean),
    draft.age ? `${draft.age}세` : '',
    draft.catalog_slug ? `cat:${draft.catalog_slug}` : '',
    draft.published ? '' : 'hidden',
  ].filter(Boolean)

  const id = draft.id || crypto.randomUUID()
  const category = catalogToPrintableCategory(draft.catalog_slug)
  return {
    id,
    slug: draft.slug.trim() || id,
    title: draft.title_ko.trim(),
    title_ko: draft.title_ko.trim(),
    title_en: draft.title_en.trim() || draft.title_ko.trim(),
    category,
    catalog_slug: draft.catalog_slug,
    tags,
    line_art_url: draft.image_bw_url,
    color_image_url: draft.image_color_url,
    image_bw_url: draft.image_bw_url,
    image_color_url: draft.image_color_url,
    pdf_url: draft.pdf_url,
    published: draft.published,
    description: draft.description,
    views: 0,
    downloads: 0,
  }
}

export async function listAdminPrintables(): Promise<AdminPrintable[]> {
  const local = readLocal()
  try {
    const remote = await fetchPrintables('all')
    const mapped = remote.map((item) => toAdmin(item))
    const byId = new Map(mapped.map((item) => [item.id, item]))
    for (const item of local) byId.set(item.id, item)
    return [...byId.values()].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  } catch {
    return local
  }
}

export async function savePrintable(draft: PrintableDraft) {
  const row = draftToRow(draft)
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
    const { error } = await supabase.from('printables').upsert(row)
    if (error) {
      const minimal = {
        id: row.id,
        title: row.title,
        category: row.category,
        tags: row.tags,
        color_image_url: row.color_image_url,
        line_art_url: row.line_art_url,
        pdf_url: row.pdf_url,
      }
      const retry = await supabase.from('printables').upsert(minimal)
      if (retry.error) throw retry.error
    }
  }

  const next = readLocal().filter((item) => item.id !== record.id)
  writeLocal([record, ...next])
  return record
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

export async function deletePrintable(id: string) {
  if (supabase) {
    await supabase.from('printables').delete().eq('id', id)
  }
  writeLocal(readLocal().filter((item) => item.id !== id))
}

export async function importPrintableRows(rows: ParsedPrintableRow[]) {
  const saved: AdminPrintable[] = []
  const errors: string[] = []
  for (const [index, row] of rows.entries()) {
    try {
      const tags = [row.tags, row.theme, row.age ? `${row.age}세` : ''].filter(Boolean).join(',')
      saved.push(
        await savePrintable({
          id: row.id || undefined,
          slug: row.slug,
          title_ko: row.title_ko,
          title_en: row.title_en,
          catalog_slug: row.catalog_slug || row.category,
          age: row.age,
          tags,
          image_bw_url: row.image_bw_url,
          image_color_url: row.image_color_url,
          pdf_url: row.pdf_url,
          published: !['false', '0', 'hidden', '숨김'].includes(row.published.toLowerCase()),
          description: row.description,
        }),
      )
    } catch (error) {
      errors.push(`${index + 1}행: ${error instanceof Error ? error.message : '저장 실패'}`)
    }
  }
  return { saved, errors }
}

export async function uploadAdminFile(bucket: 'printables' | 'parenting-tips', file: File) {
  if (!supabase) {
    return URL.createObjectURL(file)
  }
  const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
