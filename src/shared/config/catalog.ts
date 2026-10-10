import {
  matchesPrintableCategory,
  type PrintableCategory,
} from '@/shared/config/categories'

export type CatalogSubtag = {
  id: string
  label: string
  query: string
  count?: number
}

export type CatalogTopic = {
  id: string
  label: string
  query: string
  count: number
  emoji: string
  description: string
  title: string
  subtags: CatalogSubtag[]
  categoryFilter?: PrintableCategory
}

export type CatalogGroup = {
  id: string
  label: string
  emoji: string
  subtitle?: string
  children: CatalogTopic[]
}

export type SidebarThemeLink = {
  id: string
  label: string
  emoji: string
}

export const KIDS_THEME_NAV: SidebarThemeLink[] = [
  { id: 'animals', emoji: '🐶', label: '귀여운 동물' },
  { id: 'dinosaur', emoji: '🦕', label: '공룡 세상' },
  { id: 'vehicles', emoji: '🚗', label: '자동차 & 탈것' },
  { id: 'princess', emoji: '👑', label: '공주 & 판타지' },
  { id: 'imagination', emoji: '✨', label: '엉뚱발랄 상상나라' },
  { id: 'space-robot', emoji: '🚀', label: '우주 & 로봇' },
  { id: 'food', emoji: '🍓', label: '과일 & 디저트' },
  { id: 'sea-nature', emoji: '🌊', label: '바다 & 곤충' },
  { id: 'daily', emoji: '🏡', label: '우리 집 & 일상' },
  { id: 'jobs', emoji: '👮', label: '멋진 직업과 꿈' },
  { id: 'sports', emoji: '⚽', label: '신나는 스포츠 & 취미' },
  { id: 'seasons', emoji: '🌸', label: '계절 & 기념일' },
]

export const HEALING_THEMES = [
  {
    id: 'flowers-plants',
    name: '아름다운 꽃 & 식물',
    icon: '🌸',
    query: '꽃|식물|화초|정원|화분|장미|튤립|해바라기|들꽃|flower|plant|garden',
    path: '/category/senior-art?theme=flowers-plants',
  },
  {
    id: 'nature-landscapes',
    name: '평온한 자연 & 풍경',
    icon: '🏞️',
    query: '자연|풍경|숲|바다|산|호수|오솔길|등대|해변|landscape|nature|scenery',
    path: '/category/senior-art?theme=nature-landscapes',
  },
  {
    id: 'healing-animals',
    name: '힐링 동물 & 새',
    icon: '🐾',
    query: '동물|새|고양이|강아지|사슴|나비|힐링동물|bird|cat|dog|healing-animals',
    path: '/category/senior-art?theme=healing-animals',
  },
  {
    id: 'cozy-daily',
    name: '따뜻한 일상 & 쉼',
    icon: '🏡',
    query: '일상|쉼|휴식|거실|창가|방|벽난로|소품|집|cozy|home|daily|rest',
    path: '/category/senior-art?theme=cozy-daily',
  },
  {
    id: 'simple-bold',
    name: '쉬운 큰 그림 (굵은선 & 소품)',
    icon: '👓',
    query: '큰그림|굵은선|쉬운도안|과일|사과|소품|단순도안|시니어|어르신|large-print|bold|simple|easy',
    path: '/category/senior-art?theme=simple-bold',
  },
] as const

export const SENIOR_THEME_NAV: SidebarThemeLink[] = HEALING_THEMES.map((item) => ({
  id: item.id,
  emoji: item.icon,
  label: item.name,
}))

export const SENIOR_THEMES = SENIOR_THEME_NAV

export type CatalogNavItem = {
  id: string
  name: string
  path: string
  icon?: string
  labelKey?: string
}

export type CatalogNavGroup = {
  id: string
  name: string
  icon: string
  labelKey?: string
  items: CatalogNavItem[]
}

