import { toPrintableCategory, type PrintableCategory } from '@/shared/config/categories'

export type PrintableAssetType = 'bw' | 'color' | 'single' | (string & {})

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
  title_es: string
  title_de: string
  title_fr: string
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
  parent_guide_es: string
  parent_guide_de: string
  parent_guide_fr: string
  description_ko: string
  description_en: string
  description_ja: string
  description_es: string
  description_de: string
  description_fr: string
  tags: string[]
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
  title_es?: string | null
  title_de?: string | null
  title_fr?: string | null
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
  parent_guide_es?: string | null
  parent_guide_de?: string | null
  parent_guide_fr?: string | null
  description?: string | null
  description_ko?: string | null
  description_en?: string | null
  description_ja?: string | null
  description_es?: string | null
  description_de?: string | null
  description_fr?: string | null
  tags?: string[] | null
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
    title_es: text(row.title_es),
    title_de: text(row.title_de),
    title_fr: text(row.title_fr),
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
    parent_guide_es: text(row.parent_guide_es),
    parent_guide_de: text(row.parent_guide_de),
    parent_guide_fr: text(row.parent_guide_fr),
    description_ko,
    description_en: text(row.description_en),
    description_ja: text(row.description_ja),
    description_es: text(row.description_es),
    description_de: text(row.description_de),
    description_fr: text(row.description_fr),
    tags: row.tags ?? [],
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
    item.title_es,
    item.title_de,
    item.title_fr,
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
