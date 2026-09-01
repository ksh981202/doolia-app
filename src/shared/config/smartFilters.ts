import { matchesQuery } from '@/services/printableService'
import type { Printable } from '@/types/printable'
import { getCatalogTopic } from '@/shared/config/catalog'

export type AgeFilterId = 'all' | '2-3' | '4-5' | '6-7'

type AgeFilter =
  | { id: 'all'; label: string }
  | { id: Exclude<AgeFilterId, 'all'>; label: string; min: number; max: number }

export const AGE_FILTERS: AgeFilter[] = [
  { id: 'all', label: '전체' },
  { id: '2-3', label: '만 2~3세 (영아)', min: 2, max: 3 },
  { id: '4-5', label: '만 4~5세 (유아)', min: 4, max: 5 },
  { id: '6-7', label: '만 6~7세 (취학전)', min: 6, max: 7 },
]

export const AGE_BROWSE_ITEMS = AGE_FILTERS.filter(
  (item): item is Extract<AgeFilter, { min: number }> => item.id !== 'all',
)

export const THEME_FILTERS = [
  { id: 'all', label: '전체', query: '', featured: true },
  { id: 'dinosaur', label: '🦖 공룡', query: '공룡', featured: true },
  { id: 'vehicles', label: '🚗 자동차·탈것', query: '자동차|탈것|소방차|경찰차|비행기|포크레인|스포츠카', featured: true },
  { id: 'animals', label: '🐶 귀여운 동물', query: '동물|사자', featured: true },
  { id: 'fantasy', label: '👑 공주·판타지', query: '공주|판타지|요정', featured: true },
  { id: 'space', label: '🚀 우주·로봇', query: '우주|로켓|로봇', featured: true },
  { id: 'basics', label: '🌱 기초선/도형', query: '도형|선따기|기초|알파벳|숫자|따라쓰기|점잇기', featured: true },
  { id: 'food', label: '🍎 과일/음식', query: '과일|음식|사과|케이크|아이스크림' },
  { id: 'ocean', label: '🐠 바다생물', query: '바다|물고기|고래|상어|문어' },
  { id: 'insects', label: '🐛 곤충', query: '곤충|나비|벌|무당벌레' },
  { id: 'jobs', label: '👩‍🚒 직업', query: '직업|소방관|의사|경찰|선생님' },
  { id: 'season', label: '🎉 계절/기념일', query: '크리스마스|할로윈|시즌|기념일|생일' },
  { id: 'nature', label: '🌸 꽃/자연', query: '꽃|자연|나무|식물' },
  { id: 'sports', label: '⚽ 스포츠', query: '축구|스포츠|공놀이|야구' },
] as const

export type ThemeFilterId = (typeof THEME_FILTERS)[number]['id']
export type ThemeFilterItem = (typeof THEME_FILTERS)[number]

export const FEATURED_THEME_FILTERS = THEME_FILTERS.filter((item) => 'featured' in item && item.featured)

const RANGE_RE = /(\d+)\s*[-~–—]\s*(\d+)\s*세/
const SINGLE_RE = /(\d+)\s*세/
const AGE_PAIR_RE = /(?:ages?\s*)?(\d+)\s*[-~–—]\s*(\d+)/i

function parseAgeString(raw: string | undefined): { min: number; max: number } | null {
  const source = raw?.trim()
  if (!source) return null
  const normalized = source
    .toLowerCase()
    .replace(/^만\s*/, '')
    .replace(/\s*세\+?$/, '')
    .replace(/\s+/g, ' ')
    .trim()
  const compact = normalized.replace(/\s+/g, '')
  if (compact === '2-3' || compact === '2~3' || compact === '2–3') return { min: 2, max: 3 }
  if (compact === '4-5' || compact === '4~5' || compact === '4–5') return { min: 4, max: 5 }
  if (compact === '6-7' || compact === '6~7' || compact === '6–7' || compact === '6-7+' || compact === '6~7+') {
    return { min: 6, max: 7 }
  }
  const pair = normalized.match(AGE_PAIR_RE) ?? compact.match(AGE_PAIR_RE)
  if (pair) return { min: Number(pair[1]), max: Number(pair[2]) }
  return null
}

