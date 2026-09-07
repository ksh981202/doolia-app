import { useState } from 'react'
import { Outlet, useParams, useSearchParams } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopSearchHeader } from '@/components/layout/TopSearchHeader'
import { getCatalogTopic } from '@/shared/config/catalog'
import { isSituationId } from '@/shared/config/playSituations'
import { resolveTypeSlug } from '@/shared/config/smartFilters'

export function CatalogLayout() {
  const { slug, situationId } = useParams()
  const [params] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const categoryQuery = params.get('category')
  const fromCategoryQuery = getCatalogTopic(categoryQuery ?? undefined)?.topic.id
  const activeSlug = slug ?? resolveTypeSlug(params.get('type')) ?? fromCategoryQuery
  const activeSituation = isSituationId(situationId) ? situationId : undefined

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-start gap-8 px-4 py-6 sm:px-6">
        <aside className="sticky top-24 hidden w-64 shrink-0 border-r border-slate-100 lg:block lg:w-[280px]">
          <Sidebar activeSlug={activeSlug} activeSituation={activeSituation} />
        </aside>

        <div className="min-w-0 flex-1">
          <TopSearchHeader variant="inline" onMenu={() => setSidebarOpen(true)} />
          <Outlet />
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="메뉴 닫기"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-[min(85vw,280px)] min-w-[260px] shadow-2xl">
            <Sidebar activeSlug={activeSlug} activeSituation={activeSituation} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  )
}
