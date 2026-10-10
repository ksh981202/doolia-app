import { Bookmark, Menu, Search } from 'lucide-react'
import { type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { categorySearchPath } from '@/shared/config/catalog'
import { useBookmarkStore } from '@/shared/store/useBookmarkStore'

type CatalogHeaderProps = {
  onMenu: () => void
}

export function CatalogHeader({ onMenu }: CatalogHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const bookmarkCount = useBookmarkStore((state) => state.ids.length)
  const query = params.get('q') ?? ''

  const applyQuery = (value: string) => {
    navigate(categorySearchPath(value), { replace: location.pathname.startsWith('/category') })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    applyQuery(query.trim())
  }

  return (
    <header className="sticky top-16 z-30 flex h-[64px] items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur-md sm:top-20 sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line lg:hidden"
        aria-label="카테고리 메뉴"
      >
        <Menu size={18} />
      </button>

      <form
        onSubmit={submit}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-page px-3 py-1.5"
      >
        <Search size={18} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(event) => applyQuery(event.target.value)}
          placeholder={t('header.searchPlaceholder', '도안 이름, 놀이 아이디어를 검색하세요')}
          className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </form>

      <button
        type="button"
        onClick={() => navigate('/bookmarks')}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink"
        aria-label="북마크"
      >
        <Bookmark size={18} />
        {bookmarkCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-extrabold text-white">
            {bookmarkCount}
          </span>
        ) : null}
      </button>
    </header>
  )
}
