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
    brand: '기초 놀이·창의',
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
    brand: '두뇌 놀이·사고력',
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
    brand: '생활 습관·함께놀이',
    subtitle: '부모함께 & 습관',
    emoji: '💛',
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

export type ThemeOption = {
  id: string
  name: string
  icon?: string
  query?: string
}

function themes(items: ThemeOption[]): ThemeOption[] {
  return items
}

export const CATEGORY_THEMES: Record<string, ThemeOption[]> = {
  'coloring-pages': themes([
    { id: 'all', name: '전체' },
    { id: 'dinosaur', name: '공룡', icon: '🦕', query: '공룡' },
    { id: 'vehicles', name: '자동차·탈것', icon: '🚗', query: '자동차|탈것|소방차|경찰차|비행기|포크레인' },
    { id: 'animals', name: '귀여운 동물', icon: '🐶', query: '동물|사자' },
    { id: 'princess', name: '공주·판타지', icon: '👑', query: '공주|판타지|요정' },
    { id: 'space-robot', name: '우주·로봇', icon: '🚀', query: '우주|로켓|로봇' },
    { id: 'shapes', name: '기초선/도형', icon: '🌱', query: '도형|선따기|기초' },
  ]),
  'line-tracing': themes([
    { id: 'all', name: '전체' },
    { id: 'straight', name: '기초 직선', icon: '📏', query: '직선|기초선' },
    { id: 'curve', name: '곡선·물결', icon: '〰️', query: '곡선|물결' },
    { id: 'zigzag', name: '지그재그', icon: '⚡', query: '지그재그' },
    { id: 'shapes', name: '도형 잇기', icon: '🔺', query: '도형' },
    { id: 'drawing', name: '그림 완성', icon: '✏️', query: '그림|완성|따라그리기|선따기' },
  ]),
  'alphabet-numbers': themes([
    { id: 'all', name: '전체' },
    { id: 'alpha-upper', name: '알파벳 대문자', icon: '🔤', query: '대문자|알파벳' },
    { id: 'alpha-lower', name: '알파벳 소문자', icon: '🔡', query: '소문자|알파벳' },
    { id: 'num-1-20', name: '숫자 1-20', icon: '🔢', query: '숫자|1-20|1~20' },
    { id: 'num-1-100', name: '숫자 1-100', icon: '🔟', query: '숫자|1-100|1~100' },
    { id: 'words', name: '기초 단어', icon: '📝', query: '단어|따라쓰기' },
  ]),
  'scissor-skills': themes([
    { id: 'all', name: '전체' },
    { id: 'straight', name: '직선 오리기', icon: '✂️', query: '직선|오리기' },
    { id: 'curves', name: '곡선/모양', icon: '🌀', query: '곡선|모양|오리기' },
    { id: 'shapes', name: '도형 자르기', icon: '🔺', query: '도형|자르기|오리기' },
    { id: 'paste-puzzle', name: '오려 붙이기', icon: '🧩', query: '붙이기|퍼즐|오리기' },
    { id: '3d-craft', name: '입체 공작', icon: '📦', query: '입체|공작|만들기' },
  ]),
  'hidden-pictures': themes([
    { id: 'all', name: '전체' },
    { id: 'home', name: '일상·우리집', icon: '🏡', query: '집|일상|우리집' },
    { id: 'forest', name: '숲속·자연', icon: '🌳', query: '숲|자연' },
    { id: 'fairytale', name: '동화·판타지', icon: '🏰', query: '동화|판타지' },
    { id: 'animals', name: '동물 친구들', icon: '🐾', query: '동물|사자' },
  ]),
  'spot-differences': themes([
    { id: 'all', name: '전체' },
    { id: 'easy', name: '초급 (3곳)', icon: '⭐', query: '초급|쉬운' },
    { id: 'medium', name: '중급 (5곳)', icon: '⭐⭐', query: '중급' },
    { id: 'hard', name: '고급 (7곳+)', icon: '⭐⭐⭐', query: '고급|어려운' },
  ]),
  maze: themes([
    { id: 'all', name: '전체' },
    { id: 'easy', name: '쉬운 미로', icon: '🟢', query: '초급|쉬운' },
    { id: 'medium', name: '기본 미로', icon: '🟡', query: '중급|기본' },
    { id: 'hard', name: '도전 미로', icon: '🔴', query: '고급|도전|어려운' },
  ]),
  'dot-to-dot': themes([
    { id: 'all', name: '전체' },
    { id: 'num-20', name: '숫자 1-20', icon: '🔢', query: '숫자|1-20|1~20' },
    { id: 'num-50', name: '숫자 1-50', icon: '🔢', query: '숫자|1-50|1~50' },
    { id: 'alpha', name: '알파벳 순서', icon: '🔤', query: '알파벳' },
  ]),
  'shadow-match': themes([
    { id: 'all', name: '전체' },
    { id: 'animals', name: '동물 그림자', icon: '🐶', query: '동물' },
    { id: 'vehicles', name: '탈것 그림자', icon: '🚗', query: '탈것|자동차' },
    { id: 'objects', name: '사물·음식', icon: '🍎', query: '사물|음식|과일' },
  ]),
  'routine-charts': themes([
    { id: 'all', name: '전체' },
    { id: 'morning', name: '아침 루틴', icon: '☀️', query: '아침|루틴' },
    { id: 'bedtime', name: '잠자리 루틴', icon: '🌙', query: '잠자리|저녁|루틴' },
    { id: 'hygiene', name: '양치·손씻기', icon: '🪥', query: '양치|손씻기|위생' },
    { id: 'cleanup', name: '정리정돈', icon: '🧸', query: '정리|정돈|습관' },
  ]),
  'emotion-cards': themes([
    { id: 'all', name: '전체' },
    { id: 'happy', name: '기쁨·행복', icon: '😊', query: '기쁨|행복|감정' },
    { id: 'sad', name: '슬픔·눈물', icon: '😢', query: '슬픔|눈물|감정' },
    { id: 'angry', name: '화남·짜증', icon: '😡', query: '화|짜증|감정' },
    { id: 'surprise', name: '놀람·두려움', icon: '😱', query: '놀람|두려움|감정' },
  ]),
  'finger-puppets': themes([
    { id: 'all', name: '전체' },
    { id: 'animals', name: '동물 인형', icon: '🐾', query: '동물|인형' },
    { id: 'characters', name: '동화 캐릭터', icon: '👑', query: '동화|캐릭터|공주' },
    { id: 'family', name: '가족 놀이', icon: '👨‍👩‍👧', query: '가족' },
  ]),
  'board-games': themes([
    { id: 'all', name: '전체' },
    { id: 'dice-race', name: '주사위 레이스', icon: '🎲', query: '주사위|레이스|보드게임' },
    { id: 'bingo', name: '빙고·OX', icon: '🎯', query: '빙고|OX|보드게임' },
    { id: 'ladder', name: '사다리 타기', icon: '🪜', query: '사다리|보드게임' },
  ]),
  seasonal: themes([
    { id: 'all', name: '전체' },
    { id: 'spring', name: '봄·입학', icon: '🌸', query: '봄|입학' },
    { id: 'summer', name: '여름·방학', icon: '☀️', query: '여름|방학' },
    { id: 'autumn', name: '가을·할로윈', icon: '🍁', query: '가을|할로윈' },
    { id: 'winter', name: '겨울·크리스마스', icon: '❄️', query: '겨울|크리스마스' },
    { id: 'birthday', name: '생일·축하', icon: '🎂', query: '생일|축하' },
  ]),
}

