import { CATALOG_GROUPS } from '@/shared/config/catalog'
import { toPrintableCategory, type PrintableCategory } from '@/shared/config/categories'

export const ADMIN_PRINTABLE_CATEGORIES = CATALOG_GROUPS.flatMap((group) =>
  group.children.map((child) => ({
    id: child.id,
    label: `${child.emoji} ${child.label}`,
    group: group.label,
  })),
)

const CATALOG_TO_PRINTABLE: Record<string, PrintableCategory> = {
  'coloring-pages': 'coloring-pages',
  tracing: 'tracing',
  letters: 'letters',
  cutout: 'cutout',
  ispy: 'ispy',
  'odd-one': 'odd-one',
  maze: 'maze',
  dots: 'dots',
  shadow: 'shadow',
  routine: 'routine',
  emotion: 'emotion',
  puppets: 'puppets',
  'board-game': 'board-game',
  season: 'season',
  coloring: 'coloring-pages',
  alphabet: 'letters',
  numbers: 'dots',
  odd_one: 'odd-one',
  board_game: 'board-game',
  alphabet_numbers: 'letters',
}

export const AGE_OPTIONS = [
  { id: '2-3', label: '만 2~3세' },
  { id: '4-5', label: '만 4~5세' },
  { id: '6-7', label: '만 6~7세' },
] as const

export function catalogToPrintableCategory(catalogSlug: string): PrintableCategory {
  return CATALOG_TO_PRINTABLE[catalogSlug] ?? toPrintableCategory(catalogSlug)
}

/** 30-column TSV/CSV header used by bulk import */
export const PRINTABLE_TSV_COLUMNS = [
  'slug',
  'type',
  'title_ko',
  'title_en',
  'title_ja',
  'title_es',
  'title_de',
  'title_fr',
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
  'parent_guide_es',
  'parent_guide_de',
  'parent_guide_fr',
  'description_ko',
  'description_en',
  'description_ja',
  'description_es',
  'description_de',
  'description_fr',
  'image_url',
] as const

export type PrintableTsvColumn = (typeof PRINTABLE_TSV_COLUMNS)[number]
export const PRINTABLE_TSV_HEADER = PRINTABLE_TSV_COLUMNS.join('\t')

const PRINTABLE_TSV_COLUMN_SET = new Set<string>(PRINTABLE_TSV_COLUMNS)

/** Legacy 18-column (and filename) headers → 30-column names */
export const PRINTABLE_TSV_ALIASES: Record<string, PrintableTsvColumn> = {
  category: 'category_ko',
  catalog_slug: 'category_en',
  age: 'age_group',
  theme: 'theme_ko',
  image_bw_url: 'image_url',
  description: 'description_ko',
  filename: 'image_url',
  file_name: 'image_url',
  file: 'image_url',
  image: 'image_url',
}

export function isPrintableTsvColumn(name: string): name is PrintableTsvColumn {
  return PRINTABLE_TSV_COLUMN_SET.has(name)
}

export function resolveTsvColumn(header: string): PrintableTsvColumn | null {
  const name = header.trim().toLowerCase()
  if (isPrintableTsvColumn(name)) return name
  return PRINTABLE_TSV_ALIASES[name] ?? null
}

const CATEGORY_TO_CATALOG: Record<string, string> = {
  coloring: 'coloring-pages',
  maze: 'maze',
  tracing: 'tracing',
  alphabet: 'letters',
  numbers: 'dots',
}

export function resolveCatalogSlug(...candidates: Array<string | undefined>) {
  for (const raw of candidates) {
    const value = raw?.trim()
    if (!value) continue
    const lower = value.toLowerCase()
    if (CATALOG_TO_PRINTABLE[lower]) return CATALOG_TO_PRINTABLE[lower]
    if (CATEGORY_TO_CATALOG[lower]) return CATEGORY_TO_CATALOG[lower]
    const byId = ADMIN_PRINTABLE_CATEGORIES.find((item) => item.id === value || item.id === lower)
    if (byId) return byId.id
    const byLabel = ADMIN_PRINTABLE_CATEGORIES.find((item) => item.label.toLowerCase().includes(lower))
    if (byLabel) return byLabel.id
  }
  return ''
}
