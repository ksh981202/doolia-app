import { useState } from 'react'
import { Outlet, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Header } from '@/components/Header'
import { CatalogHeader } from '@/components/layout/CatalogHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { DownloadModal } from '@/features/download/ui/DownloadModal'
import { getCatalogTopic } from '@/shared/config/catalog'
import { resolveTypeSlug } from '@/shared/config/smartFilters'

export function CatalogLayout() {
  const location = useLocation()
  const { slug } = useParams()
  const [params] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const categoryQuery = params.get('category')
  const fromCategoryQuery = getCatalogTopic(categoryQuery ?? undefined)?.topic.id
  const categorySlug = location.pathname.startsWith('/category') ? slug : undefined
  const activeSlug = categorySlug ?? resolveTypeSlug(params.get('type')) ?? fromCategoryQuery

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />
      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:flex">
          <Sidebar activeSlug={activeSlug} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              aria-label="메뉴 닫기"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative h-full w-[min(85vw,280px)] min-w-[260px] shadow-2xl">
              <Sidebar activeSlug={activeSlug} onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <CatalogHeader onMenu={() => setSidebarOpen(true)} />
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      </div>
      <DownloadModal />
    </div>
  )
}
