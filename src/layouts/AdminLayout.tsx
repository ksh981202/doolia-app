import { FileImage, LayoutDashboard, Menu, NotebookPen, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

export function ProtectedAdminLayout() {
  return <AdminLayout />
}

const NAV = [
  { to: '/admin', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/admin/printables', label: '도안 관리', icon: FileImage, end: true },
  { to: '/admin/printables/upload', label: '대량 업로드', icon: Upload, end: true },
  { to: '/admin/tips', label: '육아 팁 관리', icon: NotebookPen, end: false },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const logout = () => {
    navigate('/', { replace: true })
  }

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold',
              isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50',
            )
          }
        >
          <item.icon size={16} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 shrink-0 border-r border-emerald-100 bg-white lg:flex lg:flex-col">
        <div className="border-b border-emerald-50 px-4 py-5">
          <p className="text-xs font-extrabold tracking-[0.16em] text-emerald-600">DOOLIA ADMIN</p>
          <p className="mt-1 text-sm font-bold text-slate-800">콘텐츠 관리</p>
        </div>
        {nav}
        <button type="button" onClick={logout} className="mx-3 mb-4 mt-auto rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-500 hover:bg-slate-50">
          로그아웃
        </button>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="닫기" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[min(85vw,16rem)] flex-col bg-white shadow-2xl">
            <div className="border-b border-emerald-50 px-4 py-4">
              <p className="text-xs font-extrabold tracking-[0.16em] text-emerald-600">DOOLIA ADMIN</p>
            </div>
            {nav}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-emerald-100 bg-white/95 px-4 backdrop-blur">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="메뉴"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <p className="text-sm font-extrabold text-slate-800">관리자 대시보드</p>
          <a href="/" className="ml-auto text-xs font-bold text-emerald-700 hover:underline">
            사이트로 돌아가기
          </a>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
