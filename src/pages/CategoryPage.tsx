import { useMemo } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ThemeFilter } from '@/components/category/ThemeFilter'
import { PrintableCard } from '@/components/PrintableCard'
import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { matchesQuery } from '@/services/printableService'
import { getCategoryThemes, getThemeSubCategories, resolveCategoryThemeId, resolveThemeSubId } from '@/shared/config/categories'
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
  matchesAgeFilter,
  resolveTypeSlug,
} from '@/shared/config/smartFilters'
import { cn } from '@/shared/lib/cn'

const CARD_GRID = 'mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'

function filterChipClass(active: boolean) {
  return cn(
    'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[13.5px] font-medium transition-all sm:text-sm',
    active
      ? 'bg-emerald-600 font-bold text-white shadow-sm'
      : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50',
  )
}

function SortSelect({
  value,
  onChange,
  align,
}: {
  value: string
  onChange: (value: string) => void
  align?: 'lg'
}) {
  return (
    <label
      className={cn(
        'flex shrink-0 items-center gap-2 text-xs font-bold text-muted sm:text-sm',
        align === 'lg' ? 'lg:pt-5' : 'sm:pt-0.5',
      )}
    >
      정렬
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-full border border-line bg-white px-3 text-xs font-bold text-ink sm:text-sm"
      >
        <option value="popular">인기순</option>
        <option value="latest">최신순</option>
      </select>
    </label>
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
  const themeScopeSlug = match?.topic.id ?? DEFAULT_CATEGORY_SLUG
  const themeOptions = getCategoryThemes(themeScopeSlug)
  const theme = resolveCategoryThemeId(themeScopeSlug, themeParam)
  const subOptions = getThemeSubCategories(theme)
  const sub = resolveThemeSubId(theme, params.get('sub') ?? 'all')
  const parentTheme = themeOptions?.find((item) => item.id === theme)
  const isSenior = match?.topic.id === 'senior-art'
  const healingTheme = isSenior && parentTheme && parentTheme.id !== 'all' ? parentTheme : undefined
  const themeLocked = Boolean(!browseAll && theme !== 'all')
  const showSubChips = Boolean(theme !== 'all' && subOptions?.length)
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
      .filter((item) => (isSenior ? true : matchesAgeFilter(item, age)))
      .filter((item) => {
        const parentMatch = (() => {
          const option = themeOptions?.find((entry) => entry.id === theme)
          if (!option || option.id === 'all') return true
          return matchesQuery(item, option.query ?? '')
        })()
        if (!parentMatch) return false
        if (!subOptions || sub === 'all') return true
        const subOption = subOptions.find((entry) => entry.id === sub)
        if (!subOption || subOption.id === 'all') return true
        return matchesQuery(item, subOption.query ?? '')
      })
      .sort((a, b) =>
        sort === 'latest'
          ? +new Date(b.created_at) - +new Date(a.created_at)
          : b.downloads - a.downloads || +new Date(b.created_at) - +new Date(a.created_at),
      )
  }, [age, browseAll, data, isSenior, match, query, sort, sub, subOptions, theme, themeOptions])

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

  const title = isSenior
    ? healingTheme?.name ?? match?.topic.label ?? '온가족 힐링 컬러링'
    : match
      ? parentTheme && parentTheme.id !== 'all'
        ? parentTheme.name
        : match.topic.label
      : age === 'all'
        ? '전체 색칠도안'
        : `${ageLabel} 맞춤 도안`
  const emoji = isSenior
    ? healingTheme?.icon || match?.topic.emoji || '🌿'
    : match
      ? parentTheme?.icon || match.topic.emoji
      : age === 'all'
        ? '🎨'
        : '👶'
  const crumbs = isSenior
    ? [
        { label: '홈', to: '/' },
        {
          label: '온가족 힐링 컬러링',
          ...(healingTheme ? { to: categoryPath('senior-art') } : {}),
        },
        ...(healingTheme ? [{ label: healingTheme.name }] : []),
      ]
    : match
      ? [
          { label: '홈', to: '/' },
          { label: match.group.label, to: '/category' },
          ...(parentTheme && parentTheme.id !== 'all'
            ? [{ label: parentTheme.name }]
            : [{ label: match.topic.label }]),
        ]
      : age === 'all'
        ? [
            { label: '홈', to: '/' },
            { label: '전체 색칠도안' },
          ]
        : [
            { label: '홈', to: '/' },
            { label: '전체 색칠도안', to: '/category' },
            { label: ageLabel },
          ]

  const setFilter = (key: 'age' | 'theme' | 'sub', value: string) => {
    const next = new URLSearchParams(params)
    next.delete('tag')
    if (key === 'theme') next.delete('sub')
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  const resetFilters = () => {
    const next = new URLSearchParams(params)
    next.delete('age')
    next.delete('theme')
    next.delete('tag')
    next.delete('sub')
    setParams(next)
  }

  return (
    <div>
      <SubpageHeader crumbs={crumbs} title={title} emoji={emoji} />

      <div>
        <div
          className={cn(
            'rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5',
            isSenior || themeLocked ? 'mb-5 space-y-2.5' : 'mb-6 space-y-3',
          )}
        >
          {isSenior ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="mb-1.5 text-sm font-bold text-slate-700">세부 주제</p>
                <ThemeFilter
                  value={themeLocked && showSubChips ? sub : theme}
                  onChange={(id) => setFilter(themeLocked && showSubChips ? 'sub' : 'theme', id)}
                  options={themeLocked && showSubChips ? subOptions : themeOptions}
                  variant={themeLocked && showSubChips ? 'sub' : 'parent'}
                  showExpandCaret={false}
                />
              </div>
              <SortSelect
                value={sort}
                onChange={(value) => {
                  const next = new URLSearchParams(params)
                  next.set('sort', value)
                  setParams(next)
                }}
              />
            </div>
          ) : (
            <>
              <div
                className={cn(
                  'flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between',
                  themeLocked ? 'border-b border-slate-100 pb-2.5' : 'border-b border-slate-100 pb-3',
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="mb-1.5 text-sm font-bold text-slate-700">연령</p>
                  <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="연령 필터">
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
                <SortSelect
                  value={sort}
                  onChange={(value) => {
                    const next = new URLSearchParams(params)
                    next.set('sort', value)
                    setParams(next)
                  }}
                  align="lg"
                />
              </div>

              {themeLocked ? (
                showSubChips ? (
                  <div className="min-w-0">
                    <p className="mb-1.5 text-sm font-bold text-slate-700">세부 주제</p>
                    <ThemeFilter
                      value={sub}
                      onChange={(id) => setFilter('sub', id)}
                      options={subOptions}
                      variant="sub"
                      showExpandCaret={false}
                    />
                  </div>
                ) : null
              ) : (
                <div className="min-w-0 space-y-3">
                  <div>
                    <p className="mb-1.5 text-sm font-bold text-slate-700">주제</p>
                    <ThemeFilter
                      value={theme}
                      onChange={(id) => setFilter('theme', id)}
                      options={themeOptions}
                      variant="parent"
                    />
                  </div>
                  {showSubChips ? (
                    <div className="mt-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/50 p-3.5">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-800 sm:text-sm">
                        <span aria-hidden>{parentTheme?.icon || '✨'}</span>
                        <span>{parentTheme?.name || '이 테마'} 세부 도안 모아보기</span>
                      </p>
                      <ThemeFilter
                        value={sub}
                        onChange={(id) => setFilter('sub', id)}
                        options={subOptions}
                        variant="sub"
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}
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
                {match
                  ? '해당 카테고리의 도안이 곧 업데이트됩니다!'
                  : '해당 조건의 도안이 아직 없습니다. 다른 필터를 선택해 보세요!'}
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