/** 사이드바 메뉴. 놀이팁 그룹은 두지 않는다. */
export const CATALOG_NAV_GROUPS: CatalogNavGroup[] = [
  {
    id: 'kids-age',
    name: '키즈 연령별',
    labelKey: 'category.byAge',
    icon: '👶',
    items: [
      { id: 'age-2-3', name: '2~3세 (영아 첫 색칠)', labelKey: 'category.age_toddler', path: '/category/coloring-pages?age=2-3' },
      { id: 'age-4-5', name: '4~5세 (유아 창의 발달)', labelKey: 'category.age_preschool', path: '/category/coloring-pages?age=4-5' },
      { id: 'age-6-7', name: '6~7세+ (예비초등 집중)', labelKey: 'category.age_school', path: '/category/coloring-pages?age=6-7' },
    ],
  },
  {
    id: 'kids-theme',
    name: '키즈 테마별',
    labelKey: 'category.byTheme',
    icon: '🎨',
    items: KIDS_THEME_NAV.map((item) => ({
      id: item.id,
      name: item.label,
      icon: item.emoji,
      path: `/category/coloring-pages?theme=${item.id}`,
    })),
  },
  {
    id: 'senior-art',
    name: '온가족 힐링 컬러링',
    labelKey: 'category.healingColoring',
    icon: '🌿',
    items: HEALING_THEMES.map((item) => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      path: item.path,
    })),
  },
]

const COLORING_SUBTAGS: CatalogSubtag[] = [
  { id: 'all', label: '전체', query: '' },
  { id: 'animals', label: '귀여운 동물', query: '동물|사자' },
  { id: 'dinosaur', label: '공룡 세상', query: '공룡' },
  { id: 'vehicles', label: '자동차 & 탈것', query: '자동차|탈것|소방차|경찰차|비행기|포크레인' },
  { id: 'princess', label: '공주 & 판타지', query: '공주|판타지|요정' },
  { id: 'imagination', label: '엉뚱발랄 상상나라', query: '상상|동화|마법|구름|버섯|장난감|과자 마을' },
  { id: 'space-robot', label: '우주 & 로봇', query: '우주|로켓|로봇' },
  { id: 'food', label: '과일 & 디저트', query: '과일|디저트|음식|사과|케이크|아이스크림|딸기' },
  { id: 'sea-nature', label: '바다 & 곤충', query: '바다|곤충|물고기|고래|상어|문어|나비|벌|무당벌레' },
  { id: 'daily', label: '우리 집 & 일상', query: '집|일상|우리집|가족' },
  { id: 'jobs', label: '멋진 직업과 꿈', query: '직업|경찰|소방|의사|요리사|우주비행사|선생님' },
  { id: 'sports', label: '신나는 스포츠 & 취미', query: '축구|야구|농구|태권도|수영|피아노|캠핑|자전거' },
  { id: 'seasons', label: '계절 & 기념일', query: '봄|여름|가을|겨울|크리스마스|할로윈|시즌|기념일|생일' },
]

export const DEFAULT_CATEGORY_SLUG = 'coloring-pages'

