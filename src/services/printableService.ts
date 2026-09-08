import { supabase } from '@/db/supabase'
import { DEMO_PRINTABLES } from '@/services/demoPrintables'
import type { GalleryCategory, PopularTab } from '@/shared/config/categories'
import {
  normalizePrintable,
  printableSearchText,
  type Printable,
  type PrintableInput,
} from '@/types/printable'

export { DEMO_PRINTABLES } from '@/services/demoPrintables'
export type { Printable, PrintableInput } from '@/types/printable'
export { normalizePrintable } from '@/types/printable'

export function matchesQuery(item: Printable, query: string) {
  const raw = query.replace(/^#/, '').trim()
  if (!raw) return true
  const hay = printableSearchText(item)
  return raw
    .split('|')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .some((needle) => hay.includes(needle))
}

export function matchesPopularTab(item: Printable, tab: PopularTab) {
  const text = printableSearchText(item)
  if (tab === 'all') return true
  if (tab === 'focus') {
    return ['집중', '관찰', '숨은그림', '다른하나', '다른그림', '그림자', 'i spy'].some((token) =>
      text.includes(token),
    )
  }
  if (tab === 'emotion-habit') {
    return ['감정', 'sel', '루틴', '습관', '부모함께', '손가락인형', '보드게임'].some((token) =>
      text.includes(token),
    )
  }
  if (tab === 'thinking') {
    return (
      item.category === 'maze' ||
      item.category === 'ispy' ||
      item.category === 'odd-one' ||
      item.category === 'shadow' ||
      item.category === 'dots' ||
      ['사고', '순서', '두뇌', '지구력', '원리', '미로', '점잇기'].some((token) => text.includes(token))
    )
  }
  return (
    item.category === 'coloring-pages' ||
    item.category === 'cutout' ||
    item.category === 'tracing' ||
    item.category === 'letters' ||
    ['색칠', '알파벳', '선따기', '따라그리기'].some((token) => text.includes(token))
  )
}

export function mergePrintableCatalog(items: Printable[]) {
  if (items.length) return items
  return DEMO_PRINTABLES
}

export function selectHomePrintables(items: Printable[], limit = 8) {
  const recentSlots = Math.min(4, limit)
  const byCreated = [...items].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  const byDownloads = [...items].sort(
    (a, b) => b.downloads - a.downloads || +new Date(b.created_at) - +new Date(a.created_at),
  )
  const picked: Printable[] = []
  const seen = new Set<string>()
  for (const item of byCreated) {
    if (picked.length >= recentSlots) break
    if (seen.has(item.id)) continue
    seen.add(item.id)
    picked.push(item)
  }
  for (const item of byDownloads) {
    if (picked.length >= limit) break
    if (seen.has(item.id)) continue
    seen.add(item.id)
    picked.push(item)
  }
  return picked
}

function findDemo(key: string) {
  return DEMO_PRINTABLES.find((item) => item.id === key || item.slug === key) ?? null
}

function isPubliclyListed(row: PrintableInput) {
  return row.published !== false
}

export type FetchPrintablesOptions = {
  includeUnpublished?: boolean
}

export async function fetchPrintables(
  category: GalleryCategory = 'all',
  options: FetchPrintablesOptions = {},
): Promise<Printable[]> {
  const includeUnpublished = Boolean(options.includeUnpublished)

  const client = supabase
  if (!client) {
    const source = category === 'all' ? DEMO_PRINTABLES : DEMO_PRINTABLES.filter((item) => item.category === category)
    return includeUnpublished ? source : source.filter((item) => item.published !== false)
  }

  const runQuery = (withPublishedFilter: boolean) => {
    let query = client.from('printables').select('*').order('downloads', { ascending: false })
    if (category !== 'all') query = query.eq('category', category)
    if (withPublishedFilter) query = query.or('published.eq.true,published.is.null')
    return query
  }

  let { data, error } = await runQuery(!includeUnpublished)
  if (error && !includeUnpublished) {
    const retry = await runQuery(false)
    data = retry.data
    error = retry.error
  }
  if (error) throw error

  return (data ?? [])
    .map((row) => row as PrintableInput)
    .filter((row) => includeUnpublished || isPubliclyListed(row))
    .map((row) => normalizePrintable(row))
}

export async function fetchPrintableById(id: string): Promise<Printable | null> {
  const demo = findDemo(id)
  if (!supabase) return demo

  const byId = await supabase.from('printables').select('*').eq('id', id).maybeSingle()
  if (byId.error) throw byId.error
  if (byId.data) {
    const row = byId.data as PrintableInput
    if (row.published === false) return null
    return normalizePrintable(row)
  }

  const bySlug = await supabase.from('printables').select('*').eq('slug', id).maybeSingle()
  if (bySlug.error) {
    // slug 컬럼이 아직 없는 기존 스키마에서는 id 조회 결과만 사용한다.
    return demo
  }
  if (bySlug.data) {
    const row = bySlug.data as PrintableInput
    if (row.published === false) return null
    return normalizePrintable(row)
  }
  return demo
}

export async function incrementPrintableViews(id: string) {
  if (!supabase || id.startsWith('demo-') || id.startsWith('mock-')) return
  await supabase.rpc('increment_printable_views', { p_id: id })
}

export async function incrementPrintableDownloads(id: string) {
  if (!supabase || id.startsWith('demo-') || id.startsWith('mock-')) return
  await supabase.rpc('increment_printable_downloads', { p_id: id })
}
