import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  return (
    <nav
      className={
        mobile
          ? 'flex flex-col gap-1'
          : 'hidden items-center justify-center gap-2 md:flex lg:gap-2.5'
      }
      aria-label={t('nav.mainMenu', { defaultValue: '주요 메뉴' })}
    >
      {HEADER_NAV_ITEMS.map((item) => (
        <Link
          key={item.id}
          to={item.path}
          onClick={() => onSelect?.(item)}
          className={cn(
            'flex min-w-0 items-center gap-2 font-bold transition-all',
            mobile
              ? 'w-full justify-start gap-3 rounded-xl px-3.5 py-3 text-left text-[14.5px] text-slate-800 hover:bg-emerald-50 hover:text-emerald-700'
              : 'min-w-0 rounded-xl px-3.5 py-2 text-[16px] text-slate-800 hover:bg-slate-50 hover:text-emerald-600',
            isHeaderNavActive(item, pathname, search)
              ? mobile
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-800'
              : '',
          )}
        >
          <span className="text-[18px] leading-none">{item.icon}</span>
          <span className={cn('min-w-0 break-words font-bold leading-snug', mobile ? 'text-[14.5px]' : 'text-[16px]')}>
            {t(item.labelKey, {
              defaultValue: item.id === 'animals' ? '🐶 귀여운 동물' : '🎨 전체 도안',
            })}
          </span>
        </Link>
      ))}
    </nav>
  )
}
