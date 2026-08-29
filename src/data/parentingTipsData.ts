export const PARENTING_TIP_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'motor', label: '소근육·신체' },
  { id: 'cognition', label: '인지·두뇌' },
  { id: 'emotion', label: '감정·습관' },
  { id: 'homeschool', label: '홈스쿨링' },
] as const

export type ParentingTipCategoryId = (typeof PARENTING_TIP_CATEGORIES)[number]['id']
export type ParentingTipTopicId = Exclude<ParentingTipCategoryId, 'all'>

export type ParentingTipBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }

export type ParentingTip = {
  slug: string
  title: string
  excerpt: string
  category: ParentingTipTopicId
  publishedAt: string
  readMinutes: number
  thumbnail: string
  thumbnailAlt: string
  takeaways: string[]
  blocks: ParentingTipBlock[]
}

export const PARENTING_TIPS: ParentingTip[] = [
  {
    slug: 'fine-motor-skills-development',
    title: '만 3세 소근육 발달이 아이 뇌 성장에 미치는 영향과 5가지 오감 놀이법',
    excerpt:
      '손가락을 정교하게 움직이는 힘은 글씨, 가위질, 스스로 옷 입기의 기초입니다. 만 3세 소근육을 자극하는 일상 놀이 다섯 가지를 정리했습니다.',
    category: 'motor',
    publishedAt: '2026-08-12',
    readMinutes: 7,
    thumbnail: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1400&q=80',
    thumbnailAlt: '블록과 손으로 놀이하는 아이',
    takeaways: [
      '소근육은 연필 잡기보다 ‘손가락으로 조작하는 경험’이 먼저입니다.',
      '하루 10~15분, 실패해도 되는 짧은 놀이가 집중력과 자신감을 키웁니다.',
      '색칠·선따기·오리기는 같은 손 근육을 다른 감각으로 반복 훈련합니다.',
      '아이가 손목을 들어 올리지 못하면 난이도를 한 단계 낮추세요.',
    ],
    blocks: [
      {
        type: 'p',
        text: '만 3세 전후는 손가락 끝의 힘이 눈에 띄게 정교해지는 시기입니다. 버튼을 잠그고, 스티커를 떼고, 크레용을 쥐는 작은 동작이 모여 나중에 글씨를 쓰고 가위를 다루는 토대가 됩니다. 소근육은 단순한 ‘손재주’가 아니라, 눈으로 본 것을 손이 따라가게 만드는 뇌-손 협응의 훈련입니다.',
      },
      {
        type: 'h2',
        text: '왜 만 3세 소근육이 뇌 성장과 연결될까',
      },
      {
        type: 'p',
        text: '손가락을 움직일 때 뇌는 시각, 촉각, 고유수용감각(내 손이 어디에 있는지 아는 감각)을 동시에 조율합니다. 이 조율이 반복되면 전두엽의 계획·억제 기능도 함께 단련됩니다. 그래서 소근육 놀이를 꾸준히 한 아이는 자리에 앉아 과제를 끝내는 지구력도 함께 자라는 경우가 많습니다.',
      },
      {
        type: 'p',
        text: '중요한 점은 ‘예쁘게 완성하기’가 목표가 아니라는 것입니다. 아이가 선을 삐뚤게 그려도, 색이 밖으로 나가도 괜찮습니다. 손을 쓰고, 중간에 포기하지 않고, “한 장 더 해볼까?”라고 스스로 말하는 경험이 뇌 발달의 실제 영양분입니다.',
      },
      {
        type: 'h2',
        text: '집에서 바로 하는 5가지 오감 놀이',
      },
      {
        type: 'h3',
        text: '1. 큰 선부터 따라가는 선따기',
      },
      {
        type: 'p',
        text: '점선이 굵고 간격이 넓은 도안부터 시작하세요. 아이 손을 잡아 주기보다, 출발점에 스티커를 붙여 “여기서 별까지”처럼 목적지를 분명히 해 주면 손목이 안정됩니다. 완성 후에는 “손목이 덜 들렸네”처럼 과정 칭찬을 해주세요.',
      },
      {
        type: 'h3',
        text: '2. 크레용으로 면 채우기 색칠',
      },
      {
        type: 'p',
        text: '세부 묘사보다 넓은 면을 같은 방향으로 문지르는 연습이 먼저입니다. 짧은 크레용을 쥐게 하면 손바닥 전체 힘 대신 손가락 힘을 쓰기 쉽습니다. 한 색깔만 고르게 해도 충분합니다.',
      },
      {
        type: 'h3',
        text: '3. 두꺼운 선 오리기',
      },
      {
        type: 'p',
        text: '가위질은 양손 협응의 대표 놀이입니다. 한 손은 종이를 돌리고, 다른 손은 가위를 벌렸다 오므립니다. 처음에는 직선 띠를 자르는 것만으로도 손 근육이 충분히 일합니다. 곡선은 직선이 익숙해진 뒤에 주세요.',
      },
      {
        type: 'h3',
        text: '4. 스티커·찍찍이 떼고 붙이기',
      },
      {
        type: 'p',
        text: '엄지와 검지로 얇은 가장자리를 집는 동작은 연필 그립의 준비 운동입니다. 큰 스티커를 도형 칸에 붙이는 활동은 공간 감각과 소근육을 동시에 자극합니다.',
      },
      {
        type: 'h3',
        text: '5. 점토를 밀어 길쭉하게 만들기',
      },
      {
        type: 'p',
        text: '점토를 손바닥으로 밀고 손가락으로 꼬는 과정은 손목과 손가락 관절을 고르게 씁니다. “뱀 만들기”, “국수 만들기”처럼 놀이 이름을 붙이면 아이가 더 오래 몰입합니다.',
      },
      {
        type: 'h2',
        text: '부모가 보면 좋은 신호와 조절 방법',
      },
      {
        type: 'ul',
        items: [
          '크레용을 주먹으로만 쥐고 3~4주가 지나도 변화가 없다면, 짧은 크레용이나 삼각 연필로 바꿔 보세요.',
          '과제를 1분도 버티지 못하면 한 장의 1/4만 완성하는 미니 미션으로 나누세요.',
          '아이가 “내가 할래”라고 하면 즉시 손을 떼고, 결과물보다 시도 횟수를 칭찬하세요.',
          '주먹으로 쥐기에서 세 손가락으로 쥐기로 넘어가는 속도는 아이마다 다릅니다. 또래와 비교하지 마세요.',
        ],
      },
      {
        type: 'h2',
        text: 'DOOLIA 도안과 연결하는 법',
      },
      {
        type: 'p',
        text: '소근육이 목표라면 한 번에 색칠·미로·쓰기를 섞지 마세요. 오늘은 선따기 1장, 내일은 쉬운 오리기 1장처럼 감각을 나눠 주는 편이 효과가 큽니다. 만 2~3세는 굵은 선과 단순한 도형, 만 4~5세는 약간의 디테일이 있는 색칠과 쉬운 미로가 적합합니다.',
      },
    ],
  },
  {
    slug: 'coloring-book-emotional-effects',
    title: '색칠공부가 아이의 감정 조절 및 집중력 향상에 주는 3가지 놀라운 효과',
    excerpt:
      '색칠은 그냥 시간을 보내는 놀이가 아닙니다. 감정을 고르고, 주의를 한곳에 모으고, 완성 경험을 쌓는 가장 쉬운 자기조절 훈련입니다.',
    category: 'cognition',
    publishedAt: '2026-08-18',
    readMinutes: 6,
    thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1400&q=80',
    thumbnailAlt: '색연필과 색칠 도안',
    takeaways: [
      '색칠은 ‘가만히 앉아 있기’가 아니라 주의를 한 면에 고정하는 연습입니다.',
      '색을 고르는 과정 자체가 감정 어휘를 늘리는 대화 재료가 됩니다.',
      '한 장을 끝내는 경험은 “나는 할 수 있어”라는 효능감을 남깁니다.',
      '선을 넘기면 안 된다는 규칙보다, 같은 방향으로 칠하기 같은 작은 규칙이 더 효과적입니다.',
    ],
    blocks: [
      {
        type: 'p',
        text: '저녁 시간에 아이가 보채고, 부모도 지쳐 있을 때 색칠 한 장은 의외로 강력한 리셋 버튼이 됩니다. 화면처럼 빠르게 자극하지 않으면서도, 손과 눈이 같은 대상을 오래 바라보게 만들기 때문입니다. 색칠공부는 예술 활동인 동시에 감정과 주의를 조율하는 일상 훈련입니다.',
      },
      {
        type: 'h2',
        text: '효과 1. 감정을 색으로 꺼내 놓는다',
      },
      {
        type: 'p',
        text: '유아는 화가 나도 “지금 속상해”라고 말하기 어렵습니다. 대신 진한 색, 세게 문지르는 손, 같은 자리를 반복해 칠하는 움직임으로 감정을 보여 줍니다. 이때 부모가 “빨간색을 많이 썼네. 힘이 많이 들어갔구나”라고 관찰을 언어로 바꿔 주면, 아이는 자기 상태를 알아차리는 힌트를 얻습니다.',
      },
      {
        type: 'p',
        text: '완성 후 1분만 대화하세요. “가장 마음에 드는 색은 뭐야?”, “이 공룡은 지금 기분이 어떨까?”처럼 닫힌 정답 없는 질문이 감정 어휘를 늘립니다. 색칠이 SEL(사회정서학습) 교구가 되는 지점입니다.',
      },
      {
        type: 'h2',
        text: '효과 2. 주의력이 ‘한 면’에 머무른다',
      },
      {
        type: 'p',
        text: '영상은 초 단위로 장면이 바뀌지만, 색칠은 같은 윤곽 안에서 손의 왕복이 반복됩니다. 이 반복이 작업기억과 지속주의력을 가볍게 자극합니다. 처음에는 2분이면 충분합니다. 타이머를 부모 기준이 아니라 아이 호흡에 맞추세요.',
      },
      {
        type: 'h3',
        text: '집중이 금방 흩어질 때',
      },
      {
        type: 'ul',
        items: [
          '도안을 A4 전체 대신 절반 크기로 자르면 완성이 빨라져 성취감이 먼저 옵니다.',
          '한 가지 색만 쓰게 하면 선택 피로가 줄어 손에 집중하기 쉽습니다.',
          '옆에 앉아 부모도 한 장을 같이 칠하면 ‘같이 하는 리듬’이 생깁니다.',
        ],
      },
      {
        type: 'h2',
        text: '효과 3. 완성이 자기 효능감을 남긴다',
      },
      {
        type: 'p',
        text: '미로찾기나 점잇기는 정답이 있어 틀릴 수 있지만, 색칠은 실패가 거의 보이지 않습니다. “내가 만든 그림”이 냉장고에 붙는 경험은 이후 어려운 과제에 도전하는 심리적 밑천이 됩니다. 결과의 미적 완성도보다, 아이가 스스로 끝냈다는 사실이 중요합니다.',
      },
      {
        type: 'h2',
        text: '부모 코칭 한 줄',
      },
      {
        type: 'p',
        text: '선을 넘었다고 고치지 마세요. 대신 “이 부분은 같은 방향으로 칠했구나”처럼 전략을 이름 붙여 주세요. 아이는 평가가 아니라 방법을 기억합니다. 만 4~5세는 숨은그림찾기와 쉬운 미로를 색칠 뒤에 이어서 주면, 차분한 주의가 사고력 놀이로 자연스럽게 이어집니다.',
      },
    ],
  },
  {
    slug: 'daily-routine-formation-tips',
    title: '아침 전쟁 끝! 아이 스스로 움직이게 만드는 칭찬 루틴 차트 활용법',
    excerpt:
      '잔소리 대신 눈에 보이는 순서가 있으면 아이는 다음 행동을 예측합니다. 칭찬 루틴 차트로 아침을 협상 대신 게임으로 바꾸는 방법입니다.',
    category: 'emotion',
    publishedAt: '2026-08-24',
    readMinutes: 8,
    thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=80',
    thumbnailAlt: '부모와 아이가 함께 하루를 시작하는 모습',
    takeaways: [
      '루틴 차트는 훈계판이 아니라 ‘다음에 무엇을 할지’ 알려 주는 지도입니다.',
      '칸은 3~5개면 충분합니다. 많을수록 아이는 시작 전에 포기합니다.',
      '스티커는 결과(완벽)가 아니라 시도(시작)에 붙입니다.',
      '부모의 아침 말투를 한 문장으로 고정하면 잔소리가 줄어듭니다.',
    ],
    blocks: [
      {
        type: 'p',
        text: '아침이 전쟁처럼 느껴지는 이유는 아이와 부모의 목표가 다르기 때문입니다. 부모는 시간을, 아이는 놀이를 이어서 하고 싶어 합니다. 이때 말로 재촉하면 아이는 잔소리로 듣고, 오히려 옷 입기와 세안이 더 느려집니다. 루틴 차트는 사람을 다그치지 않고 순서를 밖으로 꺼내 놓는 도구입니다.',
      },
      {
        type: 'h2',
        text: '왜 차트는 ‘칭찬형’이어야 할까',
      },
      {
        type: 'p',
        text: '빈칸을 지적하는 차트는 숙제 검사와 같습니다. 유아는 평가받는 느낌이 들면 회피합니다. 반대로 한 칸을 끝낼 때마다 즉시 표시가 생기면, 뇌는 작은 보상을 학습합니다. 스티커의 핵심은 예쁘게 붙이는 것이 아니라 “방금 한 행동이 맞았다”는 피드백의 속도입니다.',
      },
      {
        type: 'h2',
        text: '처음부터 잘되는 차트 설계 4원칙',
      },
      {
        type: 'h3',
        text: '1. 칸은 적게, 그림은 크게',
      },
      {
        type: 'p',
        text: '글자를 못 읽는 아이도 아이콘만 보고 다음 행동을 알아야 합니다. ‘옷 입기 → 세수 → 아침 식사 → 가방’처럼 네 칸이면 충분합니다. 이를 닦기까지 한꺼번에 넣으면 차트 자체가 숙제처럼 보입니다.',
      },
      {
        type: 'h3',
        text: '2. 순서를 아이와 함께 정한다',
      },
      {
        type: 'p',
        text: '부모가 일방적으로 붙인 규칙은 지켜지지 않습니다. “세수 먼저일까, 옷 먼저일까?”처럼 두 가지 중 하나를 고르게 하면, 아이는 자기 결정이 담긴 규칙을 더 잘 따릅니다.',
      },
      {
        type: 'h3',
        text: '3. 언어를 한 문장으로 고정한다',
      },
      {
        type: 'p',
        text: '매일 다른 잔소리 대신, “차트에 다음이 뭐야?” 한 문장만 반복하세요. 질문이 행동을 아이 쪽으로 돌려 줍니다. 지시는 줄고, 아이는 스스로 칸을 가리키게 됩니다.',
      },
      {
        type: 'h3',
        text: '4. 보상을 거창하게 만들지 않는다',
      },
      {
        type: 'ul',
        items: [
          '매일의 보상은 스티커와 “네가 시작했어”라는 한 줄이면 됩니다.',
          '주간 보상은 주말 공원 10분, 함께 색칠 1장처럼 관계로 채워 주세요.',
          '과자·영상으로만 연결하면 차트가 협상 도구로 변질됩니다.',
        ],
      },
      {
        type: 'h2',
        text: '아침이 다시 꼬일 때 점검표',
      },
      {
        type: 'p',
        text: '차트를 붙였는데도 전쟁이 계속된다면, 대개 난이도나 환경이 문제입니다. 옷이 서랍 깊숙이 있거나, 세면대에 발판이 없으면 의지만으로 해결되지 않습니다. 아이 손이 닿는 위치에 옷을 꺼내 두고, 차트는 현관이 아니라 아이가 실제로 움직이는 동선(침대 옆, 세면대 옆)에 붙이세요.',
      },
      {
        type: 'p',
        text: '또한 전날 취침이 늦으면 어떤 차트도 힘을 잃습니다. 루틴은 아침만의 문제가 아니라 전날 저녁의 연장입니다. 저녁에 ‘내일 입을 옷 고르기’ 한 칸을 미리 끝내 두면 아침 결정 피로가 크게 줄어듭니다.',
      },
      {
        type: 'h2',
        text: 'DOOLIA 루틴 차트와 함께 쓰는 팁',
      },
      {
        type: 'p',
        text: '인쇄한 차트는 코팅하거나 클립보드에 끼워 아이가 직접 표시하게 하세요. 만 4~5세는 스스로 스티커를 붙이는 소근육 놀이까지 겸할 수 있습니다. 주 1회, 아이와 함께 “이번 주 가장 잘한 칸”을 고르는 짧은 회고가 습관을 자기 이야기로 만들어 줍니다.',
      },
    ],
  },
]

export function getParentingTip(slug: string) {
  return PARENTING_TIPS.find((item) => item.slug === slug)
}

export function getRelatedParentingTips(slug: string, limit = 3) {
  const current = getParentingTip(slug)
  const rest = PARENTING_TIPS.filter((item) => item.slug !== slug)
  const sameCategory = rest.filter((item) => item.category === current?.category)
  const others = rest.filter((item) => item.category !== current?.category)
  return [...sameCategory, ...others].slice(0, limit)
}

export function parentingTipPath(slug: string) {
  return `/parenting-tips/${slug}`
}

export function categoryLabel(id: ParentingTipTopicId) {
  return PARENTING_TIP_CATEGORIES.find((item) => item.id === id)?.label ?? id
}

export function formatTipDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-')
  return `${year}.${month}.${day}`
}
