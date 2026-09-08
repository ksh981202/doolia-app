import type { PrintableCategory } from '@/shared/config/categories'

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

const COLORING_SUBTAGS: CatalogSubtag[] = [
  { id: 'all', label: '전체', query: '' },
  { id: 'dinosaur', label: '공룡', query: '공룡' },
  { id: 'vehicles', label: '자동차·탈것', query: '자동차|탈것|소방차|경찰차|비행기|포크레인' },
  { id: 'animals', label: '귀여운 동물', query: '동물|사자' },
  { id: 'fantasy', label: '공주·판타지', query: '공주|판타지|요정' },
  { id: 'space', label: '우주·로봇', query: '우주|로켓|로봇' },
]

export const DEFAULT_CATEGORY_SLUG = 'coloring-pages'

/** 이전 카테고리 URL을 새 메뉴 구조로 연결한다. */
export const CATALOG_SLUG_ALIASES: Record<string, { slug: string; tag?: string }> = {
  vehicles: { slug: 'coloring-pages', tag: 'vehicles' },
  dinosaur: { slug: 'coloring-pages', tag: 'dinosaur' },
  animals: { slug: 'coloring-pages', tag: 'animals' },
  fantasy: { slug: 'coloring-pages', tag: 'fantasy' },
  space: { slug: 'coloring-pages', tag: 'space' },
  monsters: { slug: 'coloring-pages', tag: 'fantasy' },
  food: { slug: 'coloring-pages' },
  sequence: { slug: 'dots' },
}

export const CATALOG_GROUPS: CatalogGroup[] = [
  {
    id: 'kids',
    label: 'DOOLIA Kids',
    emoji: '🎨',
    subtitle: '기초 학습 & 창의',
    children: [
      topic('coloring-pages', '색칠공부', '', '🎨', 200, COLORING_SUBTAGS, {
        categoryFilter: 'coloring-pages',
        description: '주제에 맞춰 고를 수 있는 고화질 색칠공부 도안입니다.',
      }),
      topic('tracing', '선 긋기 연습', '선따기|따라그리기|소근육', '✏️', 48, [
        { id: 'all', label: '전체', query: '' },
        { id: 'shape', label: '도형', query: '도형' },
        { id: 'trace', label: '선따기', query: '선따기|따라그리기' },
        { id: 'motor', label: '소근육', query: '소근육' },
      ], { categoryFilter: 'tracing' }),
      topic('letters', '알파벳 & 숫자', '알파벳|숫자|따라쓰기', '🔤', 150, [
        { id: 'all', label: '전체', query: '' },
        { id: 'abc', label: '알파벳', query: '알파벳' },
        { id: 'numbers', label: '숫자', query: '숫자' },
        { id: 'trace', label: '따라쓰기', query: '따라쓰기' },
      ], { categoryFilter: 'letters' }),
      topic('cutout', '종이 오리기', '오리기', '✂️', 16, [
        { id: 'all', label: '전체', query: '' },
        { id: 'animals', label: '동물', query: '동물' },
        { id: 'vehicles', label: '탈것', query: '탈것' },
        { id: 'season', label: '시즌', query: '크리스마스|할로윈' },
      ], { categoryFilter: 'cutout' }),
    ],
  },
  {
    id: 'brain',
    label: 'DOOLIA Brain',
    emoji: '🧠',
    subtitle: '두뇌 발달 & 사고력',
    children: [
      topic('ispy', '숨은그림찾기', '숨은그림|i spy', '🔍', 36, [
        { id: 'all', label: '전체', query: '' },
        { id: 'animals', label: '동물', query: '동물|사자' },
        { id: 'easy', label: '쉬운 관찰', query: '초급|관찰' },
      ], { categoryFilter: 'ispy' }),
      topic('odd-one', '다른그림찾기', '다른하나|다른그림', '👀', 28, [
        { id: 'all', label: '전체', query: '' },
        { id: 'animals', label: '동물', query: '동물' },
      ], { categoryFilter: 'odd-one' }),
      topic('maze', '미로찾기', '미로', '🌀', 95, [
        { id: 'all', label: '전체', query: '' },
        { id: 'easy', label: '쉬운 미로', query: '초급' },
        { id: 'dino-maze', label: '공룡 미로', query: '공룡' },
      ], { categoryFilter: 'maze' }),
      topic('dots', '점잇기', '점잇기', '🔢', 65, [
        { id: 'all', label: '전체', query: '' },
        { id: 'star', label: '별', query: '별' },
        { id: 'numbers', label: '숫자', query: '숫자' },
      ], { categoryFilter: 'dots' }),
      topic('shadow', '그림자 맞추기', '그림자', '🌗', 24, [
        { id: 'all', label: '전체', query: '' },
        { id: 'vehicles', label: '탈것', query: '탈것' },
        { id: 'animals', label: '동물', query: '동물' },
      ], { categoryFilter: 'shadow' }),
    ],
  },
  {
    id: 'family',
    label: 'DOOLIA Family',
    emoji: '🤝',
    subtitle: '부모함께 & 습관',
    children: [
      topic('routine', '루틴 체크차트', '루틴', '📋', 18, [
        { id: 'all', label: '전체', query: '' },
        { id: 'morning', label: '아침', query: '아침' },
        { id: 'habit', label: '생활습관', query: '습관' },
      ], { categoryFilter: 'routine' }),
      topic('emotion', '감정 매칭카드', '감정', '😊', 20, [
        { id: 'all', label: '전체', query: '' },
        { id: 'sel', label: 'SEL', query: 'SEL|감정표현' },
      ], { categoryFilter: 'emotion' }),
      topic('puppets', '손가락인형', '손가락인형', '🦊', 16, [
        { id: 'all', label: '전체', query: '' },
        { id: 'animals', label: '동물', query: '동물' },
      ], { categoryFilter: 'puppets' }),
      topic('board-game', '한장 보드게임', '보드게임', '🎲', 12, [
        { id: 'all', label: '전체', query: '' },
        { id: 'family', label: '가족', query: '가족' },
      ], { categoryFilter: 'board-game' }),
      topic('season', '시즌 & 기념일', '크리스마스|할로윈|시즌|기념일', '🎉', 130, [
        { id: 'all', label: '전체', query: '' },
        { id: 'xmas', label: '크리스마스', query: '크리스마스' },
        { id: 'halloween', label: '할로윈', query: '할로윈' },
        { id: 'birthday', label: '생일', query: '생일' },
      ], { categoryFilter: 'season' }),
    ],
  },
]

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
    title: `무료 ${label} 프린트 도안 (A4 PDF)`,
    description:
      extra?.description ??
      `${label} 주제의 고화질 A4 선화 도안을 무료로 인쇄하세요. 가정과 교실에서 바로 쓸 수 있는 300DPI PDF입니다.`,
  }
}

export function getCatalogTopic(slug: string | undefined) {
  if (!slug) return undefined
  for (const group of CATALOG_GROUPS) {
    const child = group.children.find((item) => item.id === slug)
    if (child) return { group, topic: child }
  }
  return undefined
}

export function categoryPath(slug: string) {
  return `/category/${slug}`
}

/** 상세 페이지. 카드 클릭 시 즉시 navigate 하는 경로 (데이터 대기 없음) */
export function printablePath(slug: string) {
  return `/printable/${slug}`
}
