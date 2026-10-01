import type { Printable } from '@/types/printable'

export function getImaginationQuestion(printable: Printable) {
  const stored = printable.imagination_question?.trim()
  if (stored) return stored

  const hay = [
    printable.title_ko,
    printable.title,
    printable.theme_ko,
    printable.theme_en,
    printable.category,
    ...printable.tags,
  ]
    .join(' ')
    .toLowerCase()

  if (/공룡|티라노|브라키오|트리케라|dinosaur|dino/.test(hay)) {
    return '이 공룡은 지금 누구와 어떤 모험을 떠나고 있을까요?'
  }
  if (/모양|도형|기초선|기하|파티|shape|circle|square/.test(hay)) {
    return '어떤 모양 친구들이 파티에 모였을까? 마법이 풀리면 어떤 색으로 변할까?'
  }
  if (/공주|유니콘|요정|드래곤|마법|성|인어|princess|unicorn|fairy/.test(hay)) {
    return '마법이 풀리면 어떤 색으로 변할까요?'
  }
  if (/자동차|소방|경찰|기차|비행기|탈것|트럭|vehicle|car|truck/.test(hay)) {
    return '이 차는 오늘 누구를 도우러 출동할까요?'
  }
  if (/우주|로켓|로봇|외계|planet|rocket|robot/.test(hay)) {
    return '이 우주선은 어느 별로 모험을 떠날까요?'
  }
  if (/과자|케이크|아이스크림|과일|빵|디저트|cake|candy/.test(hay)) {
    return '제일 먼저 어떤 맛의 색깔을 칠하고 싶나요?'
  }
  if (/바다|고래|상어|물고기|나비|곤충|ocean|fish/.test(hay)) {
    return '이 친구는 바닷속 어디에서 누구를 만나고 있을까요?'
  }
  if (/직업|경찰관|소방관|의사|선생님|pilot|chef/.test(hay)) {
    return '이 주인공은 오늘 누구를 도와주고 있을까요?'
  }
  if (/꽃|정원|식물|풍경|힐링|flower|garden/.test(hay)) {
    return '이 그림 속 꽃과 나무에는 어떤 향기가 날까요?'
  }
  if (/동물|강아지|고양이|사자|토끼|곰|새|animal|puppy|cat/.test(hay)) {
    return '이 동물은 지금 누구와 어디로 여행을 떠나는 중일까요?'
  }
  if (/상상|구름|장난감|서커스|거인|imagination/.test(hay)) {
    return '이 상상의 나라에서는 다음에 어떤 일이 벌어질까요?'
  }

  return '이 그림에 나만의 색깔을 입히면, 주인공은 어떤 이야기를 시작할까요?'
}
