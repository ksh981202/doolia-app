import { CATALOG_GROUPS, categoryPath } from '@/shared/config/catalog'

export const HEADER_NAV_ITEMS = [
  {
    id: 'themes',
    labelKey: 'nav.allPrintables',
    icon: '🎨',
    path: '/category',
  },
  {
    id: 'imagination',
    labelKey: 'nav.imagination',
    icon: '✨',
    path: '/category?category=imagination',
  },
  {
    id: 'age',
    labelKey: 'nav.byAge',
    icon: '👶',
    path: '/category?tab=age',
  },
  {
    id: 'popular',
    labelKey: 'nav.popular',
    icon: '🔥',
    path: '/category?sort=popular',
  },
] as const

export type HeaderNavItem = (typeof HEADER_NAV_ITEMS)[number]

export function isHeaderNavActive(item: HeaderNavItem, pathname: string, search: URLSearchParams) {
  const onCatalog = pathname === '/category' || pathname.startsWith('/category/')
  if (!onCatalog) return false
  const theme = search.get('theme') ?? search.get('tag') ?? search.get('category') ?? ''
  const tab = search.get('tab') ?? ''
  const age = search.get('age') ?? ''
  const sort = search.get('sort') ?? ''
  const hasAge = tab === 'age' || age === '2-3' || age === '4-5' || age === '6-7'
  const isImagination = theme === 'imagination' || pathname.includes('/imagination')

  if (item.id === 'imagination') return isImagination
  if (item.id === 'age') return hasAge && !isImagination
  if (item.id === 'popular') return sort === 'popular' && !isImagination && !hasAge
  return !isImagination && !hasAge && sort !== 'popular'
}

export const CATEGORY_NAV = CATALOG_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  emoji: group.emoji,
  subtitle: group.subtitle,
  items: group.children.map((child) => ({
    id: child.id,
    label: child.label,
    emoji: child.emoji,
    to: categoryPath(child.id),
  })),
}))
