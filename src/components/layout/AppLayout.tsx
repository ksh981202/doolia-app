import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/layout/Footer'
import { DownloadModal } from '@/features/download/ui/DownloadModal'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <DownloadModal />
    </div>
  )
}
