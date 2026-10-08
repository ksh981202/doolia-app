import { FileImage, LayoutDashboard, Mail, Menu, ShieldAlert, ShoppingBag, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { AdminGuard, logoutAdminSession } from '@/admin/AdminGuard'
import { useAdminPendingCounts } from '@/admin/useAdminPendingCounts'
import { cn } from '@/shared/lib/cn'

export function ProtectedAdminLayout() {
  return (
    <AdminGuard>
      <AdminLayout />
    </AdminGuard>
  )
}

const NAV = [
  { to: '/admin', label: '📊 대시보드', icon: LayoutDashboard, end: true, badge: null },
  { to: '/admin/printables', label: '🎨 도안 관리', icon: FileImage, end: true, badge: null },
  { to: '/admin/affiliates', label: '🛍️ 제휴마케팅 관리', icon: ShoppingBag, end: true, badge: null },
  { to: '/admin/printables/upload', label: '⬆️ 대량 업로드', icon: Upload, end: true, badge: null },
  { to: '/admin/reports', label: '🛡️ 저작권 문의', icon: ShieldAlert, end: true, badge: 'reports' as const },
  { to: '/admin/inquiries', label: '📬 일반 문의', icon: Mail, end: true, badge: 'inquiries' as const },
]

function SiteHomeLink() {
  return (
    <div className="mb-4 px-3 pt-3">
      <Link
        to="/"
        className="group flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-100/80 px-3.5 py-2.5 text-slate-700 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      >
        <div className="flex items-center gap-2">
          <span className="text-base transition-transform group-hover:scale-110">🏠</span>
          <span className="text-xs font-bold">사이트 홈으로</span>
        </div>
        <span className="text-xs text-slate-400 group-hover:text-emerald-600">↗</span>
      </Link>
    </div>
  )
}

function PendingBadge() {
  return (
    <span className="ml-auto inline-flex items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white shadow-xs">
      N
    </span>
  )
}

function AdminNav({
  pendingReportsCount,
  pendingInquiriesCount,
  onNavigate,
}: {
  pendingReportsCount: number
  pendingInquiriesCount: number
  onNavigate: () => void
}) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const showBadge =
          (item.badge === 'reports' && pendingReportsCount > 0) ||
          (item.badge === 'inquiries' && pendingInquiriesCount > 0)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold',
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50',
              )
            }
          >
            <item.icon size={16} />
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span>{item.label}</span>
              {showBadge ? <PendingBadge /> : null}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pendingReportsCount, pendingInquiriesCount } = useAdminPendingCounts()

  const logout = () => {
    void logoutAdminSession().then(() => navigate('/', { replace: true }))
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 shrink-0 border-r border-emerald-100 bg-white lg:flex lg:flex-col">
        <div className="border-b border-emerald-50 px-4 py-5">
          <Link to="/" className="inline-block">
            <img
              src="/doolia-logo.png"
              alt="DOOLIA"
              className="h-8 w-auto max-w-full object-contain"
              onError={(e) => {
                console.error('Logo load failed:', e)
              }}
            />
          </Link>
          <p className="mt-2 text-sm font-bold text-slate-800">콘텐츠 관리</p>
        </div>
        <SiteHomeLink />
        <AdminNav
          pendingReportsCount={pendingReportsCount}
          pendingInquiriesCount={pendingInquiriesCount}
          onNavigate={() => setOpen(false)}
        />
        <button type="button" onClick={logout} className="mx-3 mb-4 mt-auto rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-500 hover:bg-slate-50">
          로그아웃
        </button>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="닫기" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[min(85vw,16rem)] flex-col bg-white shadow-2xl">
            <div className="border-b border-emerald-50 px-4 py-4">
              <Link to="/" className="inline-block">
                <img
                  src="/doolia-logo.png"
                  alt="DOOLIA"
                  className="h-8 w-auto max-w-full object-contain"
                  onError={(e) => {
                    console.error('Logo load failed:', e)
                  }}
                />
              </Link>
            </div>
            <SiteHomeLink />
            <AdminNav
              pendingReportsCount={pendingReportsCount}
              pendingInquiriesCount={pendingInquiriesCount}
              onNavigate={() => setOpen(false)}
            />
            <button type="button" onClick={logout} className="mx-3 mb-4 mt-auto rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-500 hover:bg-slate-50">
              로그아웃
            </button>
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
