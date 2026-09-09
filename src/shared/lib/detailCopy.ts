import type { Printable } from '@/db/types'
import i18n from '@/i18n'
import { CATEGORY_LABEL } from '@/shared/config/categories'
import { ageGroupLabel, formatAgeRange } from '@/shared/lib/printableMeta'

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
  if (/숨은그림|다른하나|그림자|순서|미로|두뇌|사고/.test(text) || printable.category === 'maze' || printable.category === 'ispy' || printable.category === 'odd-one' || printable.category === 'shadow' || printable.category === 'dots') {
    return { emoji: '🧠', label: 'DOOLIA BRAIN' }
  }
  return { emoji: '🎨', label: 'DOOLIA KIDS' }
}

export function detailAgeLabel(printable: Printable) {
  if (isTrexPrintable(printable)) return '3~5세 권장'
  const label =
    formatAgeRange([printable.age_group, printable.age_group_en, ...printable.tags].join(' ')) ??
    ageGroupLabel(printable.tags)
  return `${label} 권장`
}

function descriptionForLanguage(printable: Printable, language: string) {
  const lang = language.slice(0, 2)
  const byLang: Record<string, string> = {
    ko: printable.description_ko,
    en: printable.description_en,
    ja: printable.description_ja,
    es: printable.description_es,
    de: printable.description_de,
    fr: printable.description_fr,
  }
  return (
    byLang[lang]?.trim() ||
    printable.description_ko?.trim() ||
    printable.description_en?.trim() ||
    Object.values(byLang).find((value) => value?.trim())?.trim() ||
    ''
  )
}

export function printableIntro(printable: Printable, language?: string) {
  const fromDb = descriptionForLanguage(printable, language || i18n.resolvedLanguage || i18n.language || 'ko')
  if (fromDb) return fromDb
  const age = detailAgeLabel(printable).replace(/\s*권장$/, '')
  const name = printable.title_ko || printable.title
  if (printable.category === 'coloring-pages') {
    return `${age} 유아를 위한 왕쉬운 ${name} 도안입니다. 굵은 외곽선으로 처음 색칠을 시작하는 아이의 손가락 힘과 성취감을 길러줍니다.`
  }
  const category = CATEGORY_LABEL[printable.category]
  return `${age} 유아를 위한 ${name} ${category} 도안입니다. 짧은 시간에도 성취감을 느낄 수 있도록 구성했어요.`
}

export type BrainPoint = { label: string }

function stripLeadingEmoji(value: string) {
  return value.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D]+\s*/u, '').trim()
}

function benefitKey(label: string) {
  return stripLeadingEmoji(label)
    .replace(/\s+/g, '')
    .replace(/적/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase()
}

const CANONICAL_BENEFITS: Record<string, string> = {
  시각인지능력: '시각 인지능력',
  소근육발달: '소근육 발달',
  손가락힘강화: '손가락 힘 강화',
  색채감각: '색채 감각',
}

function canonicalBenefitLabel(label: string) {
  const cleaned = stripLeadingEmoji(label)
  return CANONICAL_BENEFITS[benefitKey(cleaned)] ?? cleaned
}

export function brainDevelopmentPoints(printable: Printable): BrainPoint[] {
  const fromDb = [printable.benefit_1, printable.benefit_2, printable.benefit_3]
    .map((item) => item?.trim())
    .filter(Boolean)
    .map((label) => canonicalBenefitLabel(label))

  const text = blob(printable)
  const byTheme: string[] =
    /감정|SEL/.test(text)
      ? ['감정 인식', '마음 나누기', '공감 능력']
      : /루틴|습관/.test(text)
        ? ['자립 습관', '스스로 해보기', '하루 루틴 감각']
        : printable.category === 'maze' ||
            printable.category === 'ispy' ||
            printable.category === 'odd-one' ||
            /미로|숨은그림|관찰|집중/.test(text)
          ? ['관찰력 & 집중력', '시각 변별력', '과제 지구력']
          : printable.category === 'tracing' || printable.category === 'letters'
            ? ['소근육 운필력', '기초 학습력', '시선 추적']
            : ['소근육 발달', '손가락 힘 강화', '시각 인지능력']

  const seen = new Set<string>()
  const labels: string[] = []
  for (const label of [...fromDb, ...byTheme]) {
    const key = benefitKey(label)
    if (!key || seen.has(key)) continue
    seen.add(key)
    labels.push(canonicalBenefitLabel(label))
    if (labels.length >= 3) break
  }
  return labels.map((label) => ({ label }))
}

function toHashtag(value: string) {
  const compact = value
    .replace(/^#/, '')
    .replace(/\s+/g, '')
    .replace(/~/g, '_')
    .replace(/[^\p{L}\p{N}_]/gu, '')
  return compact ? `#${compact}` : ''
}

export function keywordChips(printable: Printable): string[] {
  const chips: string[] = []
  const push = (value: string) => {
    const tag = toHashtag(value)
    if (tag && !chips.includes(tag)) chips.push(tag)
  }

  push(detailAgeLabel(printable).replace(/\s*권장$/, ''))

  for (const tag of printable.tags) {
    if (/세|age|years?/i.test(tag)) continue
    push(tag)
  }

  if (printable.theme_ko) push(printable.theme_ko)
  push(CATEGORY_LABEL[printable.category])

  if (printable.category === 'coloring-pages') {
    push('왕쉬운색칠')
    push('굵은외곽선')
    push('소근육발달')
  }

  for (const point of brainDevelopmentPoints(printable)) {
    push(point.label)
  }

  return chips.slice(0, 6)
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
  if (printable.category === 'tracing' || printable.category === 'letters') {
    return ['✍️ 손가락 소근육 운필력', '🔤 기초 학습력', '👀 시선 추적 & 집중']
  }
  return ['소근육 발달', '손가락 힘 강화', '시각적 인지능력']
}

export function parentCoachingTip(printable: Printable) {
  return parentCoachingTips(printable)[0] ?? ''
}

export function parentCoachingTips(printable: Printable) {
  const fromDb = splitParentGuide(parentGuideForLanguage(printable))
  if (fromDb.length) return fromDb

  if (isTrexPrintable(printable) || printable.category === 'coloring-pages') {
    return [
      '선을 벗어나도 괜찮으니 아이가 자유롭게 크레용을 쥐고 칠할 수 있도록 격려해 주세요.',
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

export function relatedSectionTitle(_printable?: Printable) {
  return '🎨 이 도안과 함께하면 좋은 추천 도안'
}
