import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/layout/Footer'
import { DownloadModal } from '@/features/download/ui/DownloadModal'

export function AppLayout() {
  const { pathname } = useLocation()
  const isPlayHub = pathname === '/' || pathname === '/v2'

  return (
    <div className="flex min-h-screen flex-col">
      {isPlayHub ? null : <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <DownloadModal />
    </div>
  )
}