/** 이전 카테고리 URL을 새 메뉴 구조로 연결한다. */
export const CATALOG_SLUG_ALIASES: Record<string, { slug: string; tag?: string }> = {
  coloring: { slug: 'coloring-pages' },
  'line-tracing': { slug: 'tracing' },
  'alphabet-numbers': { slug: 'letters' },
  'scissor-skills': { slug: 'cutout' },
  'hidden-pictures': { slug: 'ispy' },
  'spot-differences': { slug: 'odd-one' },
  'dot-to-dot': { slug: 'dots' },
  'shadow-match': { slug: 'shadow' },
  'routine-charts': { slug: 'routine' },
  'emotion-cards': { slug: 'emotion' },
  'finger-puppets': { slug: 'puppets' },
  'board-games': { slug: 'board-game' },
  seasonal: { slug: 'season' },
  vehicles: { slug: 'coloring-pages', tag: 'vehicles' },
  dinosaur: { slug: 'coloring-pages', tag: 'dinosaur' },
  animals: { slug: 'coloring-pages', tag: 'animals' },
  fantasy: { slug: 'coloring-pages', tag: 'fantasy' },
  space: { slug: 'coloring-pages', tag: 'space' },
  monsters: { slug: 'coloring-pages', tag: 'fantasy' },
  food: { slug: 'coloring-pages', tag: 'food' },
  princess: { slug: 'coloring-pages', tag: 'princess' },
  'space-robot': { slug: 'coloring-pages', tag: 'space-robot' },
  'sea-nature': { slug: 'coloring-pages', tag: 'sea-nature' },
  daily: { slug: 'coloring-pages', tag: 'daily' },
  seasons: { slug: 'coloring-pages', tag: 'seasons' },
  imagination: { slug: 'coloring-pages', tag: 'imagination' },
  jobs: { slug: 'coloring-pages', tag: 'jobs' },
  sports: { slug: 'coloring-pages', tag: 'sports' },
  'fairy-tales': { slug: 'coloring-pages', tag: 'sports' },
  sequence: { slug: 'dots' },
  'doolia-friends': { slug: 'doolia-friends' },
  'verified-creators': { slug: 'verified-creators' },
  'family-healing': { slug: 'family-healing' },
  'senior-art': { slug: 'senior-art' },
}

const ALL_ONLY: CatalogSubtag[] = [{ id: 'all', label: '전체', query: '' }]

export const CATALOG_GROUPS: CatalogGroup[] = [
  {
    id: 'kids',
    label: '키즈 테마별',
    emoji: '🎨',
    subtitle: '순수 색칠도안',
    children: [
      topic('coloring-pages', '키즈 색칠도안', '', '🖍️', 200, COLORING_SUBTAGS, {
        categoryFilter: 'coloring-pages',
        description: '주제에 맞춰 고를 수 있는 키즈 색칠도안입니다.',
      }),
    ],
  },
  {
    id: 'healing',
    label: '온가족 힐링 컬러링',
    emoji: '🌿',
    subtitle: '자연과 쉼',
    children: [
      topic('senior-art', '온가족 힐링 컬러링', '시니어|어르신|인지|힐링|꽃|자연|풍경', '🌿', 0, ALL_ONLY, {
        categoryFilter: 'senior-art',
        description: '가족과 시니어가 함께 즐기는 평온한 힐링 컬러링 도안입니다.',
      }),
    ],
  },
]

/** 초기 콘텐츠 구축 동안 사이드바에서 숨김. 라우트·타입은 유지한다. */
const CATALOG_HIDDEN_GROUP: CatalogGroup = {
  id: 'creators',
  label: '공식 캐릭터 & 크리에이터',
  emoji: '🌟',
  subtitle: '오리지널 프렌즈 & 인증 작가',
  children: [
    topic('doolia-friends', '둘리아 오리지널 프렌즈', '둘리아|프렌즈|오리지널', '🐻', 0, ALL_ONLY, {
      categoryFilter: 'doolia-friends',
      description: '둘리아 오리지널 캐릭터와 함께하는 공식 프렌즈 도안입니다.',
    }),
    topic('verified-creators', '공식 저작권 인증 작가관', '작가|크리에이터|인증', '🛡️', 0, ALL_ONLY, {
      categoryFilter: 'verified-creators',
      description: '공식 저작권 인증을 받은 크리에이터 도안을 모았습니다.',
    }),
  ],
}

