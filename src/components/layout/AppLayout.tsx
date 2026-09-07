import { Outlet } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { MainHeader } from '@/components/layout/MainHeader'
import { DownloadModal } from '@/features/download/ui/DownloadModal'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800 antialiased">
      <MainHeader />
      <main className="w-full flex-1">
        <Outlet />
      </main>
      <Footer />
      <DownloadModal />
    </div>
  )
}
