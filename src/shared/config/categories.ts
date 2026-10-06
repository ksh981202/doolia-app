export const CATEGORIES = [
  { id: 'coloring-pages', label: '색칠공부', emoji: '🖍️' },
  { id: 'tracing', label: '선 긋기 & 도형', emoji: '✏️' },
  { id: 'letters', label: '알파벳 & 숫자', emoji: '🔤' },
  { id: 'cutout', label: '종이 오리기 & 만들기', emoji: '✂️' },
  { id: 'doolia-friends', label: '둘리아 오리지널 프렌즈', emoji: '🐻' },
  { id: 'verified-creators', label: '공식 저작권 인증 작가관', emoji: '🛡️' },
  { id: 'ispy', label: '숨은그림찾기', emoji: '🔍' },
  { id: 'odd-one', label: '다른그림찾기', emoji: '👀' },
  { id: 'maze', label: '미로찾기', emoji: '🌀' },
  { id: 'dots', label: '점잇기', emoji: '🔢' },
  { id: 'shadow', label: '그림자 맞추기', emoji: '🧩' },
  { id: 'family-healing', label: '엄마·아빠 마음 힐링', emoji: '☕' },
  { id: 'senior-art', label: '온가족 힐링 컬러링', emoji: '🌿' },
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
  tracing: '선 긋기 & 도형',
  letters: '알파벳 & 숫자',
  cutout: '종이 오리기 & 만들기',
  'doolia-friends': '둘리아 오리지널 프렌즈',
  'verified-creators': '공식 저작권 인증 작가관',
  ispy: '숨은그림찾기',
  'odd-one': '다른그림찾기',
  maze: '미로찾기',
  dots: '점잇기',
  shadow: '그림자 맞추기',
  'family-healing': '엄마·아빠 마음 힐링',
  'senior-art': '온가족 힐링 컬러링',
  routine: '루틴 체크차트',
  emotion: '감정 매칭카드',
  puppets: '손가락인형',
  'board-game': '한장 보드게임',
  season: '시즌 & 기념일',
}

const CATEGORY_ID_SET = new Set<string>(CATEGORIES.map((item) => item.id))

/**
 * Spreadsheet / TSV / legacy DB names → canonical PrintableCategory.
 * Keys are matched case-insensitively after trim.
 */
export const CATEGORY_ALIAS_MAP: Record<string, PrintableCategory> = {
  'coloring-pages': 'coloring-pages',
  coloring: 'coloring-pages',
  색칠공부: 'coloring-pages',

  tracing: 'tracing',
  'line-tracing': 'tracing',
  line_tracing: 'tracing',
  'line tracing': 'tracing',
  '선 긋기 연습': 'tracing',
  '선 긋기 & 도형': 'tracing',
  선긋기: 'tracing',

  letters: 'letters',
  'alphabet-numbers': 'letters',
  alphabet_numbers: 'letters',
  'abc-numbers': 'letters',
  abc_numbers: 'letters',
  alphabet: 'letters',
  '알파벳 & 숫자': 'letters',
  '알파벳&숫자': 'letters',

  cutout: 'cutout',
  'scissor-skills': 'cutout',
  scissor_skills: 'cutout',
  'paper-cutting': 'cutout',
  paper_cutting: 'cutout',
  '종이 오리기': 'cutout',
  '종이 오리기 & 만들기': 'cutout',
  종이오리기: 'cutout',

  'doolia-friends': 'doolia-friends',
  doolia_friends: 'doolia-friends',
  'doolia friends': 'doolia-friends',
  '둘리아 오리지널 프렌즈': 'doolia-friends',
  둘리아프렌즈: 'doolia-friends',

  'verified-creators': 'verified-creators',
  verified_creators: 'verified-creators',
  'verified creators': 'verified-creators',
  '공식 저작권 인증 작가관': 'verified-creators',
  인증작가관: 'verified-creators',

  ispy: 'ispy',
  'hidden-pictures': 'ispy',
  hidden_pictures: 'ispy',
  'hidden-objects': 'ispy',
  hidden_objects: 'ispy',
  숨은그림찾기: 'ispy',

  'odd-one': 'odd-one',
  odd_one: 'odd-one',
  'spot-differences': 'odd-one',
  spot_differences: 'odd-one',
  'spot-difference': 'odd-one',
  spot_difference: 'odd-one',
  다른그림찾기: 'odd-one',

  maze: 'maze',
  미로찾기: 'maze',

  dots: 'dots',
  'dot-to-dot': 'dots',
  dot_to_dot: 'dots',
  점잇기: 'dots',
  numbers: 'dots',

  shadow: 'shadow',
  'shadow-match': 'shadow',
  shadow_match: 'shadow',
  'shadow-matching': 'shadow',
  shadow_matching: 'shadow',
  '그림자 맞추기': 'shadow',
  그림자맞추기: 'shadow',

  routine: 'routine',
  'routine-charts': 'routine',
  routine_charts: 'routine',
  'routine-chart': 'routine',
  routine_chart: 'routine',
  '루틴 체크차트': 'routine',
  루틴체크차트: 'routine',

  emotion: 'emotion',
  'emotion-cards': 'emotion',
  emotion_cards: 'emotion',
  '감정 매칭카드': 'emotion',
  감정매칭카드: 'emotion',

  puppets: 'puppets',
  'finger-puppets': 'puppets',
  finger_puppets: 'puppets',
  손가락인형: 'puppets',

  'board-game': 'board-game',
  board_game: 'board-game',
  'board-games': 'board-game',
  board_games: 'board-game',
  '한장 보드게임': 'board-game',
  보드게임: 'board-game',

  season: 'season',
  seasonal: 'season',
  'seasons-holidays': 'season',
  seasons_holidays: 'season',
  '시즌 & 기념일': 'season',
  '시즌&기념일': 'season',

  'family-healing': 'family-healing',
  family_healing: 'family-healing',
  'family healing': 'family-healing',
  '엄마·아빠 마음 힐링': 'family-healing',
  '엄마 아빠 마음 힐링': 'family-healing',
  마음힐링: 'family-healing',

  'senior-art': 'senior-art',
  senior_art: 'senior-art',
  'senior art': 'senior-art',
  '어르신 인지 미술': 'senior-art',
  인지미술: 'senior-art',
  '온가족 힐링 컬러링': 'senior-art',
  '성인 & 시니어 컬러링': 'senior-art',
}

