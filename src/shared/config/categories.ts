export const CATEGORIES = [
  { id: 'coloring-pages', label: '색칠공부', emoji: '🎨' },
  { id: 'tracing', label: '선 긋기 연습', emoji: '✏️' },
  { id: 'letters', label: '알파벳 & 숫자', emoji: '🔤' },
  { id: 'cutout', label: '종이 오리기', emoji: '✂️' },
  { id: 'ispy', label: '숨은그림찾기', emoji: '🔍' },
  { id: 'odd-one', label: '다른그림찾기', emoji: '👀' },
  { id: 'maze', label: '미로찾기', emoji: '🌀' },
  { id: 'dots', label: '점잇기', emoji: '🔢' },
  { id: 'shadow', label: '그림자 맞추기', emoji: '🌗' },
  { id: 'routine', label: '루틴 체크차트', emoji: '📋' },
  { id: 'emotion', label: '감정 매칭카드', emoji: '😊' },
  { id: 'puppets', label: '손가락인형', emoji: '🦊' },
  { id: 'board-game', label: '한장 보드게임', emoji: '🎲' },
  { id: 'season', label: '시즌 & 기념일', emoji: '🎉' },
] as const

export type PrintableCategory = (typeof CATEGORIES)[number]['id']

export const ALL_CATEGORY = 'all' as const

export type GalleryCategory = typeof ALL_CATEGORY | PrintableCategory

export const CATEGORY_LABEL: Record<PrintableCategory, string> = {
  'coloring-pages': '색칠공부',
  tracing: '선 긋기 연습',
  letters: '알파벳 & 숫자',
  cutout: '종이 오리기',
  ispy: '숨은그림찾기',
  'odd-one': '다른그림찾기',
  maze: '미로찾기',
  dots: '점잇기',
  shadow: '그림자 맞추기',
  routine: '루틴 체크차트',
  emotion: '감정 매칭카드',
  puppets: '손가락인형',
  'board-game': '한장 보드게임',
  season: '시즌 & 기념일',
}

const CATEGORY_ID_SET = new Set<string>(CATEGORIES.map((item) => item.id))

/** Old DB / TSV values still accepted, then stored as a canonical slug. */
export const LEGACY_CATEGORY_ALIASES: Record<string, PrintableCategory> = {
  coloring: 'coloring-pages',
  alphabet: 'letters',
  numbers: 'dots',
  odd_one: 'odd-one',
  board_game: 'board-game',
  alphabet_numbers: 'letters',
}

export function isPrintableCategory(value: string): value is PrintableCategory {
  return CATEGORY_ID_SET.has(value)
}

export function toPrintableCategory(value: string | null | undefined): PrintableCategory {
  const raw = value?.trim().toLowerCase() ?? ''
  if (isPrintableCategory(raw)) return raw
  return LEGACY_CATEGORY_ALIASES[raw] ?? 'coloring-pages'
}

/** Canonical slug plus legacy DB/TSV values that map to it (`coloring` + `coloring-pages`). */
export function printableCategoryMatchValues(category: PrintableCategory): string[] {
  const aliases = Object.entries(LEGACY_CATEGORY_ALIASES)
    .filter(([, mapped]) => mapped === category)
    .map(([raw]) => raw)
  return [...new Set([category, ...aliases])]
}

export function matchesPrintableCategory(
  value: string | null | undefined,
  expected: PrintableCategory,
): boolean {
  return toPrintableCategory(value) === expected
}

export const AD_COUNTDOWN_SECONDS = 0

export const BRAND = {
  shortName: 'DOOLIA',
  name: 'DOOLIA Printables',
  slogan: 'Print, Play & Discover',
  positioning: '아이 상태 맞춤형 두뇌·습관 솔루션',
  watermark: '© DOOLIA Printables',
} as const

export const POPULAR_KEYWORDS = ['집중력', '감정표현', '아침루틴', '숨은그림'] as const

export const NEED_FILTERS = [
  {
    id: 'focus',
    emoji: '🎯',
    label: '집중력&관찰력',
    pillarId: 'brain',
    topicIds: ['ispy', 'odd-one', 'shadow'],
  },
  {
    id: 'emotion',
    emoji: '😊',
    label: '감정&SEL',
    pillarId: 'family',
    topicIds: ['emotion'],
  },
  {
    id: 'habit',
    emoji: '🌅',
    label: '생활습관',
    pillarId: 'family',
    topicIds: ['routine'],
  },
  {
    id: 'thinking',
    emoji: '💡',
    label: '사고력&지구력',
    pillarId: 'brain',
    topicIds: ['ispy', 'odd-one', 'shadow', 'maze', 'dots'],
  },
  {
    id: 'together',
    emoji: '🤝',
    label: '부모함께',
    pillarId: 'family',
    topicIds: ['routine', 'emotion', 'puppets', 'board-game', 'season'],
  },
] as const

