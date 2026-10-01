import { toPrintableCategory, type PrintableCategory } from '@/shared/config/categories'

export type { PrintableCategory }
/** Public catalog slugs used by the coloring-first sidebar. */
export type PublicPrintableCategory = 'coloring-pages' | 'senior-art'
type _AssertPublicCategories = PublicPrintableCategory extends PrintableCategory ? true : never
const _assertPublicCategories: _AssertPublicCategories = true
void _assertPublicCategories
export type NewMenuPrintableCategory =
  | 'doolia-friends'
  | 'verified-creators'
  | 'family-healing'
  | 'senior-art'
type _AssertNewMenuCategories = NewMenuPrintableCategory extends PrintableCategory ? true : never
const _assertNewMenuCategories: _AssertNewMenuCategories = true
void _assertNewMenuCategories

export type PrintableAssetType = 'bw' | 'color' | 'single' | (string & {})
export type PrintableDifficulty = 'easy' | 'normal' | 'hard'

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

/** 앱 전역에서 사용하는 정규화된 도안 모델 */
export type Printable = {
  id: string
  slug: string
  title: string
  title_ko: string
  title_en: string
  title_ja: string
  title_zh?: string
  title_es: string
  title_pt?: string
  title_de: string
  title_fr: string
  title_it?: string
  title_vi?: string
  category: PrintableCategory
  type: PrintableAssetType
  age_group: string
  age_group_en: string
  theme_ko: string
  theme_en: string
  benefit_1: string
  benefit_2: string
  benefit_3: string
  parent_guide_ko: string
  parent_guide_en: string
  parent_guide_ja: string
  parent_guide_zh?: string
  parent_guide_es: string
  parent_guide_pt?: string
  parent_guide_de: string
  parent_guide_fr: string
  parent_guide_it?: string
  parent_guide_vi?: string
  description_ko: string
  description_en: string
  description_ja: string
  description_zh?: string
  description_es: string
  description_pt?: string
  description_de: string
  description_fr: string
  description_it?: string
  description_vi?: string
  tags: string[]
  imagination_question?: string
  difficulty?: PrintableDifficulty
  image_bw_url: string
  image_color_url: string
  /** @deprecated image_color_url 사용 */
  color_image_url: string
  /** @deprecated image_bw_url 사용 */
  line_art_url: string
  pdf_url: string
  views: number
  downloads: number
  created_at: string
  published?: boolean
}

/** DB / 데모 원본. 구 컬럼명과 신규 컬럼명을 모두 받는다. */
export type PrintableInput = {
  id: string
  slug?: string | null
  title?: string | null
  title_ko?: string | null
  title_en?: string | null
  title_ja?: string | null
  title_zh?: string | null
  title_es?: string | null
  title_pt?: string | null
  title_de?: string | null
  title_fr?: string | null
  title_it?: string | null
  title_vi?: string | null
  category: PrintableCategory | string
  type?: string | null
  age_group?: string | null
  age_group_en?: string | null
  theme_ko?: string | null
  theme_en?: string | null
  benefit_1?: string | null
  benefit_2?: string | null
  benefit_3?: string | null
  parent_guide_ko?: string | null
  parent_guide_en?: string | null
  parent_guide_ja?: string | null
  parent_guide_zh?: string | null
  parent_guide_es?: string | null
  parent_guide_pt?: string | null
  parent_guide_de?: string | null
  parent_guide_fr?: string | null
  parent_guide_it?: string | null
  parent_guide_vi?: string | null
  description?: string | null
  description_ko?: string | null
  description_en?: string | null
  description_ja?: string | null
  description_zh?: string | null
  description_es?: string | null
  description_pt?: string | null
  description_de?: string | null
  description_fr?: string | null
  description_it?: string | null
  description_vi?: string | null
  tags?: string[] | null
  imagination_question?: string | null
  difficulty?: PrintableDifficulty | string | null
  image_bw_url?: string | null
  image_color_url?: string | null
  color_image_url?: string | null
  line_art_url?: string | null
  pdf_url: string
  views?: number | null
  downloads?: number | null
  created_at: string
  published?: boolean | null
}

/** DB row alias used by bulk import / select('*') mapping */
export type PrintableRow = PrintableInput

