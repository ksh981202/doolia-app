import { ChevronLeft, Search, Settings } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { HEADER_NAV_ITEMS, isHeaderNavActive } from '@/components/header/nav'
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher'
import { Logo } from '@/components/header/Logo'
import { cn } from '@/shared/lib/cn'

function isLocalAdminHost() {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

function isHomePath(pathname: string) {
  return pathname === '/' || pathname === '/v2'
}

const iconButtonClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-emerald-700'


export function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const isHome = isHomePath(location.pathname)
  const isCategory = location.pathname.startsWith('/category')

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    if (location.pathname !== '/') return
    const id = location.hash.replace('#', '')
    if (!id) return
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
    return () => window.clearTimeout(timer)
  }, [location.hash, location.pathname])

  const applyQuery = (value: string) => {
    const nextQuery = value.trim()
    if (!isCategory) {
      navigate(`/category${nextQuery ? `?q=${encodeURIComponent(nextQuery)}` : ''}`)
      return
    }
    const next = new URLSearchParams(params)
    if (nextQuery) next.set('q', nextQuery)
    else next.delete('q')
    setParams(next, { replace: true })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    applyQuery(query)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_minmax(0,42rem)_1fr] items-center gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
        <div className="justify-self-start">
          <Logo />
        </div>

        {isHome ? (
          <nav className="hidden items-center justify-center gap-2 md:flex lg:gap-2.5" aria-label="주요 메뉴">
            {HEADER_NAV_ITEMS.map((menu) => (
              <Link
                key={menu.id}
                to={menu.path}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-2xl px-2.5 py-2 text-[12.5px] font-bold transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-800 active:scale-98 lg:px-4 lg:text-[13.5px]',
                  isHeaderNavActive(menu, location.pathname, params)
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-700',
                )}
              >
                <span className="text-base">{menu.icon}</span>
                <span className="tracking-tight">{t(menu.labelKey)}</span>
              </Link>
            ))}
          </nav>
        ) : (
          <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label={t('detail.back', '뒤로 가기')}
              title={t('detail.back', '뒤로 가기')}
              className={iconButtonClass}
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <form onSubmit={submit} className="relative min-w-0 flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  const value = event.target.value
                  setQuery(value)
                  if (isCategory) applyQuery(value)
                }}
                placeholder={t('header.searchPlaceholder', '도안 이름, 놀이 아이디어를 검색하세요')}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </form>
          </div>
        )}

        <div className="flex items-center justify-self-end gap-2">
          <LanguageSwitcher />
          {isLocalAdminHost() ? (
            <button
              type="button"
              title="관리자 대시보드 (Local Only)"
              aria-label="관리자 대시보드 (Local Only)"
              onClick={() => navigate('/admin')}
              className={iconButtonClass}
            >
              <Settings size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