/** 사이드바에서 뺀 학습지·생활 카테고리. 기존 URL/데이터를 유지한다. */
const CATALOG_LEGACY_GROUP: CatalogGroup = {
  id: 'legacy',
  label: '학습지·생활',
  emoji: '📦',
  children: [
    topic('tracing', '선 긋기 & 도형', '선따기|따라그리기|소근육|도형', '✏️', 48, ALL_ONLY, {
      categoryFilter: 'tracing',
    }),
    topic('letters', '알파벳 & 숫자', '알파벳|숫자|따라쓰기', '🔤', 150, ALL_ONLY, {
      categoryFilter: 'letters',
    }),
    topic('cutout', '종이 오리기 & 만들기', '오리기|만들기', '✂️', 16, ALL_ONLY, {
      categoryFilter: 'cutout',
    }),
    topic('ispy', '숨은그림찾기', '숨은그림|i spy', '🔍', 36, ALL_ONLY, { categoryFilter: 'ispy' }),
    topic('odd-one', '다른그림찾기', '다른하나|다른그림', '👀', 28, ALL_ONLY, { categoryFilter: 'odd-one' }),
    topic('maze', '미로찾기', '미로', '🌀', 95, ALL_ONLY, { categoryFilter: 'maze' }),
    topic('dots', '점잇기', '점잇기', '🔢', 65, ALL_ONLY, { categoryFilter: 'dots' }),
    topic('shadow', '그림자 맞추기', '그림자', '🧩', 24, ALL_ONLY, { categoryFilter: 'shadow' }),
    topic('family-healing', '엄마·아빠 마음 힐링', '힐링|마음|성인|부모', '☕', 0, ALL_ONLY, {
      categoryFilter: 'family-healing',
    }),
    topic('routine', '루틴 체크차트', '루틴', '📋', 18, ALL_ONLY, { categoryFilter: 'routine' }),
    topic('emotion', '감정 매칭카드', '감정', '😊', 20, ALL_ONLY, { categoryFilter: 'emotion' }),
    topic('puppets', '손가락인형', '손가락인형', '🦊', 16, ALL_ONLY, { categoryFilter: 'puppets' }),
    topic('board-game', '한장 보드게임', '보드게임', '🎲', 12, ALL_ONLY, { categoryFilter: 'board-game' }),
    topic('season', '시즌 & 기념일', '크리스마스|할로윈|시즌|기념일', '🎉', 130, ALL_ONLY, {
      categoryFilter: 'season',
    }),
  ],
}

const CATALOG_LOOKUP_GROUPS = [...CATALOG_GROUPS, CATALOG_HIDDEN_GROUP, CATALOG_LEGACY_GROUP]

function topic(
  id: string,
  label: string,
  query: string,
  emoji: string,
  count: number,
  subtags: CatalogSubtag[],
  extra?: { categoryFilter?: PrintableCategory; description?: string },
): CatalogTopic {
  return {
    id,
    label,
    query,
    emoji,
    count,
    subtags,
    categoryFilter: extra?.categoryFilter,
    title: `${label} 프린트 도안`,
    description:
      extra?.description ??
      `${label} 주제의 고화질 A4 선화 도안을 무료로 인쇄하세요. 가정과 교실에서 바로 쓸 수 있는 300DPI PDF입니다.`,
  }
}

export function getAllCatalogTopics(): CatalogTopic[] {
  return CATALOG_LOOKUP_GROUPS.flatMap((group) => group.children)
}

export function getCatalogTopic(slug: string | undefined) {
  if (!slug) return undefined
  for (const group of CATALOG_LOOKUP_GROUPS) {
    const child = group.children.find((item) => item.id === slug)
    if (child) return { group, topic: child }
  }
  return undefined
}

/** True when a printable belongs to a catalog topic, including legacy DB categories. */
export function matchesTopicCategory(itemCategory: string | null | undefined, topic: CatalogTopic): boolean {
  if (!topic.categoryFilter) return false
  return matchesPrintableCategory(itemCategory, topic.categoryFilter)
}

export function categoryPath(slug: string) {
  return `/category/${slug}`
}

/** 전역 검색: theme/age 등 기존 필터를 제거하고 q만 남긴다. */
export function categorySearchPath(query = '') {
  const q = query.trim()
  return `${categoryPath(DEFAULT_CATEGORY_SLUG)}${q ? `?q=${encodeURIComponent(q)}` : ''}`
}

/** 상세 페이지. 카드 클릭 시 즉시 navigate 하는 경로 (데이터 대기 없음) */
export function printablePath(slug: string) {
  return `/printable/${slug}`
}
