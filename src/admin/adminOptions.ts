import { CATALOG_GROUPS } from '@/shared/config/catalog'
import {
  CATEGORIES,
  resolvePrintableCategoryId,
  toPrintableCategory,
  type PrintableCategory,
} from '@/shared/config/categories'

const CATALOG_ADMIN_CATEGORIES = CATALOG_GROUPS.flatMap((group) =>
  group.children.map((child) => ({
    id: child.id,
    label: `${child.emoji} ${child.label}`,
    group: group.label,
  })),
)
const CATALOG_ADMIN_IDS = new Set(CATALOG_ADMIN_CATEGORIES.map((item) => item.id))

export const ADMIN_PRINTABLE_CATEGORIES = [
  ...CATALOG_ADMIN_CATEGORIES,
  ...CATEGORIES.filter((item) => !CATALOG_ADMIN_IDS.has(item.id)).map((item) => ({
    id: item.id,
    label: `${item.emoji} ${item.label}`,
    group: '기타',
  })),
]

export function catalogToPrintableCategory(catalogSlug: string): PrintableCategory {
  return toPrintableCategory(catalogSlug)
}

/** 43-column TSV/CSV header used by bulk import */
export const PRINTABLE_TSV_COLUMNS = [
  'slug',
  'type',
  'title_ko',
  'title_en',
  'title_ja',
  'title_zh',
  'title_es',
  'title_pt',
  'title_de',
  'title_fr',
  'title_it',
  'title_vi',
  'category_ko',
  'category_en',
  'age_group',
  'age_group_en',
  'theme_ko',
  'theme_en',
  'benefit_1',
  'benefit_2',
  'benefit_3',
  'parent_guide_ko',
  'parent_guide_en',
  'parent_guide_ja',
  'parent_guide_zh',
  'parent_guide_es',
  'parent_guide_pt',
  'parent_guide_de',
  'parent_guide_fr',
  'parent_guide_it',
  'parent_guide_vi',
  'description_ko',
  'description_en',
  'description_ja',
  'description_zh',
  'description_es',
  'description_pt',
  'description_de',
  'description_fr',
  'description_it',
  'description_vi',
  'image_bw_url',
  'image_color_url',
] as const

export type PrintableTsvColumn = (typeof PRINTABLE_TSV_COLUMNS)[number]
export const PRINTABLE_TSV_HEADER = PRINTABLE_TSV_COLUMNS.join('\t')
type _AssertTsv43 = (typeof PRINTABLE_TSV_COLUMNS)['length'] extends 43 ? true : never
const _assertTsv43: _AssertTsv43 = true
void _assertTsv43

const PRINTABLE_TSV_COLUMN_SET = new Set<string>(PRINTABLE_TSV_COLUMNS)

/** Legacy 18/30-column (and filename) headers → 43-column names */
export const PRINTABLE_TSV_ALIASES: Record<string, PrintableTsvColumn> = {
  category: 'category_ko',
  catalog_slug: 'category_en',
  age: 'age_group',
  theme: 'theme_ko',
  image_url: 'image_bw_url',
  description: 'description_ko',
  filename: 'image_bw_url',
  file_name: 'image_bw_url',
  file: 'image_bw_url',
  image: 'image_bw_url',
  title_cn: 'title_zh',
  title_tw: 'title_zh',
  title_zhtw: 'title_zh',
  'title_zh-tw': 'title_zh',
  title_zh_tw: 'title_zh',
  title_zh_hant: 'title_zh',
  'title_zh-hant': 'title_zh',
  'title_zh-cn': 'title_zh',
  title_zh_cn: 'title_zh',
  parent_guide_cn: 'parent_guide_zh',
  parent_guide_tw: 'parent_guide_zh',
  parent_guide_zhtw: 'parent_guide_zh',
  'parent_guide_zh-tw': 'parent_guide_zh',
  parent_guide_zh_tw: 'parent_guide_zh',
  parent_guide_zh_hant: 'parent_guide_zh',
  'parent_guide_zh-hant': 'parent_guide_zh',
  description_cn: 'description_zh',
  description_tw: 'description_zh',
  description_zhtw: 'description_zh',
  'description_zh-tw': 'description_zh',
  description_zh_tw: 'description_zh',
  description_zh_hant: 'description_zh',
  'description_zh-hant': 'description_zh',
  'title_pt-br': 'title_pt',
  title_pt_br: 'title_pt',
  'parent_guide_pt-br': 'parent_guide_pt',
  parent_guide_pt_br: 'parent_guide_pt',
  'description_pt-br': 'description_pt',
  description_pt_br: 'description_pt',
}

export const PRINTABLE_LOCALE_CODES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'] as const
export const PRINTABLE_LOCALE_PREFIXES = ['title', 'parent_guide', 'description'] as const
export const PRINTABLE_LOCALE_FIELDS = PRINTABLE_LOCALE_PREFIXES.flatMap((prefix) =>
  PRINTABLE_LOCALE_CODES.map((code) => `${prefix}_${code}` as const),
)

export function normalizeTsvHeader(header: string) {
  return header
    .replace(/^\uFEFF/, '')
    .replace(/[\u00a0\u200b\u200c\u200d]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

export function isPrintableTsvColumn(name: string): name is PrintableTsvColumn {
  return PRINTABLE_TSV_COLUMN_SET.has(name)
}

export function resolveTsvColumn(header: string): PrintableTsvColumn | null {
  const name = normalizeTsvHeader(header)
  if (isPrintableTsvColumn(name)) return name
  if (PRINTABLE_TSV_ALIASES[name]) return PRINTABLE_TSV_ALIASES[name]
  const underscored = name.replace(/-/g, '_')
  if (isPrintableTsvColumn(underscored)) return underscored
  return PRINTABLE_TSV_ALIASES[underscored] ?? null
}

export const AGE_OPTIONS = [
  { id: '2-3', label: '2~3세' },
  { id: '4-5', label: '4~5세' },
  { id: '6-7', label: '6~7세+' },
] as const

export function resolveCatalogSlug(...candidates: Array<string | undefined>) {
  for (const raw of candidates) {
    const mapped = resolvePrintableCategoryId(raw)
    if (mapped) return mapped
    const value = raw?.trim()
    if (!value) continue
    const lower = value.toLowerCase()
    const byId = ADMIN_PRINTABLE_CATEGORIES.find((item) => item.id === value || item.id === lower)
    if (byId) return byId.id
    const byLabel = ADMIN_PRINTABLE_CATEGORIES.find((item) => item.label.toLowerCase().includes(lower))
    if (byLabel) return byLabel.id
  }
  return ''
}