/** @deprecated Use CATEGORY_ALIAS_MAP. Kept for existing imports. */
export const LEGACY_CATEGORY_ALIASES = CATEGORY_ALIAS_MAP

export function isPrintableCategory(value: string): value is PrintableCategory {
  return CATEGORY_ID_SET.has(value)
}

export function resolvePrintableCategoryId(value: string | null | undefined): PrintableCategory | '' {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  const lower = trimmed.toLowerCase()
  if (isPrintableCategory(lower)) return lower
  return CATEGORY_ALIAS_MAP[lower] ?? CATEGORY_ALIAS_MAP[trimmed] ?? ''
}

export function toPrintableCategory(value: string | null | undefined): PrintableCategory {
  return resolvePrintableCategoryId(value) || 'coloring-pages'
}

/** Canonical slug plus legacy DB/TSV values that map to it (`coloring` + `coloring-pages`). */
export function printableCategoryMatchValues(category: PrintableCategory): string[] {
  const aliases = Object.entries(CATEGORY_ALIAS_MAP)
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

export type SubtabSearchable = {
  title?: string | null
  title_ko?: string | null
  title_en?: string | null
  title_ja?: string | null
  title_zh?: string | null
  title_es?: string | null
  title_pt?: string | null
  title_de?: string | null
  title_fr?: string | null
  title_it?: string | null
  title_vi?: string | null
  tags?: string[] | null
  theme_ko?: string | null
  theme_en?: string | null
}

const LATIN_SUBTAB_TOKEN = /^[a-z0-9][a-z0-9\s'-]*$/i

function isClassificationTag(tag: string, item: SubtabSearchable) {
  const value = tag.trim().toLowerCase()
  if (!value || value === 'hidden') return true
  if (value.startsWith('cat:')) return true
  const themeKo = item.theme_ko?.trim().toLowerCase()
  const themeEn = item.theme_en?.trim().toLowerCase()
  if (themeKo && value === themeKo) return true
  if (themeEn && value === themeEn) return true
  if (value === 'coloring-pages' || value === '키즈 색칠도안') return true
  return false
}

export function subtabHaystack(item: SubtabSearchable) {
  const tags = Array.isArray(item.tags)
    ? item.tags.filter((tag) => tag && !isClassificationTag(String(tag), item))
    : []
  return [
    item.title,
    item.title_ko,
    item.title_en,
    item.title_ja,
    item.title_zh,
    item.title_es,
    item.title_pt,
    item.title_de,
    item.title_fr,
    item.title_it,
    item.title_vi,
    ...tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function latinTokenMatches(haystack: string, token: string) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s-]+')
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, 'i').test(haystack)
}

export function matchesSubtabQuery(item: SubtabSearchable, query: string) {
  const raw = query.replace(/^#/, '').trim()
  if (!raw) return true
  const haystack = subtabHaystack(item)
  return raw
    .split('|')
    .map((part) => part.trim().toLowerCase())
    .filter((token) => token.length >= 2)
    .some((token) => (LATIN_SUBTAB_TOKEN.test(token) ? latinTokenMatches(haystack, token) : haystack.includes(token)))
}

function themes(items: ThemeOption[]): ThemeOption[] {
  return items
}

export const CATEGORY_THEMES: Record<string, ThemeOption[]> = {
  'coloring-pages': themes([
    { id: 'all', name: '전체' },
    { id: 'animals', name: '귀여운 동물', icon: '🐶', query: '동물|사자' },
    { id: 'dinosaur', name: '공룡 세상', icon: '🦕', query: '공룡' },
    { id: 'vehicles', name: '자동차 & 탈것', icon: '🚗', query: '자동차|탈것|소방차|경찰차|비행기|포크레인' },
    { id: 'princess', name: '공주 & 판타지', icon: '👑', query: '공주|판타지|요정' },
    { id: 'imagination', name: '엉뚱발랄 상상나라', icon: '✨', query: '상상|판타지|환상|imagination|과자|사탕|디저트|달콤|구름|하늘섬|무지개|유니콘|페가수스|드래곤|용|버섯|소인국|요정|장난감|마법|마술|인어|해저|타임머신|시간여행|별자리|달토끼|은하|거인|그림세상|서커스' },
    { id: 'space-robot', name: '우주 & 로봇', icon: '🚀', query: '우주|로켓|로봇' },
    { id: 'food', name: '과일 & 디저트', icon: '🍓', query: '과일|디저트|음식|사과|케이크|아이스크림|딸기' },
    { id: 'sea-nature', name: '바다 & 곤충', icon: '🌊', query: '바다|곤충|물고기|고래|상어|문어|나비|벌|무당벌레' },
    { id: 'daily', name: '우리 집 & 일상', icon: '🏡', query: '집|일상|우리집|가족' },
    { id: 'jobs', name: '멋진 직업과 꿈', icon: '👮', query: '직업|경찰|소방|의사|요리사|우주비행사|선생님' },
    { id: 'sports', name: '신나는 스포츠 & 취미', icon: '⚽', query: '축구|야구|농구|태권도|수영|피아노|캠핑|자전거' },
    { id: 'seasons', name: '계절 & 기념일', icon: '🌸', query: '봄|여름|가을|겨울|크리스마스|할로윈|시즌|기념일|생일' },
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
  'doolia-friends': themes([
    { id: 'all', name: '전체' },
  ]),
  'verified-creators': themes([
    { id: 'all', name: '전체' },
  ]),
  'family-healing': themes([
    { id: 'all', name: '전체' },
  ]),
  'senior-art': themes([
    { id: 'all', name: '전체' },
    { id: 'flowers-plants', name: '아름다운 꽃 & 식물', icon: '🌸', query: '꽃|식물|화초|정원|화분|장미|튤립|해바라기|들꽃|다육이|리스|온실|flower|plant|garden' },
    { id: 'nature-landscapes', name: '평온한 자연 & 풍경', icon: '🏞️', query: '자연|풍경|숲|바다|산|호수|오솔길|등대|해변|노을|들판|캠핑|별밤|landscape|nature|scenery' },
    { id: 'healing-animals', name: '힐링 동물 & 새', icon: '🐾', query: '동물|새|고양이|강아지|사슴|나비|토끼|꿀벌|힐링동물|bird|cat|dog|healing-animals' },
    { id: 'cozy-daily', name: '따뜻한 일상 & 쉼', icon: '🏡', query: '일상|쉼|휴식|거실|창가|방|벽난로|소품|집|티타임|서재|베란다|cozy|home|daily|rest' },
    { id: 'simple-bold', name: '쉬운 큰 그림 (굵은선 & 소품)', icon: '👓', query: '큰그림|굵은선|쉬운도안|과일|사과|소품|단순도안|시니어|어르신|도자기|빵|털실|large-print|bold|simple|easy' },
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
  ocean: 'sea-nature',
  insects: 'sea-nature',
  nature: 'sea-nature',
  season: 'seasons',
  seasonal: 'seasons',
  'fairy-tales': 'sports',
  flowers: 'flowers-plants',
  landscape: 'nature-landscapes',
  memories: 'cozy-daily',
  tradition: 'simple-bold',
}

export const THEME_SUB_CATEGORIES: Record<string, ThemeOption[]> = {
  animals: [
    { id: 'all', name: '전체' },
    { id: 'puppy', name: '강아지', query: '강아지|댕댕이|puppy|dog' },
    { id: 'kitten', name: '고양이', query: '고양이|야옹이|kitten|kitty' },
    { id: 'bunny', name: '토끼', query: '토끼|아기토끼|bunny|rabbit' },
    { id: 'bear', name: '곰돌이', query: '곰돌이|아기곰|아기 곰|bear' },
    { id: 'hamster-squirrel', name: '햄스터 & 다람쥐', query: '햄스터|다람쥐|hamster|squirrel' },
    { id: 'fox-wolf', name: '아기 여우 & 늑대', query: '여우|늑대|fox|wolf' },
    { id: 'safari-predators', name: '사자 & 호랑이', query: '사자|호랑이|표범|치타|lion|tiger' },
    { id: 'panda-koala', name: '판다 & 코알라', query: '판다|코알라|팬더|panda|koala' },
    { id: 'elephant-giraffe', name: '코끼리 & 기린', query: '코끼리|기린|하마|코뿔소|elephant|giraffe' },
    { id: 'monkey-sloth', name: '원숭이 & 나무늘보', query: '원숭이|나무늘보|침팬지|monkey|sloth' },
    { id: 'farm-animals', name: '농장 동물(소·돼지·양)', query: '농장|돼지|염소|송아지|양떼|망아지|farm|pig|cow|sheep|horse' },
    { id: 'penguin-otter', name: '펭귄 & 수달', query: '펭귄|수달|물개|penguin|otter' },
    { id: 'alpaca-deer', name: '알파카 & 사슴', query: '알파카|사슴|라마|노루|alpaca|deer' },
  ],
  dinosaur: [
    { id: 'all', name: '전체' },
    { id: 'tyrannosaurus', name: '티라노사우루스', query: '티라노|티라노사우루스|tyrannosaurus|t-rex' },
    { id: 'brachiosaurus', name: '브라키오사우루스', query: '브라키오|브라키오사우루스|초식공룡|brachiosaurus' },
    { id: 'triceratops', name: '트리케라톱스', query: '트리케라|트리케라톱스|triceratops' },
    { id: 'stegosaurus', name: '스테고사우루스', query: '스테고|스테고사우루스|stegosaurus' },
    { id: 'pterosaur', name: '하늘 익룡(프테라노돈)', query: '익룡|프테라노돈|pteranodon|pterosaur' },
    { id: 'spinosaurus', name: '스피노사우루스', query: '스피노|스피노사우루스|spinosaurus' },
    { id: 'baby-dino', name: '아기 공룡과 알', query: '아기공룡|공룡알|부화|baby dino' },
    { id: 'ankylosaurus', name: '안킬로사우루스', query: '안킬로|안킬로사우루스|ankylosaurus' },
    { id: 'velociraptor', name: '벨로키랍토르', query: '벨로시|벨로키|랍토르|velociraptor' },
    { id: 'marine-reptiles', name: '바다 파충류(모사사우루스)', query: '모사사우루스|플레시오|바다공룡|mosasaurus' },
    { id: 'dino-safari', name: '공룡 화석 & 사파리', query: '화석|공룡탐험|사파리|fossil|safari' },
  ],
  vehicles: [
    { id: 'all', name: '전체' },
    { id: 'police-car', name: '경찰차', query: '경찰차|순찰차|police car' },
    { id: 'fire-truck', name: '소방차', query: '소방차|fire truck' },
    { id: 'ambulance', name: '구급차', query: '구급차|ambulance' },
    { id: 'heavy-equipment', name: '중장비·포크레인', query: '중장비|포크레인|굴착기|덤프트럭|레미콘|excavator' },
    { id: 'train', name: '기차 & 지하철', query: '기차|지하철|열차|고속열차|ktx|train' },
    { id: 'airplane-heli', name: '비행기 & 헬리콥터', query: '비행기|헬리콥터|헬기|여객기|airplane|helicopter' },
    { id: 'ship-submarine', name: '배 & 잠수함', query: '잠수함|유람선|보트|선박|ship|submarine' },
    { id: 'city-bus-taxi', name: '시내버스 & 택시', query: '버스|타요|택시|스쿨버스|bus|taxi' },
    { id: 'sports-car', name: '멋진 슈퍼카 & 레이싱카', query: '스포츠카|슈퍼카|레이싱|레이싱카|sports car' },
    { id: 'truck-tractor', name: '트럭 & 트랙터', query: '트럭|트랙터|농기계|화물차|truck|tractor' },
  ],
  princess: [
    { id: 'all', name: '전체' },
    { id: 'dress-princess', name: '드레스 공주님', query: '드레스|왕관|티아라|dress' },
    { id: 'prince-knight', name: '왕자님 & 기사', query: '왕자|기사|검객|갑옷|knight|prince' },
    { id: 'fairy', name: '숲속 꽃 요정', query: '꽃요정|꽃 요정|숲속 요정|fairy' },
    { id: 'unicorn-pegasus', name: '유니콘 & 페가수스', query: '유니콘|페가수스|날개달린말|unicorn|pegasus' },
    { id: 'castle-palace', name: '마법의 성 & 궁전', query: '궁전|캐슬|마법성|castle|palace' },
    { id: 'mermaid-princess', name: '바닷속 인어공주', query: '인어|인어공주|mermaid' },
    { id: 'baby-dragon', name: '아기 드래곤', query: '드래곤|아기용|dragon' },
    { id: 'magic-wand-jewel', name: '마법 지팡이 & 보석', query: '지팡이|보석|마법봉|wand|jewel' },
  ],
  imagination: [
    { id: 'all', name: '전체' },
    { id: 'sweets-planet', name: '과자·디저트 행성', query: '과자|사탕|사탕나무|과자집|아이스크림|달콤|sweet|candy' },
    { id: 'cloud-world', name: '구름 위 세상', query: '하늘섬|구름|무지개|하늘나라|별빛|sky|cloud|rainbow' },
    { id: 'mythical-animals', name: '신비한 상상 동물', query: '환상동물|신비한동물|유니콘|페가수스|드래곤|불사조|unicorn|dragon' },
    { id: 'fairy-forest', name: '소인국과 숲속 요정', query: '버섯마을|소인국|숲속요정|버섯집|도토리|fairy|elf' },
    { id: 'living-toys', name: '깨어나는 장난감', query: '장난감|장난감의밤|살아있는장난감|인형나라|toy|toys' },
    { id: 'magic-school', name: '마법 학교와 신비한 숲', query: '마법|마술|마법사|빗자루|마법학교|magic|wizard' },
    { id: 'mermaid-kingdom', name: '바닷속 인어도시', query: '바닷속도시|인어|인어공주|산호궁전|해저도시|mermaid|atlantis' },
    { id: 'time-travel', name: '비밀 타임머신 여행', query: '시간여행|타임머신|시간탐험|과거여행|미래도시|timetravel' },
    { id: 'star-galaxy', name: '달토끼와 별빛 은하', query: '별자리|은하수|달토끼|별나라|오로라|galaxy|constellation' },
    { id: 'giant-world', name: '거인 나라의 신기한 하루', query: '거인|거인나라|빅사이즈|giant' },
    { id: 'living-paintings', name: '그림이 살아나는 방', query: '그림세상|마법붓|살아나는그림|artworld|drawing' },
    { id: 'flying-circus', name: '하늘 환상 서커스', query: '서커스|유랑단|공중곡예|circus' },
  ],
  'space-robot': [
    { id: 'all', name: '전체' },
    { id: 'rocket-spaceship', name: '로켓 & 우주선', query: '우주선|우주왕복선|로켓선|rocket|spaceship' },
    { id: 'astronaut', name: '우주비행사', query: '우주비행사|우주복|astronaut' },
    { id: 'planets-solar', name: '신비한 행성과 태양계', query: '행성|태양계|토성|지구|planet|solar|moon' },
    { id: 'alien-ufo', name: '외계인 & UFO', query: '외계인|ufo|외계 행성|외계행성|alien' },
    { id: 'transform-robot', name: '변신 로봇 & 메카', query: '변신 로봇|변신로봇|합체로봇|메카|mecha' },
    { id: 'cute-helper-bot', name: '귀여운 반려 로봇', query: '반려로봇|아기로봇|귀여운로봇|helper bot' },
    { id: 'future-city', name: '미래 우주 도시', query: '우주도시|미래도시|space station' },
  ],
  food: [
    { id: 'all', name: '전체' },
    { id: 'fresh-fruits', name: '달콤한 과일들', query: '딸기|사과|바나나|포도|수박|오렌지|fruit' },
    { id: 'sweet-desserts', name: '케이크 & 컵케이크', query: '케이크|컵케이크|롤케이크|cake|cupcake' },
    { id: 'icecream', name: '아이스크림 & 빙수', query: '아이스크림|소프트콘|빙수|ice cream' },
    { id: 'candy-cookie', name: '사탕·도넛 & 쿠키', query: '사탕|도넛|쿠키|마카롱|초콜릿|candy|donut' },
    { id: 'healthy-veggies', name: '싱싱한 채소 친구들', query: '당근|토마토|브로콜리|채소|야채|vegetable' },
    { id: 'delicious-meal', name: '맛있는 음식(피자·버거)', query: '피자|햄버거|김밥|스파게티|식사|meal|pizza' },
  ],
  'sea-nature': [
    { id: 'all', name: '전체' },
    { id: 'whale-shark', name: '고래 & 상어', query: '거대 고래|범고래|상어|whale|shark' },
    { id: 'sea-turtle-dolphin', name: '바다거북 & 돌고래', query: '바다거북|돌고래|거북이|dolphin|turtle' },
    { id: 'tropical-fish', name: '열대어 & 해파리', query: '열대어|해파리|니모|물고기|fish|jellyfish' },
    { id: 'octopus-crab', name: '문어·오징어 & 꽃게', query: '문어|오징어|꽃게|소라|octopus|crab' },
    { id: 'coral-ocean', name: '산호초 & 바닷속 풍경', query: '산호초|바닷속|해저|coral|reef' },
    { id: 'beetles-bugs', name: '장수풍뎅이 & 사슴벌레', query: '장수풍뎅이|사슴벌레|투구벌레|beetle' },
    { id: 'butterfly-ladybug', name: '나비 & 무당벌레', query: '나비|무당벌레|잠자리|butterfly|ladybug' },
  ],
  daily: [
    { id: 'all', name: '전체' },
    { id: 'my-room-house', name: '내 방 & 우리 집', query: '내방|우리집|침대|거실|house|room' },
    { id: 'playground-park', name: '놀이터 & 공원 산책', query: '놀이터|미끄럼틀|그네|공원|playground' },
    { id: 'school-kindergarten', name: '유치원 & 학교 생활', query: '유치원|어린이집|학교|교실|kindergarten|school' },
    { id: 'bath-bedtime', name: '목욕 & 코코 자는 시간', query: '목욕|비누방울|잠자리|코코|bath|bedtime' },
    { id: 'cooking-play', name: '주방 요리 & 마트 놀이', query: '요리|주방|마트|시장놀이|cooking|market' },
  ],
  jobs: [
    { id: 'all', name: '전체' },
    { id: 'police-officer', name: '용감한 경찰관', query: '경찰관|포돌이|police officer' },
    { id: 'firefighter', name: '출동 소방관', query: '소방관|구조대|firefighter' },
    { id: 'doctor-nurse', name: '의사 & 간호사 선생님', query: '의사|간호사|병원|치과의사|doctor|nurse' },
    { id: 'chef-baker', name: '요리사 & 파티시에', query: '요리사|셰프|제과사|파티시에|chef|baker' },
    { id: 'pilot-captain', name: '비행기 조종사 & 선장', query: '조종사|파일럿|선장|pilot|captain' },
    { id: 'astronaut-job', name: '우주비행사 & 과학자', query: '우주비행사|과학자|연구원|scientist|astronaut' },
    { id: 'artist-musician', name: '화가 & 뮤지션', query: '화가|음악가|가수|피아니스트|artist|musician' },
    { id: 'teacher', name: '다정한 선생님', query: '선생님|교사|교수|teacher' },
  ],
  sports: [
    { id: 'all', name: '전체' },
    { id: 'soccer', name: '축구왕 & 골키퍼', query: '축구|축구선수|골키퍼|soccer' },
    { id: 'baseball', name: '홈런왕 야구', query: '야구|타자|투수|baseball' },
    { id: 'basketball', name: '점프 슛 농구', query: '농구|농구선수|basketball' },
    { id: 'taekwondo', name: '씩씩한 태권도 & 무도', query: '태권도|유도|도복|격투|taekwondo' },
    { id: 'swimming-surfing', name: '시원한 수영 & 서핑', query: '수영|서핑|물놀이|swimming|surfing' },
    { id: 'music-instrument', name: '피아노 & 악기 연주', query: '피아노|기타|드럼|바이올린|piano|instrument' },
    { id: 'camping-adventure', name: '신나는 캠핑 & 탐험', query: '캠핑|텐트|탐험|모닥불|camping' },
    { id: 'skate-bicycle', name: '스케이트 & 자전거', query: '자전거|인라인|스케이트|보드|bicycle|skate' },
  ],
  seasons: [
    { id: 'all', name: '전체' },
    { id: 'spring-picnic', name: '살랑살랑 봄 & 소풍', query: '벚꽃|소풍|새싹|봄날|spring|picnic' },
    { id: 'summer-vacation', name: '첨벙첨벙 여름 & 바캉스', query: '물놀이|해변|수박|바캉스|summer' },
    { id: 'autumn-leaves', name: '알록달록 가을 & 단풍', query: '단풍|낙엽|도토리|autumn|fall' },
    { id: 'winter-snow', name: '하얀 겨울 & 눈사람', query: '눈사람|썰매|눈꽃|winter|snow' },
    { id: 'christmas', name: '산타와 메리 크리스마스', query: '크리스마스|산타|루돌프|트리|christmas' },
    { id: 'halloween', name: '해피 할로윈 호박파티', query: '할로윈|호박|유령|마녀|halloween' },
    { id: 'birthday-party', name: '생일 축하 파티', query: '생일|생일파티|선물상자|풍선|birthday' },
  ],
  'flowers-plants': [
    { id: 'all', name: '전체' },
    { id: 'rose-tulip', name: '장미 & 튤립', query: '장미|튤립|카네이션|rose|tulip' },
    { id: 'sunflower-wild', name: '해바라기 & 들꽃', query: '해바라기|들꽃|데이지|코스모스|sunflower|wildflower' },
    { id: 'potted-plants', name: '화분 & 실내식물', query: '화분|다육이|선인장|몬스테라|plant|pot' },
    { id: 'bouquet-wreath', name: '꽃다발 & 리스', query: '꽃다발|리스|화관|꽃바구니|bouquet|wreath' },
    { id: 'garden-view', name: '유럽 정원 & 온실', query: '정원|온실|꽃길|테라스|garden' },
  ],
  'nature-landscapes': [
    { id: 'all', name: '전체' },
    { id: 'forest-path', name: '푸른 숲 & 오솔길', query: '숲속|오솔길|자작나무|forest|path' },
    { id: 'ocean-beach', name: '바다 & 해변 등대', query: '바다|등대|해변|파도|beach|ocean|lighthouse' },
    { id: 'lake-mountain', name: '호수 & 산', query: '호수|계곡|오두막|산맥|mountain|lake' },
    { id: 'sunset-field', name: '노을 & 들판', query: '노을|들판|석양|풍차|sunset|field' },
    { id: 'night-camping', name: '별밤 & 캠핑', query: '별밤|캠핑|텐트|모닥불|night|camping' },
  ],
  'healing-animals': [
    { id: 'all', name: '전체' },
    { id: 'cozy-cat', name: '창가의 고양이', query: '고양이|냥이|cat|kitten' },
    { id: 'gentle-dog', name: '정원의 강아지', query: '강아지|dog|puppy' },
    { id: 'pretty-birds', name: '예쁜 새와 나뭇가지', query: '파랑새|부엉이|참새|bird' },
    { id: 'forest-deer', name: '숲속 사슴 & 토끼', query: '사슴|토끼|다람쥐|deer|rabbit' },
    { id: 'butterfly-bee', name: '꽃과 나비 & 꿀벌', query: '나비|꿀벌|곤충|butterfly|bee' },
  ],
  'cozy-daily': [
    { id: 'all', name: '전체' },
    { id: 'living-window', name: '거실과 창가 햇살', query: '거실|창가|소파|쿠션|living-room|window' },
    { id: 'tea-dessert', name: '티타임 & 디저트', query: '티타임|찻잔|커피|마카롱|디저트접시|tea|coffee' },
    { id: 'reading-room', name: '서재와 책 읽는 시간', query: '서재|책장|촛대|독서|book|study' },
    { id: 'home-gardening', name: '베란다 홈가드닝', query: '베란다|가드닝|물뿌리개|gardening' },
    { id: 'fireplace-night', name: '벽난로와 아늑한 밤', query: '벽난로|담요|조명|fireplace' },
  ],
  'simple-bold': [
    { id: 'all', name: '전체' },
    { id: 'bold-fruits', name: '탐스러운 과일 & 채소', query: '사과|고추|포도|복숭아|과일|fruit|large-fruit' },
    { id: 'bold-tableware', name: '큼직한 찻잔 & 도자기', query: '도자기|머그잔|찻잔|그릇|tableware|cup' },
    { id: 'bold-goods', name: '털실 바구니 & 소품', query: '털실|바구니|소품|단순소품|yarn|basket' },
    { id: 'bold-flowers', name: '굵은선 큰 꽃송이', query: '큰꽃|단순꽃|굵은꽃|bold-flower' },
    { id: 'bold-bakery', name: '갓 구운 빵 & 먹거리', query: '식빵|바게트|치즈|bakery|bread' },
  ],
}

export function getThemeSubCategories(themeId?: string | null): ThemeOption[] | undefined {
  if (!themeId || themeId === 'all') return undefined
  const mapped = THEME_ID_ALIASES[themeId] ?? themeId
  const items = THEME_SUB_CATEGORIES[mapped]
  return items?.length ? items : undefined
}

const SUB_THEME_ID_ALIASES: Record<string, string | string[]> = {
  hamster: 'hamster-squirrel',
  fox: 'fox-wolf',
  safari: 'safari-predators',
  panda: 'panda-koala',
  elephant: 'elephant-giraffe',
  monkey: 'monkey-sloth',
  farm: 'farm-animals',
  penguin: 'penguin-otter',
  alpaca: 'alpaca-deer',
  tyranno: 'tyrannosaurus',
  brachio: 'brachiosaurus',
  tricera: 'triceratops',
  stego: 'stegosaurus',
  ankylo: 'ankylosaurus',
  ptera: 'pterosaur',
  spino: 'spinosaurus',
  raptor: 'velociraptor',
  plesio: 'marine-reptiles',
  fossil: 'dino-safari',
  police: ['police-car', 'police-officer'],
  fire: 'fire-truck',
  heavy: 'heavy-equipment',
  'bus-taxi': 'city-bus-taxi',
  supercar: 'sports-car',
  airplane: 'airplane-heli',
  ship: 'ship-submarine',
  'royal-princess': 'dress-princess',
  'princess-royal': 'dress-princess',
  unicorn: 'unicorn-pegasus',
  castle: 'castle-palace',
  mermaid: 'mermaid-princess',
  'dragon-pet': 'baby-dragon',
  'magic-wand': 'magic-wand-jewel',
  robot: 'transform-robot',
  rocket: 'rocket-spaceship',
  planet: 'planets-solar',
  alien: 'alien-ufo',
  'cute-bot': 'cute-helper-bot',
  'space-station': 'future-city',
  fruit: 'fresh-fruits',
  'berry-fruit': 'fresh-fruits',
  snack: 'candy-cookie',
  candy: 'candy-cookie',
  cake: 'sweet-desserts',
  fastfood: 'delicious-meal',
  'sea-turtle': 'sea-turtle-dolphin',
  shark: 'sea-turtle-dolphin',
  'sea-creatures': 'whale-shark',
  beetle: 'beetles-bugs',
  butterfly: 'butterfly-ladybug',
  'bee-ladybug': 'butterfly-ladybug',
  'my-room': 'my-room-house',
  'family-life': 'my-room-house',
  'family-time': 'my-room-house',
  playground: 'playground-park',
  kindergarten: 'school-kindergarten',
  kitchen: 'cooking-play',
  'living-room': 'my-room-house',
  doctor: 'doctor-nurse',
  chef: 'chef-baker',
  artist: 'artist-musician',
  'artist-music': 'artist-musician',
  astronaut: 'astronaut-job',
  pilot: 'pilot-captain',
  music: 'music-instrument',
  'music-hobby': 'music-instrument',
  'skate-bike': 'skate-bicycle',
  skate: 'skate-bicycle',
  swimming: 'swimming-surfing',
  camping: 'camping-adventure',
  spring: 'spring-picnic',
  summer: 'summer-vacation',
  autumn: 'autumn-leaves',
  winter: 'winter-snow',
  birthday: 'birthday-party',
  'candy-land': 'sweets-planet',
  'sweets-land': 'sweets-planet',
  'sky-island': 'cloud-world',
  mythical: 'mythical-animals',
  'mythical-creatures': 'mythical-animals',
  'tiny-world': 'fairy-forest',
  'fairy-village': 'fairy-forest',
  'magic-time': 'magic-school',
  'toy-party': 'living-toys',
  'mermaid-underwater': 'mermaid-kingdom',
  'galaxy-stars': 'star-galaxy',
  rose: 'rose-tulip',
  wildflower: 'sunflower-wild',
  botanical: 'potted-plants',
  forest: 'forest-path',
  lake: 'lake-mountain',
  'tea-time': 'tea-dessert',
}

export function resolveThemeSubId(themeId: string | undefined, subId: string) {
  const options = getThemeSubCategories(themeId)
  if (!options) return 'all'
  if (options.some((item) => item.id === subId)) return subId
  const mapped = SUB_THEME_ID_ALIASES[subId]
  const candidates = mapped == null ? [] : Array.isArray(mapped) ? mapped : [mapped]
  for (const id of candidates) {
    if (options.some((item) => item.id === id)) return id
  }
  return 'all'
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
