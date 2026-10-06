import { type ParentingTip, type ParentingTipBlock, type ParentingTipTopicId } from '@/data/parentingTipsData'
import { supabase } from '@/lib/supabase'
import { adminDb } from '@/services/adminDataClient'
import { takeawaysFromValue } from '@/shared/lib/tipBody'

export type AdminTip = ParentingTip & {
  id: string
  views: number
  published: boolean
  bodyMarkdown: string
}

const LOCAL_KEY = 'doolia-admin-tips'

function readLocal(): AdminTip[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as AdminTip[]) : []
  } catch {
    return []
  }
}

function writeLocal(items: AdminTip[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
}

export function markdownToBlocks(markdown: string): ParentingTipBlock[] {
  const blocks: ParentingTipBlock[] = []
  let list: string[] = []
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: 'ul', items: list })
      list = []
    }
  }

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) {
      flushList()
      continue
    }
    if (line.startsWith('### ')) {
      flushList()
      blocks.push({ type: 'h3', text: line.slice(4) })
      continue
    }
    if (line.startsWith('## ')) {
      flushList()
      blocks.push({ type: 'h2', text: line.slice(3) })
      continue
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      list.push(line.slice(2))
      continue
    }
    flushList()
    blocks.push({ type: 'p', text: line })
  }
  flushList()
  return blocks
}

function fromRow(row: Record<string, unknown>): AdminTip {
  const bodyMarkdown = String(row.body_markdown ?? row.content ?? '')
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? ''),
    category: (row.category as ParentingTipTopicId) || 'cognition',
    publishedAt: String(row.published_at ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10),
    readMinutes: Number(row.read_minutes ?? row.read_time ?? 5),
    thumbnail: String(row.thumbnail_url ?? ''),
    thumbnailAlt: String(row.thumbnail_alt ?? ''),
    takeaways: takeawaysFromValue(row.takeaways ?? row.parent_summary),
    blocks: markdownToBlocks(bodyMarkdown),
    views: Number(row.views ?? 0),
    published: row.published !== false,
    bodyMarkdown,
  }
}

export async function listAdminTips(): Promise<AdminTip[]> {
  try {
    const remote = await adminDb<Record<string, unknown>>({ action: 'list', table: 'parenting_tips' })
    return (remote.rows ?? []).map((row) => fromRow(row))
  } catch {
    return readLocal()
  }
}

export type TipDraft = {
  id?: string
  slug: string
  title: string
  excerpt: string
  category: ParentingTipTopicId
  thumbnail: string
  readMinutes: number
  published: boolean
  bodyMarkdown: string
}

export async function saveTip(draft: TipDraft) {
  const record: AdminTip = {
    id: draft.id || crypto.randomUUID(),
    slug: draft.slug.trim(),
    title: draft.title.trim(),
    excerpt: draft.excerpt.trim(),
    category: draft.category,
    publishedAt: new Date().toISOString().slice(0, 10),
    readMinutes: draft.readMinutes || 5,
    thumbnail: draft.thumbnail,
    thumbnailAlt: draft.title,
    takeaways: [],
    blocks: markdownToBlocks(draft.bodyMarkdown),
    views: 0,
    published: draft.published,
    bodyMarkdown: draft.bodyMarkdown,
  }

  await adminDb({
    action: 'upsert',
    table: 'parenting_tips',
    row: {
      id: record.id,
      slug: record.slug,
      title: record.title,
      excerpt: record.excerpt,
      category: record.category,
      thumbnail_url: record.thumbnail,
      thumbnail_alt: record.thumbnailAlt,
      read_minutes: record.readMinutes,
      published: record.published,
      body_markdown: record.bodyMarkdown,
      takeaways: record.takeaways,
      published_at: record.publishedAt,
      updated_at: new Date().toISOString(),
    },
  })

  writeLocal([record, ...readLocal().filter((item) => item.slug !== record.slug)])
  return record
}

export async function setTipPublished(id: string, published: boolean) {
  try {
    await adminDb({ action: 'update', table: 'parenting_tips', eq: { id }, patch: { published } })
  } catch {
    await adminDb({ action: 'update', table: 'parenting_tips', eq: { slug: id }, patch: { published } })
  }
  writeLocal(readLocal().map((item) => (item.id === id || item.slug === id ? { ...item, published } : item)))
}

export async function deleteTip(id: string) {
  try {
    await adminDb({ action: 'delete', table: 'parenting_tips', eq: { id } })
  } catch {
    await adminDb({ action: 'delete', table: 'parenting_tips', eq: { slug: id } })
  }
  writeLocal(readLocal().filter((item) => item.id !== id && item.slug !== id))
}

export async function getPublishedTipBySlug(slug: string): Promise<AdminTip | undefined> {
  const items = await listPublishedTips()
  return items.find((item) => item.slug === slug)
}

export async function listPublishedTips(): Promise<AdminTip[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('parenting_tips')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    if (!error && data) return data.map((row) => fromRow(row as Record<string, unknown>))
  }
  return readLocal().filter((item) => item.published)
}
