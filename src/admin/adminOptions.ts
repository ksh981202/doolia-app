import { CATALOG_GROUPS } from '@/shared/config/catalog'
import type { PrintableCategory } from '@/shared/config/categories'

export const ADMIN_PRINTABLE_CATEGORIES = CATALOG_GROUPS.flatMap((group) =>
  group.children.map((child) => ({
    id: child.id,
    label: `${child.emoji} ${child.label}`,
    group: group.label,
  })),
)

const CATALOG_TO_PRINTABLE: Record<string, PrintableCategory> = {
  'coloring-pages': 'coloring',
  tracing: 'tracing',
  letters: 'alphabet',
  cutout: 'coloring',
  ispy: 'coloring',
  'odd-one': 'coloring',
  maze: 'maze',
  dots: 'numbers',
  shadow: 'coloring',
  routine: 'coloring',
  emotion: 'coloring',
  puppets: 'coloring',
  'board-game': 'coloring',
  season: 'coloring',
}

export const AGE_OPTIONS = [
  { id: '2-3', label: '만 2~3세' },
  { id: '4-5', label: '만 4~5세' },
  { id: '6-7', label: '만 6~7세' },
] as const

export function catalogToPrintableCategory(catalogSlug: string): PrintableCategory {
  return CATALOG_TO_PRINTABLE[catalogSlug] ?? 'coloring'
}

/** 18-column TSV/CSV header used by bulk import */
export const PRINTABLE_TSV_COLUMNS = [
  'id',
  'slug',
  'title_ko',
  'title_en',
  'category',
  'catalog_slug',
  'age',
  'tags',
  'theme',
  'image_bw_url',
  'image_color_url',
  'pdf_url',
  'published',
  'views',
  'downloads',
  'difficulty',
  'description',
  'created_at',
] as const

export type PrintableTsvColumn = (typeof PRINTABLE_TSV_COLUMNS)[number]
export const PRINTABLE_TSV_HEADER = PRINTABLE_TSV_COLUMNS.join('\t')
