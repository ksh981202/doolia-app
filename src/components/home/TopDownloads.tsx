import { useMemo } from 'react'
import { PrintableCard } from '@/components/PrintableCard'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { matchesPopularTab, matchesQuery } from '@/services/printableService'
import { POPULAR_TABS } from '@/shared/config/categories'
import { cn } from '@/shared/lib/cn'
import { useGalleryStore } from '@/shared/store/useGalleryStore'

export function TopDownloads() {
  const { data, isLoading, isError } = usePrintablesQuery()
  const query = useGalleryStore((state) => state.query)
  const popularTab = useGalleryStore((state) => state.popularTab)
  const setPopularTab = useGalleryStore((state) => state.setPopularTab)

  const items = useMemo(() => {
    const source = [...(data ?? [])]
      .filter((item) => matchesQuery(item, query))
      .filter((item) => matchesPopularTab(item, popularTab))
      .sort((a, b) => b.downloads - a.downloads)
    return source.slice(0, 8)
  }, [data, popularTab, query])

  return (
    <section id="popular-gallery" className="scroll-mt-24 bg-white pb-14 pt-4 sm:pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-brand">TOP DOWNLOADS</p>
            <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              🏆 가장 많이 다운로드된 인기 도안 Top 8
            </h2>
          </div>
          {query ? (
            <p className="text-sm font-bold text-muted">검색어 “{query}” 결과</p>
          ) : null}
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {POPULAR_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPopularTab(tab.id)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm transition-all',
                popularTab === tab.id
                  ? 'bg-emerald-600 font-semibold text-white shadow-sm'
                  : 'bg-gray-100 font-medium text-gray-600 hover:bg-gray-200',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="aspect-[3/4] animate-pulse bg-slate-50" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {isError ? (
          <p className="mt-8 rounded-2xl bg-red-50 p-6 text-center font-semibold text-red-600">
            도안을 불러오지 못했어요. Supabase 연결을 확인해 주세요.
          </p>
        ) : null}

        {!isLoading && !isError && items.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-line bg-page p-10 text-center text-muted">
            조건에 맞는 도안이 아직 없어요. 다른 키워드를 선택해 보세요.
          </p>
        ) : null}

        {items.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items.map((printable) => (
              <PrintableCard key={printable.id} printable={printable} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
