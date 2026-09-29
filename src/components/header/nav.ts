import { CATALOG_GROUPS, categoryPath } from '@/shared/config/catalog'

export const HEADER_NAV_ITEMS = [
  {
    id: 'themes',
    label: '테마별 색칠도안',
    icon: '🎨',
    path: '/category/coloring-pages',
  },
  {
    id: 'imagination',
    label: '엉뚱발랄 상상나라',
    icon: '✨',
    path: '/category/coloring-pages?theme=imagination',
  },
  {
    id: 'age',
    label: '연령별 맞춤도안',
    icon: '👶',
    path: '/category/coloring-pages?age=2-3',
  },
  {
    id: 'popular',
    label: '지금 인기 도안',
    icon: '🔥',
    path: '/category/coloring-pages?sort=popular',
  },
] as const

export type HeaderNavItem = (typeof HEADER_NAV_ITEMS)[number]

export function isHeaderNavActive(item: HeaderNavItem, pathname: string, search: URLSearchParams) {
  if (pathname !== '/category/coloring-pages') return false
  const theme = search.get('theme') ?? search.get('tag') ?? ''
  const age = search.get('age') ?? ''
  const sort = search.get('sort') ?? ''
  const hasAge = age === '2-3' || age === '4-5' || age === '6-7'

  if (item.id === 'imagination') return theme === 'imagination'
  if (item.id === 'age') return hasAge && theme !== 'imagination'
  if (item.id === 'popular') return sort === 'popular' && theme !== 'imagination' && !hasAge
  return theme !== 'imagination' && !hasAge && sort !== 'popular'
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