function inferAgeRange(item: Printable): { min: number; max: number } | null {
  const fromColumns = parseAgeString(item.age_group_en) ?? parseAgeString(item.age_group)
  if (fromColumns) return fromColumns

  const ranges: { min: number; max: number }[] = []
  const blob = [item.title, item.title_ko, item.age_group, item.age_group_en, ...item.tags].join(' ')

  for (const tag of item.tags) {
    const fromTag = parseAgeString(tag)
    if (fromTag) {
      ranges.push(fromTag)
      continue
    }
    const range = tag.match(RANGE_RE)
    if (range) {
      ranges.push({ min: Number(range[1]), max: Number(range[2]) })
      continue
    }
    const single = tag.match(SINGLE_RE)
    if (single) ranges.push({ min: Number(single[1]), max: Number(single[1]) })
  }

  if (/영아/.test(blob)) ranges.push({ min: 2, max: 3 })
  if (/취학전/.test(blob)) ranges.push({ min: 6, max: 7 })
  if (/유치원/.test(blob)) ranges.push({ min: 5, max: 7 })
  if (/유아/.test(blob) && ranges.length === 0) ranges.push({ min: 3, max: 5 })

  if (!ranges.length) return null
  return {
    min: Math.min(...ranges.map((item) => item.min)),
    max: Math.max(...ranges.map((item) => item.max)),
  }
}

export function matchesAgeFilter(item: Printable, ageId: string) {
  if (ageId === 'all') return true
  const filter = AGE_FILTERS.find((entry) => entry.id === ageId)
  if (!filter || filter.id === 'all') return true
  const range = inferAgeRange(item)
  if (!range) return true
  return range.min <= filter.max && range.max >= filter.min
}

function themeHaystack(item: Printable) {
  return [item.theme_en, item.theme_ko, ...item.tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function normalizeThemeToken(value: string) {
  return value.trim().toLowerCase().replace(/[\s_]+/g, '-')
}

export function matchesThemeFilter(item: Printable, themeId: string) {
  if (!themeId || themeId === 'all') return true
  const theme = THEME_FILTERS.find((entry) => entry.id === themeId)
  if (!theme || theme.id === 'all') return true

  const id = normalizeThemeToken(theme.id)
  const themeEn = normalizeThemeToken(item.theme_en)
  const themeKo = item.theme_ko.trim().toLowerCase()
  if (themeEn && (themeEn === id || themeEn.includes(id) || (themeEn.length >= 3 && id.includes(themeEn)))) {
    return true
  }

  const tokens = theme.query
    .split('|')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  if (themeKo && tokens.some((token) => themeKo.includes(token) || token.includes(themeKo))) return true
  if (themeEn && tokens.some((token) => themeEn.includes(token))) return true

  const hay = themeHaystack(item)
  if (id && hay.includes(id)) return true
  return matchesQuery(item, theme.query)
}

export function isAgeFilterId(value: string): value is AgeFilterId {
  return AGE_FILTERS.some((item) => item.id === value)
}

export function isThemeFilterId(value: string): value is ThemeFilterId {
  return THEME_FILTERS.some((item) => item.id === value)
}

export const FINDER_AGES = AGE_FILTERS.filter((item) => item.id !== 'all').map((item) => ({
  id: item.id,
  label: item.id === '2-3' ? '만 2~3세' : item.id === '4-5' ? '만 4~5세' : '만 6~7세',
}))

export const FINDER_THEMES = [
  { id: 'dinosaur' as const, label: '🦖 공룡' },
  { id: 'vehicles' as const, label: '🚗 탈것' },
  { id: 'animals' as const, label: '🐶 동물' },
  { id: 'fantasy' as const, label: '👑 공주' },
  { id: 'space' as const, label: '🚀 우주' },
]

export const FINDER_TYPES = [
  { id: 'coloring' as const, label: '🎨 색칠공부', slug: 'coloring-pages' },
  { id: 'brain' as const, label: '🧩 미로/찾기', slug: 'maze' },
  { id: 'tracing' as const, label: '✍️ 선따기/쓰기', slug: 'tracing' },
  { id: 'routine' as const, label: '🏡 루틴/차트', slug: 'routine' },
]

export function resolveTypeSlug(value: string | null | undefined) {
  if (!value || value === 'all') return undefined
  const finder = FINDER_TYPES.find((item) => item.id === value || item.slug === value)
  if (finder) return finder.slug
  return getCatalogTopic(value) ? value : undefined
}

export function isTypeFilterId(value: string) {
  return FINDER_TYPES.some((item) => item.id === value || item.slug === value)
}

export function buildFinderPath(age?: string | null, theme?: string | null, type?: string | null) {
  const slug = resolveTypeSlug(type)
  const params = new URLSearchParams()
  if (age && age !== 'all') params.set('age', age)
  if (theme && theme !== 'all') params.set('theme', theme)
  if (type && type !== 'all') params.set('type', type)
  const search = params.toString()
  if (slug) return `/category/${slug}${search ? `?${search}` : ''}`
  return `/category${search ? `?${search}` : ''}`
}
