import type { Printable } from '@/db/types'
import i18n from '@/i18n'
import { ageGroupLabel, subcategoryLabel } from '@/shared/lib/printableMeta'

function blob(printable: Printable) {
  return [printable.title, printable.title_ko, printable.title_en, printable.category, ...printable.tags].join(' ')
}

export function isTrexPrintable(printable: Printable) {
  const text = blob(printable)
  return printable.id === 'demo-dino' || /티라노|t-rex/i.test(text)
}

export function detailTitle(printable: Printable) {
  if (isTrexPrintable(printable)) return '티라노사우루스 공룡 색칠공부'
  return printable.title
}

export function detailBrandBadge(printable: Printable) {
  const text = blob(printable)
  if (/감정|SEL|루틴|습관|손가락인형|보드게임|부모/.test(text)) {
    return { emoji: '🤝', label: 'DOOLIA FAMILY' }
  }
  if (/숨은그림|다른하나|그림자|순서|미로|두뇌|사고/.test(text) || printable.category === 'maze') {
    return { emoji: '🧠', label: 'DOOLIA BRAIN' }
  }
  return { emoji: '🎨', label: 'DOOLIA KIDS' }
}

export function detailAgeLabel(printable: Printable) {
  if (isTrexPrintable(printable)) return '만 3~5세 권장'
  return `${ageGroupLabel(printable.tags)} 권장`
}

function parentGuideForLanguage(printable: Printable) {
  const lang = (i18n.resolvedLanguage || i18n.language || 'ko').slice(0, 2)
  const byLang: Record<string, string> = {
    ko: printable.parent_guide_ko,
    en: printable.parent_guide_en,
    ja: printable.parent_guide_ja,
    es: printable.parent_guide_es,
    de: printable.parent_guide_de,
    fr: printable.parent_guide_fr,
  }
  return (
    byLang[lang]?.trim() ||
    printable.parent_guide_ko?.trim() ||
    printable.parent_guide_en?.trim() ||
    Object.values(byLang).find((value) => value?.trim())?.trim() ||
    ''
  )
}

function splitParentGuide(value: string) {
  return value
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=\.)\s+/))
    .map((part) => part.trim())
    .filter(Boolean)
}

export function educationalBenefits(printable: Printable) {
  const fromDb = [printable.benefit_1, printable.benefit_2, printable.benefit_3]
    .map((item) => item?.trim())
    .filter(Boolean)
  if (fromDb.length) return fromDb

  const text = blob(printable)
  if (/감정|SEL/.test(text)) {
    return ['😊 감정 인식 & 표현', '💬 마음 나누기 대화', '🤝 공감 능력 키우기']
  }
  if (/루틴|습관/.test(text)) {
    return ['🌅 아침 자립 습관', '✅ 스스로 해보기', '🗓️ 하루 루틴 감각']
  }
  if (/미로|숨은그림|관찰|집중/.test(text)) {
    return ['🎯 관찰력 & 집중력 향상', '🧠 시각 변별력', '⏳ 과제 지구력']
  }
  if (printable.category === 'tracing' || printable.category === 'alphabet') {
    return ['✍️ 손가락 소근육 운필력', '🔤 기초 학습력', '👀 시선 추적 & 집중']
  }
  return ['🎯 관찰·집중력', '✍️ 손가락 소근육', '🎨 색감·창의성']
}

export function parentCoachingTips(printable: Printable) {
  const fromDb = splitParentGuide(parentGuideForLanguage(printable))
  if (fromDb.length) return fromDb

  if (isTrexPrintable(printable) || printable.category === 'coloring') {
    return [
      '아이가 좋아하는 색으로 공룡을 마음껏 칠하게 해주고 정답을 강요하지 마세요.',
      '공룡 이빨이나 눈을 칠할 때 어떤 느낌인지 아이와 대화 나눠보세요.',
      '완성된 도안에 이름을 적고 방문이나 냉장고에 함께 붙여 자신감을 북돋워 주세요.',
    ]
  }
  if (/미로|숨은그림/.test(blob(printable))) {
    return [
      '정답을 바로 알려주기보다 “어디부터 볼까?”처럼 힌트만 주세요.',
      '집중이 흐트러지면 1분만 쉬었다가 다시 이어서 해 보세요.',
      '다 찾았을 때 크게 칭찬해 성취감을 남겨 주세요.',
    ]
  }
  return [
    '아이 속도에 맞춰 함께 하고, 틀려도 괜찮다고 말해 주세요.',
    '활동이 끝나면 “제일 재미있었던 부분”을 짧게 물어보세요.',
    '완성본을 눈에 띄는 곳에 붙여 반복해서 들여다보게 해 주세요.',
  ]
}

export function megaBundleCopy(printable: Printable) {
  const text = blob(printable)
  if (/공룡|티라노/.test(text)) {
    return {
      title: 'DOOLIA 공룡 두뇌발달 MEGA 패키지',
      price: '₩4,900',
      description: '공룡 색칠·미로·점잇기 50종 일괄 다운로드',
    }
  }
  return {
    title: 'DOOLIA 두뇌·습관 MEGA 패키지',
    price: '₩4,900',
    description: '색칠·두뇌놀이·루틴 활동지 50종 일괄 다운로드',
  }
}

export function relatedSectionTitle(printable: Printable) {
  const label = subcategoryLabel(printable)
  return `${label} 도안 더 보기`
}
