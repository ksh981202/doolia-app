import { Menu, Settings, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher'
import { Logo } from '@/components/header/Logo'
import { NavMenu } from '@/components/header/NavMenu'
import { CATEGORY_NAV, type HeaderNavItem } from '@/components/header/nav'
import { SITUATION_ITEMS, situationPath } from '@/shared/config/playSituations'

function isLocalAdminHost() {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

export function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname !== '/') return
    const id = location.hash.replace('#', '')
    if (!id) return
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
    return () => window.clearTimeout(timer)
  }, [location.hash, location.pathname])

  const goToNav = (item: HeaderNavItem) => {
    setOpen(false)
    if (item.to === '/') {
      navigate('/')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate(item.to)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-[1600px] grid-cols-[1fr_auto] items-center px-4 sm:h-20 sm:px-6 md:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Logo onNavigate={() => setOpen(false)} />
        <NavMenu pathname={location.pathname} hash={location.hash} onSelect={goToNav} />
        <div className="flex items-center justify-self-end gap-2">
          <LanguageSwitcher />
          {isLocalAdminHost() ? (
            <button
              type="button"
              title="관리자 대시보드 (Local Only)"
              aria-label="관리자 대시보드 (Local Only)"
              onClick={() => navigate('/admin')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              <Settings size={18} />
            </button>
          ) : null}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-700 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-gray-100 bg-white/95 px-4 py-4 backdrop-blur-md md:hidden">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-1">
            <NavMenu pathname={location.pathname} hash={location.hash} mobile onSelect={goToNav} />
            <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
              <div>
                <p className="flex items-center gap-2 px-3 text-[11px] font-extrabold tracking-wide text-emerald-800">
                  <span>📦 5대 상황별 놀이 도구함</span>
                  <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">HIT</span>
                </p>
                <div className="mt-1 flex flex-col">
                  {SITUATION_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        navigate(situationPath(item.id))
                      }}
                      className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700"
                    >
                      <span className="block break-keep">
                        {item.emoji} {item.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              {CATEGORY_NAV.map((group) => (
                <div key={group.id}>
                  <p className="px-3 text-[11px] font-extrabold tracking-wide text-slate-500">
                    {group.emoji} {group.label}
                  </p>
                  <div className="mt-1 flex flex-col">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          navigate(item.to)
                        }}
                        className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700"
                      >
                        <span className="break-keep whitespace-nowrap">
                          {item.emoji} {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
