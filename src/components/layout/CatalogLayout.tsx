import { useState } from 'react'
import { Outlet, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Header } from '@/components/Header'
import { CatalogHeader } from '@/components/layout/CatalogHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { DownloadModal } from '@/features/download/ui/DownloadModal'
import { getCatalogTopic } from '@/shared/config/catalog'
import { isSituationId } from '@/shared/config/playSituations'
import { resolveTypeSlug } from '@/shared/config/smartFilters'
import { cn } from '@/shared/lib/cn'

function isParentingTipDetail(pathname: string) {
  return /^\/parenting-tips\/[^/]+\/?$/.test(pathname) || /^\/tips\/[^/]+\/?$/.test(pathname)
}

export function CatalogLayout() {
  const location = useLocation()
  const { slug, situationId } = useParams()
  const tipDetail = isParentingTipDetail(location.pathname)
  const [params] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const categoryQuery = params.get('category')
  const fromCategoryQuery = getCatalogTopic(categoryQuery ?? undefined)?.topic.id
  const categorySlug = location.pathname.startsWith('/category') ? slug : undefined
  const activeSlug = categorySlug ?? resolveTypeSlug(params.get('type')) ?? fromCategoryQuery
  const activeSituation = isSituationId(situationId) ? situationId : undefined

  return (
    <div className={cn('flex min-h-screen flex-col', tipDetail ? 'bg-white' : 'bg-page')}>
      <Header />
      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:flex">
          <Sidebar activeSlug={activeSlug} activeSituation={activeSituation} />
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
              <Sidebar activeSlug={activeSlug} activeSituation={activeSituation} onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className={cn('flex min-w-0 flex-1 flex-col', tipDetail && 'bg-white')}>
          <CatalogHeader onMenu={() => setSidebarOpen(true)} />
          <div className={cn('min-w-0 flex-1', tipDetail && 'bg-white')}>
            <Outlet />
          </div>
        </div>
      </div>
      <DownloadModal />
    </div>
  )
}
