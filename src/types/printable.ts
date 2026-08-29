import type { PrintableCategory } from '@/shared/config/categories'

/** 앱 전역에서 사용하는 정규화된 도안 모델 */
export type Printable = {
  id: string
  slug: string
  title: string
  title_ko: string
  title_en: string
  category: PrintableCategory
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
}

/** DB / 데모 원본. 구 컬럼명과 신규 컬럼명을 모두 받는다. */
export type PrintableInput = {
  id: string
  slug?: string | null
  title?: string | null
  title_ko?: string | null
  title_en?: string | null
  category: PrintableCategory
  tags?: string[] | null
  image_bw_url?: string | null
  image_color_url?: string | null
  color_image_url?: string | null
  line_art_url?: string | null
  pdf_url: string
  views?: number | null
  downloads?: number | null
  created_at: string
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

  return {
    id: row.id,
    slug: printableSlug(row.id, row.slug),
    title: title_ko,
    title_ko,
    title_en,
    category: row.category,
    tags: row.tags ?? [],
    image_bw_url,
    image_color_url,
    color_image_url: image_color_url,
    line_art_url: image_bw_url,
    pdf_url: row.pdf_url,
    views: row.views ?? 0,
    downloads: row.downloads ?? 0,
    created_at: row.created_at,
  }
}

export function printableSearchText(item: Printable) {
  return [item.title, item.title_ko, item.title_en, item.slug, item.category, ...item.tags]
    .join(' ')
    .toLowerCase()
}
