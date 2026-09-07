export type SituationId = 'home' | 'quick' | 'outdoor' | 'bedtime' | 'special'

export const SITUATION_ITEMS: {
  id: SituationId
  emoji: string
  title: string
  sub: string
  headline: string
  printQuery: string
  description: string
}[] = [
  {
    id: 'home',
    emoji: '🏠',
    title: '집에서 놀기',
    sub: '집콕 & 0원 재활용',
    headline: '집에서 아이와 시간을 보내야 할 때 (집콕 & 0원 재활용)',
    printQuery: '자동차|탈것|계기판|차|트럭|우주|로켓|오리기|만들기|cutout|도로|미로',
    description: '택배 상자와 휴지심 같은 집 안 재료로 바로 시작하는 0원 놀이 처방전입니다.',
  },
  {
    id: 'quick',
    emoji: '⏱️',
    title: '10분 놀이',
    sub: '1장 초집중 두뇌',
    headline: '잠깐 아이에게 집중할 놀이가 필요할 때 (1장 초집중 두뇌)',
    printQuery: '색칠|과일|굵은선|coloring|암호|미로|숫자|알파벳|퍼즐',
    description: '도안 1장으로 10분 만에 끝나는 초집중 두뇌 놀이입니다.',
  },
  {
    id: 'outdoor',
    emoji: '🚗',
    title: '외출할 때',
    sub: '차 안·식당·카페',
    headline: '차 안·식당·카페에서 아이가 지루할 때 (포터블 놀이)',
    printQuery: '숨은그림|관찰|정글|동물|틀린그림|빙고|찾기',
    description: '차 안·식당·카페 대기 시간에 스마트폰 대신 꺼내 쓰는 포터블 도안입니다.',
  },
  {
    id: 'bedtime',
    emoji: '🌙',
    title: '잠자리 전',
    sub: '불 끄고 손전등',
    headline: '잠들기 전 조용한 놀이가 필요할 때 (불 끄고 손전등)',
    printQuery: '우주|별|로켓|우주선|그림자|실루엣|오리기|cutout',
    description: '불을 낮추고 손전등으로 하루를 부드럽게 마무리하는 밤 놀이입니다.',
  },
  {
    id: 'special',
    emoji: '🎉',
    title: '특별한 날',
    sub: '파티 & 시즌 기념일',
    headline: '생일·크리스마스·할로윈처럼 특별한 날 (파티 & 기념일)',
    printQuery: '보드게임|가족|게임|주사위|생일|파티|가랜드|시즌|기념일',
    description: '주말과 기념일을 한 장 보드게임·가랜드로 특별하게 만드는 레시피입니다.',
  },
]

const SITUATION_IDS = new Set<string>(SITUATION_ITEMS.map((item) => item.id))

export function isSituationId(value: string | null | undefined): value is SituationId {
  return Boolean(value && SITUATION_IDS.has(value))
}

export function getSituation(id: string | undefined) {
  return SITUATION_ITEMS.find((item) => item.id === id)
}

export function situationPath(id: SituationId) {
  return `/situation/${id}`
}