/** Catalog route slugs → CATEGORY_THEMES keys */
const CATEGORY_THEME_SLUG_ALIASES: Record<string, string> = {
  tracing: 'line-tracing',
  letters: 'alphabet-numbers',
  cutout: 'scissor-skills',
  ispy: 'hidden-pictures',
  'odd-one': 'spot-differences',
  dots: 'dot-to-dot',
  shadow: 'shadow-match',
  routine: 'routine-charts',
  emotion: 'emotion-cards',
  puppets: 'finger-puppets',
  'board-game': 'board-games',
  season: 'seasonal',
}

/** Older global theme query ids still used in shared URLs */
const THEME_ID_ALIASES: Record<string, string> = {
  fantasy: 'princess',
  space: 'space-robot',
  basics: 'shapes',
}

export function getCategoryThemes(slug?: string | null): ThemeOption[] | undefined {
  if (!slug) return undefined
  return CATEGORY_THEMES[slug] ?? CATEGORY_THEMES[CATEGORY_THEME_SLUG_ALIASES[slug]]
}

export function resolveCategoryThemeId(slug: string | undefined, themeId: string) {
  const options = getCategoryThemes(slug)
  if (!options) return themeId
  const mapped = THEME_ID_ALIASES[themeId] ?? themeId
  return options.some((item) => item.id === mapped) ? mapped : 'all'
}
