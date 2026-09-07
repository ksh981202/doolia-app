import { useMemo } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ThemeFilter } from '@/components/category/ThemeFilter'
import { PrintableCard } from '@/components/PrintableCard'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { matchesQuery } from '@/services/printableService'
import {
  CATALOG_SLUG_ALIASES,
  DEFAULT_CATEGORY_SLUG,
  categoryPath,
  getCatalogTopic,
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

const CARD_GRID = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'

function filterChipClass(active: boolean) {
  return cn(
    'inline-flex min-h-[40px] shrink-0 items-center rounded-full px-3.5 py-2 text-sm transition sm:px-4',
    active
      ? 'bg-emerald-600 font-bold text-white shadow-sm'
      : 'bg-white font-medium text-ink/70 ring-1 ring-line hover:text-ink',
  )
}

export function CategoryPage() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const typeSlug = resolveTypeSlug(params.get('type'))
  const categoryQuerySlug = getCatalogTopic(params.get('category') ?? undefined)?.topic.id
  const browseAll = !slug
  const match = getCatalogTopic(slug)
  const { data, isLoading } = usePrintablesQuery()
  const age = isAgeFilterId(params.get('age') ?? 'all') ? (params.get('age') ?? 'all') : 'all'
  const themeParam = params.get('theme') ?? params.get('tag') ?? 'all'
  const theme = isThemeFilterId(themeParam) ? themeParam : 'all'
  const sort = params.get('sort') === 'latest' ? 'latest' : 'popular'
  const query = params.get('q') ?? ''
  const ageLabel = AGE_FILTERS.find((item) => item.id === age)?.label ?? '전체'

  const items = useMemo(() => {
    if (!match && !browseAll) return []
    const source = [...(data ?? [])]
    const scoped = match
      ? source
          .filter((item) =>
            match.topic.categoryFilter ? item.category === match.topic.categoryFilter : true,
          )
          .filter((item) => matchesQuery(item, match.topic.query))
      : source
    return scoped
      .filter((item) => matchesQuery(item, query))
      .filter((item) => matchesAgeFilter(item, age))
      .filter((item) => matchesThemeFilter(item, theme))
      .sort((a, b) =>
        sort === 'latest'
          ? +new Date(b.created_at) - +new Date(a.created_at)
          : b.downloads - a.downloads,
      )
  }, [age, browseAll, data, match, query, sort, theme])

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

  const groupLabel = match?.group.label ?? '연령별 탐색'
  const topicLabel = match?.topic.label ?? ageLabel
  const title = match
    ? match.topic.title
    : age === 'all'
      ? '무료 프린트 도안 전체보기'
      : `${ageLabel} 맞춤 도안`
  const description = match
    ? match.topic.description
    : '우리 아이 나이에 맞는 발달 단계별 도안을 모두 모아 봤어요.'

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
      <div className="mb-6">
        <nav className="mb-1 text-xs text-slate-500" aria-label="breadcrumb">
          <Link to="/" className="hover:text-emerald-600">
            홈
          </Link>
          <span> &gt; </span>
          <span>{groupLabel}</span>
          <span> &gt; </span>
          <span className="font-medium text-slate-800">{topicLabel}</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm font-normal text-slate-500">{description}</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-bold text-slate-700">연령</p>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="연령 필터">
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
            <ThemeFilter value={theme} onChange={(id) => setFilter('theme', id)} />
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
                <PrintableCard key={printable.id} printable={printable} variant="catalog" />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default CategoryPage
