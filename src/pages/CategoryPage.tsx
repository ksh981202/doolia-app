import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ThemeFilter } from '@/components/category/ThemeFilter'
import { PrintableCard } from '@/components/PrintableCard'
import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { logSearchKeyword } from '@/features/search/lib/logSearchKeyword'
import { matchesQuery, matchesUserSearch } from '@/services/printableService'
import {
  getCategoryThemes,
  getThemeSubCategories,
  matchesSubtabQuery,
  resolveCategoryThemeId,
  resolveThemeSubId,
} from '@/shared/config/categories'
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

const CARD_GRID = 'mt-6 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4'

function filterChipClass(active: boolean) {
  return cn(
    'inline-flex max-w-full items-center gap-1.5 rounded-xl px-3 py-1.5 text-left text-[12.5px] font-medium leading-snug break-words sm:px-3.5 sm:text-sm',
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
  const { t } = useTranslation()
  return (
    <label
      className={cn(
        'flex shrink-0 items-center gap-2 text-xs font-bold text-muted sm:text-sm',
        align === 'lg' ? 'lg:pt-5' : 'sm:pt-0.5',
      )}
    >
      {t('category.sort', { defaultValue: '정렬' })}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-full border border-line bg-white px-3 text-xs font-bold text-ink sm:text-sm"
      >
        <option value="popular">{t('category.sortPopular', { defaultValue: '인기순' })}</option>
        <option value="latest">{t('category.sortLatest', { defaultValue: '최신순' })}</option>
      </select>
    </label>
  )
}

export function CategoryPage() {
  const { t } = useTranslation()
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
  const ageFilter = AGE_FILTERS.find((item) => item.id === age)
  const ageLabel = t(ageFilter?.labelKey ?? 'category.all', { defaultValue: ageFilter?.label ?? '전체' })

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
      .filter((item) => matchesUserSearch(item, query))
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
        return matchesSubtabQuery(item, subOption.query ?? '')
      })
      .sort((a, b) =>
        sort === 'latest'
          ? +new Date(b.created_at) - +new Date(a.created_at)
          : b.downloads - a.downloads || +new Date(b.created_at) - +new Date(a.created_at),
      )
  }, [age, browseAll, data, isSenior, match, query, sort, sub, subOptions, theme, themeOptions])

  useEffect(() => {
    if (isLoading) return
    const keyword = query.trim()
    if (keyword.length < 2) return
    const timer = window.setTimeout(() => {
      logSearchKeyword(keyword, items.length)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [isLoading, items.length, query])

  const destSlug = typeSlug ?? categoryQuerySlug
  const categoryAlias = params.get('category') ? CATALOG_SLUG_ALIASES[params.get('category') ?? ''] : undefined
  if (browseAll && categoryAlias) {
    const next = new URLSearchParams(params)
    next.delete('category')
    if (categoryAlias.tag) next.set('theme', categoryAlias.tag)
    const search = next.toString()
    return <Navigate to={`${categoryPath(categoryAlias.slug)}${search ? `?${search}` : ''}`} replace />
  }
  if (browseAll && params.get('theme') && params.get('theme') !== 'all') {
    const search = params.toString()
    return <Navigate to={`${categoryPath(DEFAULT_CATEGORY_SLUG)}${search ? `?${search}` : ''}`} replace />
  }
  if (browseAll && params.get('tab') === 'age') {
    const next = new URLSearchParams(params)
    next.delete('tab')
    if (!next.get('age')) next.set('age', '2-3')
    const search = next.toString()
    return <Navigate to={`${categoryPath(DEFAULT_CATEGORY_SLUG)}${search ? `?${search}` : ''}`} replace />
  }
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
    ? healingTheme
      ? t(`categories.${healingTheme.id}`, { defaultValue: healingTheme.name })
      : t('category.healingColoring', { defaultValue: match?.topic.label ?? '온가족 힐링 컬러링' })
    : match
      ? parentTheme && parentTheme.id !== 'all'
        ? t(`categories.${parentTheme.id}`, { defaultValue: parentTheme.name })
        : t(`categories.${match.topic.id}`, { defaultValue: match.topic.label })
      : age === 'all'
        ? t('catalog.allCategory', { defaultValue: '전체 색칠도안 (ALL)' })
        : t('category.ageCustom', { defaultValue: '{{age}} 맞춤 도안', age: ageLabel })
  const emoji = isSenior
    ? healingTheme?.icon || match?.topic.emoji || '🌿'
    : match
      ? parentTheme?.icon || match.topic.emoji
      : age === 'all'
        ? '🎨'
        : '👶'
  const homeCrumb = { label: t('category.home', { defaultValue: '홈' }), to: '/' }
  const groupLabel =
    match?.group.id === 'healing'
      ? t('category.healingColoring', { defaultValue: match.group.label })
      : t('category.byTheme', { defaultValue: match?.group.label ?? '키즈 테마별' })
  const crumbs = isSenior
    ? [
        homeCrumb,
        {
          label: t('category.healingColoring', { defaultValue: '온가족 힐링 컬러링' }),
          ...(healingTheme ? { to: categoryPath('senior-art') } : {}),
        },
        ...(healingTheme ? [{ label: t(`categories.${healingTheme.id}`, { defaultValue: healingTheme.name }) }] : []),
      ]
    : match
      ? [
          homeCrumb,
          { label: groupLabel, to: '/category' },
          ...(parentTheme && parentTheme.id !== 'all'
            ? [{ label: t(`categories.${parentTheme.id}`, { defaultValue: parentTheme.name }) }]
            : [{ label: t(`categories.${match.topic.id}`, { defaultValue: match.topic.label }) }]),
        ]
      : age === 'all'
        ? [homeCrumb, { label: t('category.allColoring', { defaultValue: '전체 색칠도안' }) }]
        : [
            homeCrumb,
            { label: t('category.allColoring', { defaultValue: '전체 색칠도안' }), to: '/category' },
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
                <p className="mb-1.5 text-sm font-bold text-slate-700">{t('category.subtheme', { defaultValue: '세부 주제' })}</p>
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
                  <p className="mb-1.5 text-sm font-bold text-slate-700">{t('category.age', { defaultValue: '연령' })}</p>
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5" role="tablist" aria-label={t('category.age', { defaultValue: '연령 필터' })}>
                    {AGE_FILTERS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={age === item.id}
                        onClick={() => setFilter('age', item.id)}
                        className={filterChipClass(age === item.id)}
                      >
                        {t(item.labelKey, { defaultValue: item.label })}
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
                    <p className="mb-1.5 text-sm font-bold text-slate-700">{t('category.subtheme', { defaultValue: '세부 주제' })}</p>
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
                    <p className="mb-1.5 text-sm font-bold text-slate-700">{t('category.theme', { defaultValue: '주제' })}</p>
                    <ThemeFilter
                      value={theme}
                      onChange={(id) => setFilter('theme', id)}
                      options={themeOptions}
                      variant="parent"
                    />
                  </div>
                  {showSubChips ? (
                    <div className="mt-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/50 p-3.5">
                      <p className="mb-2 flex min-w-0 items-start gap-1.5 text-xs font-bold leading-snug text-emerald-800 sm:text-sm">
                        <span aria-hidden className="shrink-0">{parentTheme?.icon || '✨'}</span>
                        <span className="min-w-0 break-words">
                          {t('category.themeGather', {
                            defaultValue: '{{theme}} 세부 도안 모아보기',
                            theme: parentTheme
                              ? t(`categories.${parentTheme.id}`, { defaultValue: parentTheme.name })
                              : t('category.theme', { defaultValue: '이 테마' }),
                          })}
                        </span>
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
                  ? t('category.emptyCategory', { defaultValue: '해당 카테고리의 도안이 곧 업데이트됩니다!' })
                  : t('category.emptyFilter', { defaultValue: '해당 조건의 도안이 아직 없습니다. 다른 필터를 선택해 보세요!' })}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                {t('category.resetFilters', { defaultValue: '필터 초기화' })}
              </button>
            </div>
          ) : (
            <div className={CARD_GRID}>
              {items.map((printable, index) => (
                <PrintableCard
                  key={printable.slug || printable.id}
                  printable={printable}
                  variant="catalog"
                  index={index}
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
