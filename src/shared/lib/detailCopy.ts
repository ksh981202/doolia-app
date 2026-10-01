import type { Printable } from '@/db/types'
import i18n from '@/i18n'
import { CATEGORY_LABEL } from '@/shared/config/categories'

function blob(printable: Printable) {
  return [printable.title, printable.title_ko, printable.title_en, printable.category, ...printable.tags].join(' ')
}

export function isTrexPrintable(printable: Printable) {
  const text = blob(printable)
  return printable.id === 'demo-dino' || /티라노|t-rex/i.test(text)
}

export function detailTitle(printable: Printable, language?: string) {
  if (isTrexPrintable(printable)) return pickLocalized(printable, 'title', language) || '티라노사우루스 공룡 색칠공부'
  return pickLocalized(printable, 'title', language) || printable.title
}

function localeCode(language?: string) {
  const raw = (language || i18n.language || i18n.resolvedLanguage || 'ko').toLowerCase()
  if (raw.startsWith('zh')) return 'zh'
  return raw.slice(0, 2)
}

export function pickLocalized(
  obj: Record<string, unknown> | object | null | undefined,
  fieldPrefix: string,
  lang?: string,
): string {
  if (!obj) return ''
  let normalizedLang = (lang || i18n.language || i18n.resolvedLanguage || 'ko').toLowerCase()
  if (normalizedLang.startsWith('zh')) {
    normalizedLang = 'zh'
  } else {
    normalizedLang = normalizedLang.slice(0, 2)
  }

  const record = obj as Record<string, unknown>
  const read = (key: string) => {
    const value = record[key]
    return typeof value === 'string' && value.trim() ? value.trim() : ''
  }

  return (
    read(`${fieldPrefix}_${normalizedLang}`) ||
    read(`${fieldPrefix}_en`) ||
    read(`${fieldPrefix}_ko`) ||
    read(fieldPrefix)
  )
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

function ageRangeToken(printable: Printable) {
  if (isTrexPrintable(printable)) return '3-5'
  const candidates = [printable.age_group, printable.age_group_en, ...printable.tags]
  for (const raw of candidates) {
    const value = raw?.trim()
    if (!value) continue
    const range = value.match(/(\d+)\s*[-~–—]\s*(\d+)\s*\+?/)
    if (range) {
      const plus = Number(range[2]) >= 7 ? '+' : ''
      return `${range[1]}-${range[2]}${plus}`
    }
    const single = value.match(/^(\d+)\s*(세|歳|歲|yrs?|years?)?$/i)
    if (single) return single[1]
  }
  const joined = candidates.filter(Boolean).join(' ')
  const range = joined.match(/(\d+)\s*[-~–—]\s*(\d+)/)
  if (range) return `${range[1]}-${range[2]}`
  return ''
}

export function detailAgeLabel(printable: Printable, language?: string) {
  const lang = localeCode(language)
  const recommended = i18n.t('detail.recommended', { lng: language })
  const age = ageRangeToken(printable)

  if (!age) {
    return lang === 'ko' ? `전연령 ${recommended}` : recommended
  }

  if (lang === 'ko') return `${age}세 ${recommended}`
  if (lang === 'en') return `Ages ${age}`
  if (lang === 'es' || lang === 'pt') return `${age} años`
  if (lang === 'ja') return `${age}歳 ${recommended}`
  if (lang === 'zh') return `${age}歲 ${recommended}`
  if (lang === 'de') return `${age} Jahre`
  if (lang === 'fr') return `${age} ans`
  if (lang === 'it') return `${age} anni`
  if (lang === 'vi') return `${age} tuổi`
  return `Ages ${age}`
}

function descriptionForLanguage(printable: Printable, language?: string) {
  return pickLocalized(printable, 'description', language)
}

export function printableIntro(printable: Printable, language?: string) {
  const fromDb = descriptionForLanguage(printable, language || i18n.language || i18n.resolvedLanguage || 'ko')
  if (fromDb) return fromDb
  const age = detailAgeLabel(printable).replace(/\s*권장$/, '')
  const name = printable.title_ko || printable.title
  const text = blob(printable)
  if (/모양|도형|기초선|기하|파티/.test(text)) {
    return '동그라미, 세모, 별 모양 요정들을 색칠하며 마음을 안정시키는 기초 도형 도안입니다.'
  }
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

const BENEFIT_ALIASES: Record<string, string> = {
  관찰력: '관찰력발달',
  관찰력발달: '관찰력발달',
  관찰력집중력: '관찰력발달',
  관찰집중력: '관찰력발달',
  호기심자극: '호기심자극',
  탐구력향상: '탐구력향상',
  정서안정: '정서적안정',
  정서적안정: '정서적안정',
  소근육발달: '소근육발달',
  소근육운필력: '소근육발달',
  창의사고: '창의적사고',
  창의적사고: '창의적사고',
  색채감각: '색채감각',
  공간지각력: '공간지각력',
  손가락힘: '손가락힘',
  손가락힘강화: '손가락힘',
  집중력강화: '집중력강화',
  집중력: '집중력강화',
  과제지구력: '집중력강화',
  시각변별력: '시각인지능력',
  시각인지능력: '시각인지능력',
  감정인식: '감정인식',
  마음나누기: '마음나누기',
  공감능력: '공감능력',
  자립습관: '자립습관',
  스스로해보기: '스스로해보기',
  하루루틴감각: '하루루틴감각',
  기초학습력: '기초학습력',
  시선추적: '시선추적',
  모양인지: '모양인지',
}

const BENEFIT_I18N: Record<string, Record<string, string>> = {
  관찰력발달: {
    en: 'Observation',
    ja: '観察力',
    zh: '觀察力',
    es: 'Observación',
    pt: 'Observação',
    de: 'Beobachtung',
    fr: 'Observation',
    it: 'Osservazione',
    vi: 'Quan sát',
  },
  호기심자극: {
    en: 'Curiosity',
    ja: '好奇心',
    zh: '好奇心',
    es: 'Curiosidad',
    pt: 'Curiosidade',
    de: 'Neugier',
    fr: 'Curiosité',
    it: 'Curiosità',
    vi: 'Tò mò',
  },
  탐구력향상: {
    en: 'Exploration',
    ja: '探究心',
    zh: '探索力',
    es: 'Exploración',
    pt: 'Exploração',
    de: 'Entdeckung',
    fr: 'Exploration',
    it: 'Esplorazione',
    vi: 'Khám phá',
  },
  정서적안정: {
    en: 'Calm',
    ja: '心の安定',
    zh: '情緒穩定',
    es: 'Calma',
    pt: 'Calma',
    de: 'Ruhe',
    fr: 'Calme',
    it: 'Calma',
    vi: 'Bình yên',
  },
  소근육발달: {
    en: 'Fine Motor',
    ja: '手先の発達',
    zh: '小肌肉發展',
    es: 'Motricidad fina',
    pt: 'Motricidade fina',
    de: 'Feinmotorik',
    fr: 'Motricité fine',
    it: 'Motricità fine',
    vi: 'Vận động tinh',
  },
  창의적사고: {
    en: 'Creativity',
    ja: '創造力',
    zh: '創意思考',
    es: 'Creatividad',
    pt: 'Criatividade',
    de: 'Kreativität',
    fr: 'Créativité',
    it: 'Creatività',
    vi: 'Sáng tạo',
  },
  색채감각: {
    en: 'Color Sense',
    ja: '色彩感覚',
    zh: '色彩感知',
    es: 'Sentido del color',
    pt: 'Percepção de cor',
    de: 'Farbgefühl',
    fr: 'Sens des couleurs',
    it: 'Senso del colore',
    vi: 'Cảm nhận màu',
  },
  공간지각력: {
    en: 'Spatial Skills',
    ja: '空間認知',
    zh: '空間知覺',
    es: 'Percepción espacial',
    pt: 'Percepção espacial',
    de: 'Raumwahrnehmung',
    fr: 'Perception spatiale',
    it: 'Percezione spaziale',
    vi: 'Nhận thức không gian',
  },
  손가락힘: {
    en: 'Finger Strength',
    ja: '指の力',
    zh: '手指力',
    es: 'Fuerza de dedos',
    pt: 'Força dos dedos',
    de: 'Fingerkraft',
    fr: 'Force des doigts',
    it: 'Forza delle dita',
    vi: 'Sức ngón tay',
  },
  집중력강화: {
    en: 'Focus',
    ja: '集中力',
    zh: '專注力',
    es: 'Concentración',
    pt: 'Concentração',
    de: 'Konzentration',
    fr: 'Concentration',
    it: 'Concentrazione',
    vi: 'Tập trung',
  },
  시각인지능력: {
    en: 'Visual Skills',
    ja: '視覚認知',
    zh: '視覺辨識',
    es: 'Habilidad visual',
    pt: 'Habilidade visual',
    de: 'Visuelle Wahrnehmung',
    fr: 'Perception visuelle',
    it: 'Abilità visiva',
    vi: 'Nhận thức thị giác',
  },
  감정인식: {
    en: 'Emotions',
    ja: '感情理解',
    zh: '情緒辨識',
    es: 'Emociones',
    pt: 'Emoções',
    de: 'Emotionen',
    fr: 'Émotions',
    it: 'Emozioni',
    vi: 'Cảm xúc',
  },
  마음나누기: {
    en: 'Sharing',
    ja: '気持ちの共有',
    zh: '分享心情',
    es: 'Compartir',
    pt: 'Compartilhar',
    de: 'Teilen',
    fr: 'Partage',
    it: 'Condivisione',
    vi: 'Chia sẻ',
  },
  공감능력: {
    en: 'Empathy',
    ja: '共感',
    zh: '同理心',
    es: 'Empatía',
    pt: 'Empatia',
    de: 'Empathie',
    fr: 'Empathie',
    it: 'Empatia',
    vi: 'Đồng cảm',
  },
  자립습관: {
    en: 'Independence',
    ja: '自立',
    zh: '自立習慣',
    es: 'Independencia',
    pt: 'Independência',
    de: 'Selbstständigkeit',
    fr: 'Autonomie',
    it: 'Indipendenza',
    vi: 'Tự lập',
  },
  스스로해보기: {
    en: 'Self-help',
    ja: '自分でやってみる',
    zh: '自己動手',
    es: 'Autonomía',
    pt: 'Fazer sozinho',
    de: 'Selbst tun',
    fr: 'Faire seul',
    it: 'Fare da solo',
    vi: 'Tự làm',
  },
  하루루틴감각: {
    en: 'Routine',
    ja: '日常ルーティン',
    zh: '日常作息',
    es: 'Rutina',
    pt: 'Rotina',
    de: 'Routine',
    fr: 'Routine',
    it: 'Routine',
    vi: 'Thói quen',
  },
  기초학습력: {
    en: 'Early Learning',
    ja: '基礎学習',
    zh: '基礎學習',
    es: 'Aprendizaje',
    pt: 'Aprendizagem',
    de: 'Frühförderung',
    fr: 'Apprentissage',
    it: 'Apprendimento',
    vi: 'Học sớm',
  },
  시선추적: {
    en: 'Visual Tracking',
    ja: '視線追跡',
    zh: '視線追蹤',
    es: 'Seguimiento visual',
    pt: 'Rastreio visual',
    de: 'Blickführung',
    fr: 'Suivi visuel',
    it: 'Inseguimento visivo',
    vi: 'Theo dõi ánh nhìn',
  },
  모양인지: {
    en: 'Shape Recognition',
    ja: '形の認知',
    zh: '形狀辨識',
    es: 'Formas',
    pt: 'Formas',
    de: 'Formen',
    fr: 'Formes',
    it: 'Forme',
    vi: 'Nhận dạng hình',
  },
}

export function localizeBenefit(label: string, lang: string): string {
  const canonical = canonicalBenefitLabel(label)
  const code = localeCode(lang)
  if (code === 'ko') return canonical
  const key = BENEFIT_ALIASES[benefitKey(canonical)] || benefitKey(canonical)
  return BENEFIT_I18N[key]?.[code] || BENEFIT_I18N[key]?.en || canonical
}

export function brainDevelopmentPoints(printable: Printable, lang?: string): BrainPoint[] {
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
            : /모양|도형|기초선|기하/.test(text)
              ? ['정서적 안정', '관찰 집중력', '모양 인지']
              : ['창의적 사고', '소근육 발달', '색채 감각']

  const seen = new Set<string>()
  const labels: string[] = []
  for (const label of [...fromDb, ...byTheme]) {
    const key = benefitKey(label)
    if (!key || seen.has(key)) continue
    seen.add(key)
    labels.push(canonicalBenefitLabel(label))
    if (labels.length >= 3) break
  }
  const language = lang || i18n.language || i18n.resolvedLanguage || 'ko'
  return labels.map((label) => ({ label: localizeBenefit(label, language) }))
}

function toHashtag(value: string) {
  const compact = value
    .replace(/^#/, '')
    .replace(/\s+/g, '')
    .replace(/~/g, '_')
    .replace(/[^\p{L}\p{N}_]/gu, '')
  return compact ? `#${compact}` : ''
}

export function keywordChips(printable: Printable, lang?: string): string[] {
  const chips: string[] = []
  const push = (value: string) => {
    const tag = toHashtag(value)
    if (tag && !chips.includes(tag)) chips.push(tag)
  }
  const language = localeCode(lang || i18n.language || i18n.resolvedLanguage || 'ko')

  if (language !== 'ko') {
    const age = ageRangeToken(printable)
    push(age ? `Ages_${age.replace(/-/g, '_')}` : 'Kids')
    push(printable.theme_en || 'Coloring')
    push(printable.category || 'Printables')
    push('CreativeArt')
    return chips.slice(0, 6)
  }

  push(detailAgeLabel(printable, language).replace(new RegExp(`\\s*${i18n.t('detail.recommended')}$`), ''))
  if (printable.theme_ko) push(printable.theme_ko)
  else if (/도형|기초선|모양/.test(blob(printable))) push('기초선도형')
  push(CATEGORY_LABEL[printable.category])

  if (printable.category === 'coloring-pages' || /도형|기초선|모양/.test(blob(printable))) {
    push('왕쉬운색칠')
    push('굵은외곽선')
    push('소근육발달')
  }

  for (const tag of printable.tags) {
    if (/세|age|years?/i.test(tag)) continue
    push(tag)
  }

  for (const point of brainDevelopmentPoints(printable, language)) {
    push(point.label)
  }

  return chips.slice(0, 6)
}

export function printableQuestion(printable: Printable, lang: string): string {
  const localized = pickLocalized(printable, 'parent_guide', lang)
  const text = localized && localized.trim() ? localized.trim() : printable.parent_guide_ko || printable.parent_guide_en || ''

  return text.replace(/^["“]|["”]$/g, '').trim()
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
  const fromDb = splitParentGuide(printableQuestion(printable, i18n.language || i18n.resolvedLanguage || 'ko'))
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
  return i18n.t('detail.relatedTitle')
}
