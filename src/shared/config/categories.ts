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
  { id: 'senior-art', label: '어르신 인지 미술', emoji: '🌸' },
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
  'senior-art': '어르신 인지 미술',
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
    { id: 'flowers', name: '꽃 & 보태니컬 식물', icon: '🌸', query: '꽃|식물|보태니컬|정원' },
    { id: 'landscape', name: '평온한 자연 & 풍경', icon: '⛰️', query: '자연|풍경|산|들|바다|호수' },
    { id: 'memories', name: '따뜻한 추억 & 일상', icon: '🏡', query: '추억|일상|집|마을|가족' },
    { id: 'tradition', name: '한국 전통 & 쉬운 민화', icon: '🎨', query: '전통|민화|한복|한국|문양' },
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
}

export const THEME_SUB_CATEGORIES: Record<string, ThemeOption[]> = {
  animals: [
    { id: 'all', name: '전체', query: '동물|animal' },
    { id: 'puppy', name: '강아지', icon: '🐶', query: '강아지|개|포메라니안|골든리트리버|푸들|puppy|dog' },
    { id: 'kitten', name: '아기 고양이', icon: '🐱', query: '고양이|야옹이|아기고양이|kitten|cat' },
    { id: 'bunny', name: '토끼', icon: '🐰', query: '토끼|바니|bunny|rabbit' },
    { id: 'bear', name: '곰돌이', icon: '🐻', query: '곰|곰돌이|테디베어|bear' },
    { id: 'hamster', name: '햄스터 & 다람쥐', icon: '🐹', query: '햄스터|다람쥐|청설모|hamster|squirrel' },
    { id: 'fox', name: '아기 여우 & 늑대', icon: '🦊', query: '여우|아기여우|사막여우|늑대|fox' },
    { id: 'safari', name: '사자 & 호랑이', icon: '🦁', query: '사자|호랑이|치타|표범|lion|tiger' },
    { id: 'panda', name: '판다 & 코알라', icon: '🐼', query: '판다|팬더|코알라|panda|koala' },
    { id: 'elephant', name: '코끼리 & 기린', icon: '🐘', query: '코끼리|기린|얼룩말|하마|elephant|giraffe' },
    { id: 'monkey', name: '원숭이 & 나무늘보', icon: '🐵', query: '원숭이|침팬지|고릴라|나무늘보|monkey' },
    { id: 'farm', name: '농장 동물(소·돼지·양)', icon: '🐮', query: '소|돼지|양|염소|말|당나귀|farm|cow|pig|sheep' },
    { id: 'penguin', name: '펭귄 & 수달', icon: '🐧', query: '펭귄|수달|해달|바다표범|penguin|otter' },
    { id: 'alpaca', name: '알파카 & 사슴', icon: '🦙', query: '알파카|라마|사슴|노루|alpaca|deer' },
  ],
  dinosaur: [
    { id: 'all', name: '전체', query: '공룡|dinosaur' },
    { id: 'tyranno', name: '티라노사우루스', icon: '🦖', query: '티라노|티렉스|tyranno|t-rex' },
    { id: 'brachio', name: '브라키오사우루스', icon: '🦕', query: '브라키오|목긴공룡|아파토|초식공룡|brachio' },
    { id: 'tricera', name: '트리케라톱스', icon: '🦏', query: '트리케라|뿔공룡|tricera' },
    { id: 'stego', name: '스테고사우루스', icon: '⭐', query: '스테고|골판공룡|stego' },
    { id: 'ankylo', name: '안킬로사우루스', icon: '🔨', query: '안킬로|갑옷공룡|곤봉공룡|ankylo' },
    { id: 'ptera', name: '하늘 익룡(프테라)', icon: '🦅', query: '익룡|프테라|프테라노돈|ptera' },
    { id: 'spino', name: '스피노사우루스', icon: '🐊', query: '스피노|지느러미공룡|spino' },
    { id: 'raptor', name: '벨로키랍토르', icon: '⚡', query: '랩터|벨로시|벨로키|raptor' },
    { id: 'plesio', name: '바다 파충류(수장룡)', icon: '🌊', query: '플레시오|모사사우루스|바다공룡|plesio' },
    { id: 'baby-dino', name: '아기 공룡과 알', icon: '🥚', query: '아기공룡|공룡알|부화|baby dino' },
    { id: 'fossil', name: '화석 & 공룡 뼈', icon: '🦴', query: '화석|공룡뼈|발자국|fossil' },
  ],
  vehicles: [
    { id: 'all', name: '전체', query: '자동차|탈것|vehicle' },
    { id: 'police', name: '경찰차 & 출동', icon: '🚓', query: '경찰차|패트롤카|경찰|police' },
    { id: 'fire', name: '용감한 소방차', icon: '🚒', query: '소방차|사다리차|fire truck' },
    { id: 'ambulance', name: '삐뽀삐뽀 구급차', icon: '🚑', query: '구급차|앰뷸런스|ambulance' },
    { id: 'heavy', name: '포크레인 & 중장비', icon: '🚜', query: '포크레인|굴착기|불도저|덤프트럭|레미콘|heavy' },
    { id: 'bus-taxi', name: '꼬마 버스 & 택시', icon: '🚌', query: '버스|타요|택시|스쿨버스|bus|taxi' },
    { id: 'supercar', name: '스포츠카 & 레이싱카', icon: '🏎️', query: '스포츠카|슈퍼카|레이싱|레이싱카|supercar' },
    { id: 'train', name: '칙칙폭폭 기차', icon: '🚂', query: '기차|증기기관차|KTX|지하철|train' },
    { id: 'airplane', name: '비행기 & 헬리콥터', icon: '✈️', query: '비행기|항공기|헬기|헬리콥터|airplane' },
    { id: 'ship', name: '큰 배 & 잠수함', icon: '🚢', query: '배|여객선|유람선|보트|잠수함|ship' },
    { id: 'bike', name: '오토바이 & 자전거', icon: '🛵', query: '오토바이|자전거|킥보드|bike' },
  ],
  princess: [
    { id: 'all', name: '전체', query: '공주|판타지|princess' },
    { id: 'royal-princess', name: '드레스 공주님', icon: '👑', query: '공주|티아라|드레스|왕관|princess' },
    { id: 'prince-knight', name: '왕자님 & 기사', icon: '⭐', query: '왕자|기사|말탄기사|prince|knight' },
    { id: 'fairy', name: '숲속 꽃 요정', icon: '✨', query: '요정|팅커벨|날개요정|fairy' },
    { id: 'unicorn', name: '유니콘 & 페가수스', icon: '🦄', query: '유니콘|페가수스|무지개말|unicorn' },
    { id: 'castle', name: '마법의 성 & 궁전', icon: '🏰', query: '마법의성|궁전|성|castle' },
    { id: 'mermaid', name: '바닷속 인어공주', icon: '🐠', query: '인어|인어공주|조개침대|mermaid' },
    { id: 'dragon-pet', name: '아기 드래곤', icon: '🐲', query: '드래곤|아기용|마법동물|dragon' },
    { id: 'magic-wand', name: '마법 지팡이 & 보석', icon: '💎', query: '마법봉|보석|마법약|호박마차|magic' },
  ],
  'space-robot': [
    { id: 'all', name: '전체', query: '우주|로봇|space|robot' },
    { id: 'transform-robot', name: '변신 합체 로봇', icon: '🤖', query: '변신로봇|합체로봇|메카닉|robot' },
    { id: 'cute-bot', name: '귀여운 꼬마 로봇', icon: '⭐', query: '꼬마로봇|청소로봇|반려로봇|cute robot' },
    { id: 'rocket', name: '우주선 & 로켓', icon: '🚀', query: '우주선|로켓|발사대|rocket' },
    { id: 'astronaut', name: '우주비행사 탐험', icon: '🚀', query: '우주비행사|우주복|무중력|astronaut' },
    { id: 'planet', name: '태양계 행성 & 달', icon: '🌙', query: '행성|토성|목성|달|태양|지구|planet' },
    { id: 'alien', name: '외계인 친구 & UFO', icon: '👾', query: '외계인|UFO|비행접시|alien' },
    { id: 'space-station', name: '우주 정거장 & 기지', icon: '⭐', query: '인공위성|우주정거장|우주기지|satellite' },
  ],
  food: [
    { id: 'all', name: '전체', query: '음식|디저트|과일|food' },
    { id: 'berry-fruit', name: '딸기·사과·바나나', icon: '🍓', query: '딸기|사과|바나나|포도|수박|fruit' },
    { id: 'tropical', name: '오렌지·파인애플', icon: '🍍', query: '오렌지|파인애플|망고|레몬|tropical' },
    { id: 'cake', name: '생일 케이크 & 타르트', icon: '🎂', query: '케이크|타르트|조각케이크|cake' },
    { id: 'bakery', name: '갓 구운 빵 & 도넛', icon: '🍞', query: '빵|도넛|식빵|크루아상|bread|donut' },
    { id: 'icecream', name: '아이스크림 & 파르페', icon: '🍦', query: '아이스크림|소프트콘|파르페|빙수|icecream' },
    { id: 'candy', name: '달콤한 사탕 & 젤리', icon: '🍭', query: '사탕|롤리팝|젤리|초콜릿|candy' },
    { id: 'fastfood', name: '피자·햄버거·감자튀김', icon: '🍔', query: '피자|햄버거|감자튀김|샌드위치|fastfood' },
  ],
  'sea-nature': [
    { id: 'all', name: '전체', query: '바다|곤충|자연|sea|nature' },
    { id: 'whale-shark', name: '고래 & 상어', icon: '🐳', query: '고래|상어|돌고래|범고래|whale|shark' },
    { id: 'sea-turtle', name: '바다거북 & 해마', icon: '🐢', query: '바다거북|해마|문어|오징어|turtle' },
    { id: 'tropical-fish', name: '열대어 & 산호초', icon: '🐠', query: '열대어|물고기|니모|산호|clownfish' },
    { id: 'butterfly', name: '화려한 나비 & 나방', icon: '🌸', query: '나비|호랑나비|애벌레|butterfly' },
    { id: 'beetle', name: '장수풍뎅이 & 사슴벌레', icon: '🐛', query: '장수풍뎅이|사슴벌레|풍뎅이|beetle' },
    { id: 'bee-ladybug', name: '꿀벌 & 무당벌레', icon: '🐝', query: '꿀벌|벌|무당벌레|개미|bee|ladybug' },
    { id: 'pond', name: '연못 친구들(개구리·잠자리)', icon: '🐸', query: '개구리|올챙이|잠자리|pond|frog' },
  ],
  daily: [
    { id: 'all', name: '전체', query: '일상|집|daily' },
    { id: 'my-room', name: '내 방 & 장난감 상자', icon: '🧸', query: '내방|침대|장난감|인형|bedroom' },
    { id: 'living-room', name: '포근한 거실 & 소파', icon: '🏠', query: '거실|소파|TV|가구|livingroom' },
    { id: 'kitchen', name: '맛있는 주방 & 식탁', icon: '🍳', query: '주방|부엌|식탁|요리|kitchen' },
    { id: 'playground', name: '신나는 놀이터 & 공원', icon: '🎪', query: '놀이터|미끄럼틀|그네|시소|공원|playground' },
    { id: 'kindergarten', name: '유치원 & 학교생활', icon: '🏫', query: '유치원|어린이집|학교|교실|kindergarten' },
    { id: 'family-time', name: '가족과 함께하는 하루', icon: '👪', query: '가족|엄마|아빠|소풍|산책|family' },
  ],
  imagination: [
    { id: 'all', name: '전체', query: '상상|판타지|imagination' },
    { id: 'sweets-planet', name: '달콤한 과자 행성', icon: '🍭', query: '과자|디저트|사탕|사탕나무|과자집|아이스크림|달콤|케이크|젤리|초콜릿|sweet|candy|dessert' },
    { id: 'cloud-world', name: '둥실둥실 구름 세상', icon: '☁️', query: '하늘섬|구름|무지개|하늘나라|별빛|하늘미끄럼틀|sky|cloud|rainbow' },
    { id: 'mythical-animals', name: '신비한 상상 동물', icon: '🦄', query: '환상동물|신비한동물|유니콘|페가수스|드래곤|용|불사조|unicorn|dragon|creature' },
    { id: 'fairy-forest', name: '요정과 소인국 마을', icon: '🍄', query: '버섯마을|소인국|요정|숲속요정|버섯집|도토리|꽃요정|fairy|elf|gnome' },
    { id: 'living-toys', name: '깨어나는 장난감', icon: '🧸', query: '장난감|장난감의밤|살아있는장난감|인형나라|블록놀이|toy|toys|living-toy' },
    { id: 'magic-school', name: '마법 학교와 신비한 숲', icon: '🧙', query: '마법|마술|마법사|빗자루|마법학교|마법물약|별가루|magic|wizard|potion' },
    { id: 'mermaid-kingdom', name: '바닷속 인어와 환상도시', icon: '🌊', query: '바닷속도시|인어|인어공주|산호궁전|해저도시|해파리조명|mermaid|atlantis|ocean-city' },
    { id: 'time-travel', name: '비밀 타임머신 여행', icon: '⏳', query: '시간여행|타임머신|시간탐험|과거여행|미래도시|시계탑|timetravel|time-machine' },
    { id: 'star-galaxy', name: '달토끼와 별빛 은하', icon: '🌟', query: '별자리|은하수|달토끼|별나라|오로라|우주파티|galaxy|constellation|moon-rabbit' },
    { id: 'giant-world', name: '거인 나라의 신기한 하루', icon: '🎈', query: '거인|거인나라|빅사이즈|탐험|거대한|거인발자국|giant|giant-world' },
    { id: 'living-paintings', name: '그림이 살아나는 방', icon: '🎨', query: '그림세상|마법붓|살아나는그림|물감친구|스케치북세상|artworld|drawing-alive' },
    { id: 'flying-circus', name: '하늘 환상 서커스', icon: '🎪', query: '서커스|유랑단|공중곡예|환상서커스|비누방울서커스|circus|flying-circus' },
  ],
  jobs: [
    { id: 'all', name: '전체', query: '직업|꿈|job' },
    { id: 'police', name: '경찰관 & 출동', icon: '👮', query: '경찰|경찰관|순찰|police' },
    { id: 'firefighter', name: '용감한 소방관', icon: '🚒', query: '소방관|소방대원|화재진압|firefighter' },
    { id: 'doctor', name: '의사 & 간호사', icon: '💉', query: '의사|간호사|병원|청진기|doctor|nurse' },
    { id: 'chef', name: '요리사 & 파티시에', icon: '🍳', query: '요리사|셰프|제빵사|파티시에|chef|baker' },
    { id: 'astronaut-job', name: '우주비행사', icon: '🚀', query: '우주비행사|우주탐험가|astronaut' },
    { id: 'artist-music', name: '화가 & 음악가', icon: '🎨', query: '화가|화실|가수|피아니스트|artist|musician' },
    { id: 'athlete', name: '축구 & 운동선수', icon: '⚽', query: '축구선수|야구선수|올림픽|athlete' },
    { id: 'teacher', name: '다정한 선생님', icon: '📚', query: '선생님|교사|수업|teacher' },
    { id: 'pilot', name: '비행기 조종사 & 선장', icon: '✈️', query: '조종사|파일럿|선장|pilot|captain' },
  ],
  sports: [
    { id: 'all', name: '전체', query: '스포츠|운동|취미|sports' },
    { id: 'soccer', name: '축구왕 & 골키퍼', icon: '⚽', query: '축구|축구공|골키퍼|soccer' },
    { id: 'baseball', name: '홈런왕 야구', icon: '⚾', query: '야구|야구배트|투수|baseball' },
    { id: 'basketball', name: '점프 슛 농구', icon: '🏀', query: '농구|덩크슛|농구공|basketball' },
    { id: 'taekwondo', name: '씩씩한 태권도 & 무도', icon: '🥋', query: '태권도|유도|격투기|taekwondo' },
    { id: 'swimming', name: '시원한 수영 & 서핑', icon: '💧', query: '수영|수영장|다이빙|서핑|swimming' },
    { id: 'music-hobby', name: '피아노 & 악기 연주', icon: '🎹', query: '피아노|기타|드럼|바이올린|music' },
    { id: 'camping', name: '신나는 캠핑 & 탐험', icon: '🔥', query: '캠핑|텐트|모닥불|캠핑장|camping' },
    { id: 'skate', name: '스케이트 & 자전거', icon: '🚲', query: '스케이트|보드|자전거|롤러스케이트|skate' },
  ],
  seasons: [
    { id: 'all', name: '전체', query: '계절|기념일|season' },
    { id: 'spring', name: '따뜻한 봄 & 새싹', icon: '🌸', query: '봄|벚꽃|새싹|개나리|spring' },
    { id: 'summer', name: '신나는 여름 & 바캉스', icon: '☀️', query: '여름|바다|모래성|물놀이|summer' },
    { id: 'autumn', name: '알록달록 단풍 가을', icon: '🍁', query: '가을|단풍|낙엽|도토리|autumn|fall' },
    { id: 'winter', name: '하얀 겨울 & 눈사람', icon: '⛄', query: '겨울|눈|눈사람|썰매|winter|snowman' },
    { id: 'christmas', name: '메리 크리스마스', icon: '🎄', query: '크리스마스|산타|루돌프|트리|christmas' },
    { id: 'birthday', name: '생일 축하 파티', icon: '🎂', query: '생일|생일파티|선물상자|birthday' },
    { id: 'halloween', name: '해피 할로윈', icon: '🎃', query: '할로윈|호박|유령|마녀|halloween' },
    { id: 'holiday-korea', name: '설날 & 추석 명절', icon: '🪁', query: '설날|추석|한복|복주머니|떡국|korean holiday' },
  ],
  flowers: [
    { id: 'all', name: '전체' },
    { id: 'botanical', name: '보태니컬 아트', icon: '🌿', query: '보태니컬|식물|잎' },
    { id: 'wildflower', name: '들꽃 & 정원', icon: '💐', query: '들꽃|정원|꽃밭' },
    { id: 'rose', name: '장미 & 튤립', icon: '🌹', query: '장미|튤립' },
  ],
  landscape: [
    { id: 'all', name: '전체' },
    { id: 'country', name: '시골 풍경', icon: '🏡', query: '시골|마을|풍경' },
    { id: 'lake', name: '호수 & 산', icon: '⛰️', query: '호수|산|풍경' },
    { id: 'forest', name: '고요한 숲길', icon: '🌲', query: '숲|나무|숲길' },
  ],
  memories: [
    { id: 'all', name: '전체' },
    { id: 'childhood', name: '어린 시절 추억', icon: '🚲', query: '어린 시절|추억|자전거' },
    { id: 'vintage', name: '그 시절 골목길', icon: '📻', query: '골목|그 시절|빈티지' },
    { id: 'tea-time', name: '따뜻한 찻자리', icon: '🍵', query: '차|찻자리|다과' },
  ],
  tradition: [
    { id: 'all', name: '전체' },
    { id: 'minhwa', name: '전통 민화 (까치/호랑이)', icon: '🐯', query: '민화|까치|호랑이' },
    { id: 'pattern', name: '전통 문양 & 자수', icon: '🧵', query: '문양|자수|전통' },
    { id: 'hanok', name: '고즈넉한 한옥', icon: '🏯', query: '한옥|기와|전통 집' },
  ],
}

export function getThemeSubCategories(themeId?: string | null): ThemeOption[] | undefined {
  if (!themeId || themeId === 'all') return undefined
  const mapped = THEME_ID_ALIASES[themeId] ?? themeId
  const items = THEME_SUB_CATEGORIES[mapped]
  return items?.length ? items : undefined
}

const SUB_THEME_ID_ALIASES: Record<string, string> = {
  'princess-royal': 'royal-princess',
  robot: 'transform-robot',
  fruit: 'berry-fruit',
  snack: 'candy',
  'family-life': 'family-time',
  artist: 'artist-music',
  astronaut: 'astronaut-job',
  music: 'music-hobby',
  'skate-bike': 'skate',
  'sea-creatures': 'whale-shark',
  shark: 'sea-turtle',
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
}

export function resolveThemeSubId(themeId: string | undefined, subId: string) {
  const options = getThemeSubCategories(themeId)
  if (!options) return 'all'
  const mapped = SUB_THEME_ID_ALIASES[subId] ?? subId
  if (options.some((item) => item.id === mapped)) return mapped
  return options.some((item) => item.id === subId) ? subId : 'all'
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
