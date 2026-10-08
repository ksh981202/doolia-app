import { ChevronLeft, Menu, Search, Settings, X } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { isLocalAdminHost } from '@/admin/AdminGuard'
import { HEADER_NAV_ITEMS, isHeaderNavActive } from '@/components/header/nav'
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher'
import { Logo } from '@/components/header/Logo'
import { NavMenu } from '@/components/header/NavMenu'
import { TOUCH_ICON, cn } from '@/shared/lib/cn'

function isHomePath(pathname: string) {
  return pathname === '/' || pathname === '/v2'
}

const iconButtonClass =
  `${TOUCH_ICON} rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-emerald-700`


export function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isHome = isHomePath(location.pathname)
  const isCategory = location.pathname.startsWith('/category')

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMobileMenuOpen])

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
    <header className="no-print sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
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
                  'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[16px] font-bold text-slate-800 transition-all hover:bg-slate-50 hover:text-emerald-600',
                  isHeaderNavActive(menu, location.pathname, params)
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-800'
                    : '',
                )}
              >
                <span className="text-[18px] leading-none">{menu.icon}</span>
                <span className="text-[16px] font-bold leading-none">{t(menu.labelKey)}</span>
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
          <button
            type="button"
            className={cn(iconButtonClass, 'md:hidden')}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={isMobileMenuOpen ? t('detail.back', '메뉴 닫기') : '메뉴 열기'}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            <Menu size={18} />
          </button>
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

      {isMobileMenuOpen
        ? createPortal(
            <div className="md:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-nav-drawer">
              <button
                type="button"
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                aria-label={t('detail.back', '메뉴 닫기')}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div
                id="mobile-nav-drawer"
                className="fixed top-0 right-0 bottom-0 z-50 flex w-[280px] flex-col justify-between overflow-y-auto bg-white p-6 shadow-2xl sm:w-[320px]"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="inline-block">
                      <img src="/doolia-logo.png" alt="DOOLIA" className="h-7.5 w-auto object-contain" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label={t('detail.back', '메뉴 닫기')}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 hover:bg-slate-200"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="mb-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">MENU</p>
                  <NavMenu
                    pathname={location.pathname}
                    search={params}
                    mobile
                    onSelect={() => setIsMobileMenuOpen(false)}
                  />
                </div>
                <div className="mt-8 border-t border-slate-100 pt-5">
                  <LanguageSwitcher listPlacement="top" />
                  <div className="mt-4 flex flex-col gap-1">
                    <Link
                      to="/contact"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-lg px-1 py-2 text-[13px] font-semibold text-slate-500 hover:text-emerald-700"
                    >
                      {t('footer.contact')}
                    </Link>
                    <Link
                      to="/report"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-lg px-1 py-2 text-[13px] font-semibold text-slate-500 hover:text-emerald-700"
                    >
                      {t('footer.dmca', '저작권/권리침해 신고')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  )
}
