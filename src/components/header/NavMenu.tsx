import { Link } from 'react-router-dom'
import { HEADER_NAV_ITEMS, isHeaderNavActive, type HeaderNavItem } from '@/components/header/nav'
import { cn } from '@/shared/lib/cn'

export function NavMenu({
  pathname,
  search,
  mobile = false,
  onSelect,
}: {
  pathname: string
  search: URLSearchParams
  mobile?: boolean
  onSelect?: (item: HeaderNavItem) => void
}) {
  return (
    <nav
      className={
        mobile
          ? 'flex flex-col gap-1'
          : 'hidden items-center justify-center gap-2 md:flex lg:gap-2.5'
      }
      aria-label="주요 메뉴"
    >
      {HEADER_NAV_ITEMS.map((item) => (
        <Link
          key={item.id}
          to={item.path}
          onClick={() => onSelect?.(item)}
          className={cn(
            'inline-flex items-center gap-1.5 font-bold transition-all duration-200',
            mobile
              ? 'w-full justify-start rounded-xl px-3 py-3 text-left text-sm'
              : 'rounded-2xl px-4 py-2 text-[13.5px] hover:bg-emerald-50 hover:text-emerald-800 active:scale-98',
            isHeaderNavActive(item, pathname, search)
              ? mobile
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-emerald-50 text-emerald-800'
              : 'text-slate-700',
          )}
        >
          <span className="text-base">{item.icon}</span>
          <span className="tracking-tight">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
