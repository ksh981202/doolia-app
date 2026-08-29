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
      ['사고', '순서', '두뇌', '지구력', '원리', '미로', '점잇기'].some((token) => text.includes(token))
    )
  }
  return (
    item.category === 'coloring' ||
    item.category === 'tracing' ||
    item.category === 'alphabet' ||
    item.category === 'numbers' ||
    ['색칠', '알파벳', '선따기', '따라그리기'].some((token) => text.includes(token))
  )
}

export function mergePrintableCatalog(items: Printable[]) {
  const merged = [...items]
  for (const demo of DEMO_PRINTABLES) {
    if (merged.some((item) => item.id === demo.id || item.slug === demo.slug || item.title === demo.title)) {
      continue
    }
    merged.push(demo)
  }
  return merged
}

function findDemo(key: string) {
  return DEMO_PRINTABLES.find((item) => item.id === key || item.slug === key) ?? null
}

export async function fetchPrintables(category: GalleryCategory = 'all'): Promise<Printable[]> {
  if (!supabase) {
    return category === 'all' ? DEMO_PRINTABLES : DEMO_PRINTABLES.filter((item) => item.category === category)
  }

  let query = supabase.from('printables').select('*').order('downloads', { ascending: false })
  if (category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  const items = (data ?? []).map((row) => normalizePrintable(row as PrintableInput))
  return mergePrintableCatalog(items)
}

export async function fetchPrintableById(id: string): Promise<Printable | null> {
  const demo = findDemo(id)
  if (!supabase) return demo

  const byId = await supabase.from('printables').select('*').eq('id', id).maybeSingle()
  if (byId.error) throw byId.error
  if (byId.data) return normalizePrintable(byId.data as PrintableInput)

  const bySlug = await supabase.from('printables').select('*').eq('slug', id).maybeSingle()
  if (bySlug.error) {
    // slug 컬럼이 아직 없는 기존 스키마에서는 id 조회 결과만 사용한다.
    return demo
  }
  if (bySlug.data) return normalizePrintable(bySlug.data as PrintableInput)
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
