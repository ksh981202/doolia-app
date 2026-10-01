import { getCategoryThemes, getThemeSubCategories } from '@/shared/config/categories'
import { matchesQuery } from '@/services/printableService'
import { formatAgeRange } from '@/shared/lib/printableMeta'
import type { Printable } from '@/types/printable'

function themeScope(printable: Printable) {
  return printable.category === 'senior-art' ? 'senior-art' : 'coloring-pages'
}

export function printableCurationKeys(printable: Printable) {
  const themes = getCategoryThemes(themeScope(printable)) ?? []
  const parent = themes.find((item) => item.id !== 'all' && matchesQuery(printable, item.query ?? ''))
  const subs = parent ? getThemeSubCategories(parent.id) : undefined
  const sub = subs?.find((item) => item.id !== 'all' && matchesQuery(printable, item.query ?? ''))
  return {
    themeKo: printable.theme_ko.trim().toLowerCase(),
    parentId: parent?.id,
    subId: sub?.id,
  }
}

export function scoreRelatedPrintable(current: Printable, item: Printable) {
  const currentKeys = printableCurationKeys(current)
  const itemKeys = printableCurationKeys(item)
  const sameThemeKo = Boolean(currentKeys.themeKo && currentKeys.themeKo === itemKeys.themeKo)
  const sameSub = Boolean(currentKeys.subId && currentKeys.subId === itemKeys.subId)
  const sameParent = Boolean(currentKeys.parentId && currentKeys.parentId === itemKeys.parentId)
  const sameCategory = item.category === current.category ? 2 : 0
  const ageKey = formatAgeRange([current.age_group, current.age_group_en, ...current.tags].join(' '))
  const itemAge = formatAgeRange([item.age_group, item.age_group_en, ...item.tags].join(' '))
  const sameAge = ageKey && itemAge === ageKey ? 1 : 0
  return (sameThemeKo ? 5 : 0) + (sameSub ? 5 : 0) + (sameParent ? 2 : 0) + sameCategory + sameAge
}

export function pickRelatedPrintables(current: Printable, pool: Printable[], limit = 4) {
  return pool
    .filter((item) => item.id !== current.id)
    .sort((a, b) => scoreRelatedPrintable(current, b) - scoreRelatedPrintable(current, a) || b.downloads - a.downloads)
    .slice(0, limit)
}