export type NeedFilterId = (typeof NEED_FILTERS)[number]['id']
export type BrandPillarId = (typeof NEED_FILTERS)[number]['pillarId'] | 'kids'

export const BRAND_PILLARS = [
  {
    id: 'kids',
    brand: 'DOOLIA Kids',
    subtitle: '기초 학습 & 창의',
    emoji: '🎨',
    theme: {
      panel: 'border-emerald-100 bg-emerald-50/50',
      card: 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50',
      pill: 'bg-emerald-100/90 text-emerald-700',
      effect: 'bg-white/70 text-emerald-700',
      accent: 'text-emerald-700',
    },
    topics: [
      { id: 'coloring-pages', label: '색칠공부', emoji: '🎨', count: '200+', effect: '색감 & 표현력' },
      { id: 'tracing', label: '선 긋기 연습', emoji: '✏️', count: '48', effect: '운필력 & 협응력' },
      { id: 'letters', label: '알파벳&숫자', emoji: '🔤', count: '150+', effect: '기초 학습력' },
      { id: 'cutout', label: '종이 오리기', emoji: '✂️', count: '16', effect: '소근육 & 집중력' },
    ],
  },
  {
    id: 'brain',
    brand: 'DOOLIA Brain',
    subtitle: '두뇌 발달 & 사고력',
    emoji: '🧠',
    theme: {
      panel: 'border-blue-100 bg-blue-50/50',
      card: 'border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50',
      pill: 'bg-blue-100/90 text-blue-700',
      effect: 'bg-white/70 text-blue-700',
      accent: 'text-blue-700',
    },
    topics: [
      { id: 'ispy', label: '숨은그림찾기', emoji: '🔍', count: '36', effect: '집중력 & 관찰력' },
      { id: 'odd-one', label: '다른그림찾기', emoji: '👀', count: '28', effect: '논리적 사고력' },
      { id: 'maze', label: '미로찾기', emoji: '🌀', count: '95', effect: '문제해결력' },
      { id: 'dots', label: '점잇기', emoji: '🔢', count: '65', effect: '수 감각 & 집중력' },
      { id: 'shadow', label: '그림자맞추기', emoji: '🌗', count: '24', effect: '공간지각력' },
    ],
  },
  {
    id: 'family',
    brand: 'DOOLIA Family',
    subtitle: '부모함께 & 습관',
    emoji: '🤝',
    theme: {
      panel: 'border-amber-100 bg-amber-50/50',
      card: 'border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50',
      pill: 'bg-amber-100/90 text-amber-800',
      effect: 'bg-white/70 text-amber-800',
      accent: 'text-amber-800',
    },
    topics: [
      { id: 'routine', label: '루틴 체크차트', emoji: '📋', count: '18', effect: '자립 습관 형성' },
      { id: 'emotion', label: '감정 매칭카드', emoji: '😊', count: '20', effect: '감정 표현 SEL' },
      { id: 'puppets', label: '손가락인형', emoji: '🦊', count: '16', effect: '대화 & 공감' },
      { id: 'board-game', label: '한장 보드게임', emoji: '🎲', count: '12', effect: '규칙 & 사회성' },
      { id: 'season', label: '시즌&기념일', emoji: '🎉', count: '130', effect: '특별한 날 놀이' },
    ],
  },
] as const

export const POPULAR_TABS = [
  { id: 'all', label: '전체 인기' },
  { id: 'focus', label: '🎯 집중·관찰' },
  { id: 'emotion-habit', label: '😊 감정·습관' },
  { id: 'thinking', label: '💡 두뇌·사고' },
  { id: 'basics', label: '🎨 기초·색칠' },
] as const

export type PopularTab = (typeof POPULAR_TABS)[number]['id']

export const TOPIC_CARDS = BRAND_PILLARS.flatMap((pillar) =>
  pillar.topics.map((topic) => ({
    ...topic,
    query: topic.label,
  })),
)
