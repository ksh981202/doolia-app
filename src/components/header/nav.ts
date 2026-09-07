import { CATALOG_GROUPS, categoryPath } from '@/shared/config/catalog'

export const HEADER_NAV = [
  { to: '/', labelKey: 'nav.home', match: 'home' },
  { to: '/situation/home', labelKey: 'nav.playToolbox', match: 'playToolbox' },
  { to: '/category/coloring-pages', labelKey: 'nav.coloring', match: 'coloring' },
  { to: '/category/ispy', labelKey: 'nav.brain', match: 'brain' },
  { to: '/premium', labelKey: 'nav.premium', match: 'premium' },
] as const

export type HeaderNavItem = (typeof HEADER_NAV)[number]

const COLORING_SLUGS = new Set(['coloring-pages', 'tracing', 'letters', 'cutout'])
const BRAIN_SLUGS = new Set(['ispy', 'odd-one', 'maze', 'dots', 'shadow'])

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

function categorySlug(pathname: string) {
  const match = pathname.match(/^\/category\/([^/]+)/)
  return match?.[1]
}

export function isNavActive(item: HeaderNavItem, pathname: string, _hash = '') {
  const slug = categorySlug(pathname)
  switch (item.match) {
    case 'home':
      return pathname === '/'
    case 'playToolbox':
      return pathname.startsWith('/situation')
    case 'premium':
      return pathname === '/premium'
    case 'coloring':
      return Boolean(slug && COLORING_SLUGS.has(slug))
    case 'brain':
      return Boolean(slug && BRAIN_SLUGS.has(slug))
  }
}
