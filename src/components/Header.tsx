import { ChevronLeft, Menu, Search, Settings, X } from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { isLocalAdminHost } from '@/admin/AdminGuard'
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher'
import { Logo } from '@/components/header/Logo'
import { NavMenu } from '@/components/header/NavMenu'
import { DEFAULT_CATEGORY_SLUG, categoryPath } from '@/shared/config/catalog'
import { cn } from '@/shared/lib/cn'

function isDetailPath(pathname: string) {
  return (
    pathname.startsWith('/printable/') ||
    pathname.startsWith('/printables/') ||
    /^\/situation\/[^/]+\/[^/]+/.test(pathname) ||
    /^\/parenting-tips\/[^/]+/.test(pathname)
  )
}

const iconButtonClass =
  'flex h-8.5 w-8.5 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 sm:h-9 sm:w-9'

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
  const isDetailPage = isDetailPath(location.pathname)

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

  const openSearch = () => {
    setIsMobileMenuOpen(false)
    setIsSearchOpen(true)
  }

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 shadow-2xs backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-18 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Logo />
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label="주요 메뉴">
          <Link
            to="/category"
            className="text-[14.5px] font-bold text-slate-700 transition-colors hover:text-emerald-600"
          >
            {t('nav.coloringAll', '색칠도안 전체')}
          </Link>
          <Link
            to="/contact"
            className="text-[14.5px] font-bold text-slate-700 transition-colors hover:text-emerald-600"
          >
            {t('footer.contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {isDetailPage ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="뒤로가기"
              className={iconButtonClass}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={openSearch}
            aria-label={t('home.searchBtn', '검색')}
            aria-expanded={isSearchOpen}
            className={iconButtonClass}
          >
            <Search size={16} strokeWidth={2.2} />
          </button>

          <div className="shrink-0">
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            className={cn(iconButtonClass, 'text-slate-700 md:hidden')}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            onClick={() => {
              setIsSearchOpen(false)
              setIsMobileMenuOpen((open) => !open)
            }}
          >
            <Menu size={18} strokeWidth={2.2} />
          </button>

          {isLocalAdminHost() ? (
            <button
              type="button"
              title="관리자 대시보드 (Local Only)"
              aria-label="관리자 대시보드 (Local Only)"
              onClick={() => navigate('/admin')}
              className={iconButtonClass}
            >
              <Settings size={16} strokeWidth={2.2} />
            </button>
          ) : null}
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
                  <Search size={18} className="ml-2 shrink-0 text-slate-400" strokeWidth={2.2} />
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
