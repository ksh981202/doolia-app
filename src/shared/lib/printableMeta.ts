import type { Printable } from '@/db/types'
import { CATEGORY_LABEL } from '@/shared/config/categories'

function blob(printable: Printable) {
  return [printable.title, printable.title_ko, printable.title_en, printable.slug, printable.category, ...printable.tags].join(' ')
}

export function cardCategoryMeta(printable: Printable) {
  const text = blob(printable)
  const label = subcategoryLabel(printable)
  if (/감정|SEL/.test(text)) return { emoji: '😊', label }
  if (/루틴|습관|자립/.test(text)) return { emoji: '🌅', label }
  if (/손가락인형|공감/.test(text)) return { emoji: '🤝', label }
  if (/보드게임|사회성/.test(text)) return { emoji: '🎲', label }
  if (/숨은그림|I Spy|관찰|집중|다른하나/.test(text)) return { emoji: '🎯', label }
  if (/순서|그림자|사고|미로|두뇌/.test(text)) return { emoji: '💡', label }
  if (/알파벳|숫자/.test(text)) return { emoji: '🔤', label }
  if (printable.category === 'tracing' || /선따기|따라그리기/.test(text)) return { emoji: '✏️', label }
  return { emoji: '🎨', label }
}

export function educationEffect(printable: Printable) {
  const text = blob(printable)
  if (/감정|SEL/.test(text)) return '😊 감정 표현 SEL'
  if (/루틴|습관|자립/.test(text)) return '🌅 자립 습관 형성'
  if (/손가락인형|공감/.test(text)) return '🤝 대화 & 공감'
  if (/보드게임|사회성/.test(text)) return '🎲 규칙 & 사회성'
  if (/숨은그림|I Spy|관찰|집중/.test(text)) return '🎯 집중력 & 관찰력'
  if (/다른하나/.test(text)) return '👀 논리적 사고력'
  if (/그림자/.test(text)) return '🌗 공간지각력'
  if (/순서배열/.test(text)) return '💡 원리 이해력'
  if (/미로|두뇌|사고/.test(text)) return '💡 사고력 & 지구력'
  if (/알파벳|숫자/.test(text)) return '🔤 기초 학습력'
  if (printable.category === 'tracing' || /선따기|따라그리기/.test(text)) return '✏️ 운필력 & 협응력'
  return '🎨 색감 & 표현력'
}

export function ageGroupLabel(tags: string[]) {
  const matched = tags.find((tag) => /\d+\s*-\s*\d+\s*세/.test(tag) || tag.endsWith('세'))
  if (!matched) return '만 3~6세'
  const range = matched.replace(/\s/g, '').replace(/세$/, '')
  const [from, to] = range.split('-')
  if (from && to) return `만 ${from}~${to}세`
  return `만 ${matched}`
}

export function subcategoryLabel(printable: Printable) {
  const text = blob(printable)
  if (/숨은그림|I Spy/.test(text)) return '숨은그림찾기'
  if (/다른하나/.test(text)) return '다른하나찾기'
  if (/그림자/.test(text)) return '그림자맞추기'
  if (/순서배열/.test(text)) return '순서배열'
  if (/루틴/.test(text)) return '루틴 차트'
  if (/감정/.test(text)) return '감정 SEL'
  if (/손가락인형/.test(text)) return '손가락인형'
  if (/보드게임/.test(text)) return '한장 보드게임'
  return CATEGORY_LABEL[printable.category]
}
