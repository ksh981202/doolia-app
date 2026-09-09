import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Outlet, useParams, useSearchParams } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
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
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-start gap-6 py-6 sm:gap-8">
        <aside className="sticky top-24 hidden w-64 min-w-64 shrink-0 lg:block lg:w-72 lg:min-w-72">
          <Sidebar activeSlug={activeSlug} activeSituation={activeSituation} />
        </aside>

        <div className="min-w-0 flex-1 overflow-x-hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="카테고리 메뉴"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm lg:hidden"
          >
            <Menu size={16} />
            <span>카테고리</span>
          </button>
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
          <div className="relative h-full w-64 min-w-64 shadow-2xl lg:w-72">
            <Sidebar activeSlug={activeSlug} activeSituation={activeSituation} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  )
}
