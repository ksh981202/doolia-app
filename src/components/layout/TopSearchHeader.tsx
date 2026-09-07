import { Bookmark, ChevronLeft, Menu, Search } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { DEFAULT_CATEGORY_SLUG, categoryPath } from '@/shared/config/catalog'
import { cn } from '@/shared/lib/cn'
import { useBookmarkStore } from '@/shared/store/useBookmarkStore'

type TopSearchHeaderProps = {
  onMenu?: () => void
  variant?: 'sticky' | 'inline'
}

function isHomePath(pathname: string) {
  return pathname === '/' || pathname === '/v2'
}

export function TopSearchHeader({ onMenu, variant = 'sticky' }: TopSearchHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const bookmarkCount = useBookmarkStore((state) => state.ids.length)
  const urlQuery = params.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const isHome = isHomePath(location.pathname)
  const isCategory = location.pathname.startsWith('/category')
  const inline = variant === 'inline'
  const showBack = inline || !isHome
  const iconButtonClass = inline
    ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600'
    : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 hover:text-emerald-600 active:bg-slate-200'

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  const applyQuery = (value: string) => {
    const nextQuery = value.trim()
    if (!isCategory) {
      navigate(`${categoryPath(DEFAULT_CATEGORY_SLUG)}${nextQuery ? `?q=${encodeURIComponent(nextQuery)}` : ''}`)
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
    <div
      className={cn(
        inline
          ? 'mb-6 flex items-center gap-3 border-b border-slate-100 pb-4'
          : 'sticky top-0 z-30 w-full border-b border-slate-100 bg-white px-4 py-3',
      )}
    >
      <div className={cn('flex items-center gap-3', inline ? 'w-full' : 'mx-auto max-w-4xl')}>
        {onMenu ? (
          <button
            type="button"
            onClick={onMenu}
            aria-label="카테고리 메뉴"
            className={cn(iconButtonClass, 'lg:hidden')}
          >
            <Menu size={18} />
          </button>
        ) : null}

        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className={iconButtonClass}
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
        ) : null}

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
            placeholder="도안 이름, 놀이 아이디어를 검색하세요"
            className={cn(
              'w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none',
              inline && 'shadow-sm',
            )}
          />
        </form>

        <button
          type="button"
          onClick={() => navigate('/bookmarks')}
          aria-label="저장한 도안"
          className={cn(iconButtonClass, 'relative text-slate-600')}
        >
          <Bookmark size={20} strokeWidth={2} />
          {bookmarkCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-extrabold text-white">
              {bookmarkCount}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  )
}
