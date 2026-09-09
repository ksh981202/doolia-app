import { useMemo } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ThemeFilter } from '@/components/category/ThemeFilter'
import { PrintableCard } from '@/components/PrintableCard'
import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { matchesQuery } from '@/services/printableService'
import { getCategoryThemes, resolveCategoryThemeId } from '@/shared/config/categories'
import {
  CATALOG_SLUG_ALIASES,
  DEFAULT_CATEGORY_SLUG,
  categoryPath,
  getCatalogTopic,
  matchesTopicCategory,
} from '@/shared/config/catalog'
import {
  AGE_FILTERS,
  isAgeFilterId,
  isThemeFilterId,
  matchesAgeFilter,
  matchesThemeFilter,
  resolveTypeSlug,
} from '@/shared/config/smartFilters'
import { cn } from '@/shared/lib/cn'

const CARD_GRID = 'mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6'

function filterChipClass(active: boolean) {
  return cn(
    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold transition-all',
    active
      ? 'bg-emerald-600 text-white shadow-2xs'
      : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50',
  )
}

export function CategoryPage() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const typeSlug = resolveTypeSlug(params.get('type'))
  const categoryQuerySlug = getCatalogTopic(params.get('category') ?? undefined)?.topic.id
  const browseAll = !slug || slug === 'all'
  const match = browseAll ? undefined : getCatalogTopic(slug)
  const { data, isLoading } = usePrintablesQuery()
  const age = isAgeFilterId(params.get('age') ?? 'all') ? (params.get('age') ?? 'all') : 'all'
  const themeParam = params.get('theme') ?? params.get('tag') ?? 'all'
  const themeOptions = getCategoryThemes(match?.topic.id)
  const theme = match
    ? resolveCategoryThemeId(match.topic.id, themeParam)
    : isThemeFilterId(themeParam)
      ? themeParam
      : 'all'
  const sortParam = params.get('sort')
  const sort = sortParam === 'popular' || sortParam === 'latest' ? sortParam : browseAll ? 'latest' : 'popular'
  const query = params.get('q') ?? ''
  const ageLabel = AGE_FILTERS.find((item) => item.id === age)?.label ?? '전체'

  const items = useMemo(() => {
    if (!match && !browseAll) return []
    const source = [...(data ?? [])]
    const scoped =
      browseAll || !match
        ? source
        : match.topic.categoryFilter
          ? source.filter((item) => matchesTopicCategory(item.category, match.topic))
          : source.filter((item) => matchesQuery(item, match.topic.query))
    return scoped
      .filter((item) => matchesQuery(item, query))
      .filter((item) => matchesAgeFilter(item, age))
      .filter((item) => {
        if (!themeOptions) return matchesThemeFilter(item, theme)
        const option = themeOptions.find((entry) => entry.id === theme)
        if (!option || option.id === 'all') return true
        return matchesQuery(item, option.query ?? '')
      })
      .sort((a, b) =>
        sort === 'latest'
          ? +new Date(b.created_at) - +new Date(a.created_at)
          : b.downloads - a.downloads || +new Date(b.created_at) - +new Date(a.created_at),
      )
  }, [age, browseAll, data, match, query, sort, theme, themeOptions])

  const destSlug = typeSlug ?? categoryQuerySlug
  if (browseAll && destSlug) {
    const next = new URLSearchParams(params)
    next.delete('category')
    const search = next.toString()
    return <Navigate to={`${categoryPath(destSlug)}${search ? `?${search}` : ''}`} replace />
  }

  if (!match && !browseAll) {
    const alias = slug ? CATALOG_SLUG_ALIASES[slug] : undefined
    if (alias) {
      const next = new URLSearchParams(params)
      if (alias.tag) {
        next.set('theme', alias.tag)
        next.delete('tag')
      }
      const search = next.toString()
      return <Navigate to={`${categoryPath(alias.slug)}${search ? `?${search}` : ''}`} replace />
    }
    return <Navigate to={categoryPath(DEFAULT_CATEGORY_SLUG)} replace />
  }

  const title = match
    ? match.topic.label
    : age === 'all'
      ? '프린트 도안 전체보기'
      : `${ageLabel} 맞춤 도안`
  const emoji = match ? match.topic.emoji : age === 'all' ? '📚' : '👶'
  const crumbs = match
    ? [
        { label: '홈', to: '/' },
        { label: match.group.label },
        { label: match.topic.label },
      ]
    : age === 'all'
      ? [
          { label: '홈', to: '/' },
          { label: '무료 도안 전체' },
        ]
      : [
          { label: '홈', to: '/' },
          { label: '무료 도안 전체', to: '/category' },
          { label: ageLabel },
        ]

  const setFilter = (key: 'age' | 'theme', value: string) => {
    const next = new URLSearchParams(params)
    next.delete('tag')
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  const resetFilters = () => {
    const next = new URLSearchParams(params)
    next.delete('age')
    next.delete('theme')
    next.delete('tag')
    setParams(next)
  }

  return (
    <div>
      <SubpageHeader crumbs={crumbs} title={title} emoji={emoji} />

      <div>
        <div className="mb-8 space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-bold text-slate-700">연령</p>
              <div className="flex flex-wrap items-center gap-2 py-1" role="tablist" aria-label="연령 필터">
                {AGE_FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={age === item.id}
                    onClick={() => setFilter('age', item.id)}
                    className={filterChipClass(age === item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-muted sm:text-sm lg:pt-6">
              정렬
              <select
                value={sort}
                onChange={(event) => {
                  const next = new URLSearchParams(params)
                  next.set('sort', event.target.value)
                  setParams(next)
                }}
                className="h-10 rounded-full border border-line bg-white px-3 text-xs font-bold text-ink sm:text-sm"
              >
                <option value="popular">인기순</option>
                <option value="latest">최신순</option>
              </select>
            </label>
          </div>

          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold text-slate-700">주제</p>
            <ThemeFilter value={theme} onChange={(id) => setFilter('theme', id)} options={themeOptions} />
          </div>
        </div>

        <section id="category-grid" className="scroll-mt-24">
          {isLoading ? (
            <div className={CARD_GRID}>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-brand-soft" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-muted sm:text-base">
                해당 조건의 도안이 아직 없습니다. 다른 필터를 선택해 보세요!
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <div className={CARD_GRID}>
              {items.map((printable) => (
                <PrintableCard
                  key={printable.slug || printable.id}
                  printable={printable}
                  variant="catalog"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default CategoryPage