const DIFFICULTY_VALUES: PrintableDifficulty[] = ['easy', 'normal', 'hard']

function resolveDifficulty(row: PrintableInput): PrintableDifficulty | undefined {
  const raw = text(row.difficulty).toLowerCase()
  if (raw === 'easy' || raw === '초급') return 'easy'
  if (raw === 'normal' || raw === '중급') return 'normal'
  if (raw === 'hard' || raw === '고급') return 'hard'
  if (DIFFICULTY_VALUES.includes(raw as PrintableDifficulty)) return raw as PrintableDifficulty
  const hay = [row.age_group, row.age_group_en, ...(row.tags ?? [])].join(' ')
  if (/고급|어려|hard|6-7|6~7|7세/.test(hay)) return 'hard'
  if (/초급|쉬운|easy|2-3|2~3|영아/.test(hay)) return 'easy'
  if (/중급|normal|4-5|4~5/.test(hay)) return 'normal'
  return undefined
}

export function printableSlug(id: string, slug?: string | null) {
  const value = slug?.trim()
  return value || id
}

export function normalizePrintable(row: PrintableInput): Printable {
  const title_ko = (row.title_ko || row.title || '').trim()
  const title_en = (row.title_en || title_ko).trim()
  const image_bw_url = row.image_bw_url || row.line_art_url || ''
  const image_color_url = row.image_color_url || row.color_image_url || ''
  const description_ko = text(row.description_ko) || text(row.description)

  return {
    id: row.id,
    slug: printableSlug(row.id, row.slug),
    title: title_ko,
    title_ko,
    title_en,
    title_ja: text(row.title_ja),
    title_zh: text(row.title_zh),
    title_es: text(row.title_es),
    title_pt: text(row.title_pt),
    title_de: text(row.title_de),
    title_fr: text(row.title_fr),
    title_it: text(row.title_it),
    title_vi: text(row.title_vi),
    category: toPrintableCategory(row.category),
    type: text(row.type) || 'bw',
    age_group: text(row.age_group),
    age_group_en: text(row.age_group_en),
    theme_ko: text(row.theme_ko),
    theme_en: text(row.theme_en),
    benefit_1: text(row.benefit_1),
    benefit_2: text(row.benefit_2),
    benefit_3: text(row.benefit_3),
    parent_guide_ko: text(row.parent_guide_ko),
    parent_guide_en: text(row.parent_guide_en),
    parent_guide_ja: text(row.parent_guide_ja),
    parent_guide_zh: text(row.parent_guide_zh),
    parent_guide_es: text(row.parent_guide_es),
    parent_guide_pt: text(row.parent_guide_pt),
    parent_guide_de: text(row.parent_guide_de),
    parent_guide_fr: text(row.parent_guide_fr),
    parent_guide_it: text(row.parent_guide_it),
    parent_guide_vi: text(row.parent_guide_vi),
    description_ko,
    description_en: text(row.description_en),
    description_ja: text(row.description_ja),
    description_zh: text(row.description_zh),
    description_es: text(row.description_es),
    description_pt: text(row.description_pt),
    description_de: text(row.description_de),
    description_fr: text(row.description_fr),
    description_it: text(row.description_it),
    description_vi: text(row.description_vi),
    tags: row.tags ?? [],
    imagination_question: text(row.imagination_question) || undefined,
    difficulty: resolveDifficulty(row),
    image_bw_url,
    image_color_url,
    color_image_url: image_color_url,
    line_art_url: image_bw_url,
    pdf_url: row.pdf_url,
    views: row.views ?? 0,
    downloads: row.downloads ?? 0,
    created_at: row.created_at,
    published: row.published !== false,
  }
}

export function printableSearchText(item: Printable) {
  return [
    item.title,
    item.title_ko,
    item.title_en,
    item.title_ja,
    item.title_zh,
    item.title_es,
    item.title_pt,
    item.title_de,
    item.title_fr,
    item.title_it,
    item.title_vi,
    item.slug,
    item.category,
    item.theme_ko,
    item.theme_en,
    item.age_group,
    item.age_group_en,
    ...item.tags,
  ]
    .join(' ')
    .toLowerCase()
}
