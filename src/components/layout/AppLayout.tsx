import { lazy, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { MainHeader } from '@/components/layout/MainHeader'
import { PAGE_SHELL } from '@/shared/lib/cn'
import { useDownloadStore } from '@/shared/store/useDownloadStore'

const DownloadModal = lazy(() =>
  import('@/features/download/ui/DownloadModal').then((module) => ({ default: module.DownloadModal })),
)

function DeferredDownloadModal() {
  const isOpen = useDownloadStore((state) => state.isOpen)
  if (!isOpen) return null
  return (
    <Suspense fallback={null}>
      <DownloadModal />
    </Suspense>
  )
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800 antialiased">
      <MainHeader />
      <main className="w-full flex-1">
        <div className={PAGE_SHELL}>
          <Outlet />
        </div>
      </main>
      <Footer />
      <DeferredDownloadModal />
    </div>
  )
}
