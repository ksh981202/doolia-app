import { Menu, Search, Settings, X } from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { isLocalAdminHost } from '@/admin/AdminGuard'
import { HEADER_NAV_ITEMS, isHeaderNavActive } from '@/components/header/nav'
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher'
import { Logo } from '@/components/header/Logo'
import { NavMenu } from '@/components/header/NavMenu'
import { DEFAULT_CATEGORY_SLUG, categoryPath } from '@/shared/config/catalog'
import { TOUCH_ICON, cn } from '@/shared/lib/cn'

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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isCategory = location.pathname.startsWith('/category')

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isMobileMenuOpen && !isSearchOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsMobileMenuOpen(false)
      setIsSearchOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMobileMenuOpen, isSearchOpen])

  useEffect(() => {
    if (!isSearchOpen) return
    searchInputRef.current?.focus()
  }, [isSearchOpen])

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
    setIsSearchOpen(false)
    if (!isCategory) {
      navigate(
        `${categoryPath(DEFAULT_CATEGORY_SLUG)}${nextQuery ? `?q=${encodeURIComponent(nextQuery)}` : ''}`,
      )
      return
    }
    const next = new URLSearchParams(params)
    if (nextQuery) next.set('q', nextQuery)
    else next.delete('q')
    setParams(next, { replace: true })
  }

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    applyQuery(query)
  }

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
        <div className="justify-self-start">
          <Logo />
        </div>

        <nav className="hidden min-w-0 items-center justify-center gap-2 overflow-hidden md:flex lg:gap-4" aria-label="주요 메뉴">
          {HEADER_NAV_ITEMS.map((menu) => (
            <Link
              key={menu.id}
              to={menu.path}
              className={cn(
                'inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-2xl border border-slate-200/70 bg-slate-50/90 px-2.5 py-2 text-[13.5px] font-bold text-slate-700 shadow-2xs transition-all duration-200 hover:scale-[1.02] hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-700 hover:shadow-xs lg:gap-2 lg:px-3.5 lg:text-[15.5px]',
                isHeaderNavActive(menu, location.pathname, params)
                  ? 'border-emerald-300 bg-emerald-50/80 text-emerald-700 shadow-xs'
                  : '',
              )}
            >
              <span className="shrink-0 text-[17px] leading-none">{menu.icon}</span>
              <span className="min-w-0 truncate">
                {t(menu.labelKey, {
                  defaultValue: menu.id === 'animals' ? '🐶 귀여운 동물' : '🎨 전체 도안',
                })}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false)
              setIsSearchOpen(true)
            }}
            aria-label={t('home.searchBtn', '검색')}
            aria-expanded={isSearchOpen}
            className={cn(iconButtonClass, 'max-sm:hidden')}
          >
            <Search size={18} />
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
          <button
            type="button"
            className={cn(iconButtonClass, 'md:hidden')}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            onClick={() => {
              setIsSearchOpen(false)
              setIsMobileMenuOpen((open) => !open)
            }}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {isSearchOpen
        ? createPortal(
            <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t('home.searchBtn', '검색')}>
              <button
                type="button"
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
                aria-label={t('detail.back', '닫기')}
                onClick={() => setIsSearchOpen(false)}
              />
              <div className="relative mx-auto mt-20 w-full max-w-xl px-4">
                <form
                  onSubmit={submitSearch}
                  className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-2xl"
                >
                  <Search size={18} className="ml-2 shrink-0 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('header.searchPlaceholder', '도안 이름, 놀이 아이디어를 검색하세요')}
                    className="h-11 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    {t('home.searchBtn', '검색')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    aria-label={t('detail.back', '닫기')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    <X size={16} />
                  </button>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

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
                    <Logo onNavigate={() => setIsMobileMenuOpen(false)} />
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
