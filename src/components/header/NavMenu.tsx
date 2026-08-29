import { useTranslation } from 'react-i18next'
import { HEADER_NAV, isNavActive, type HeaderNavItem } from '@/components/header/nav'
import { cn } from '@/shared/lib/cn'

export function NavMenu({
  pathname,
  hash,
  mobile = false,
  onSelect,
}: {
  pathname: string
  hash: string
  mobile?: boolean
  onSelect: (item: HeaderNavItem) => void
}) {
  const { t } = useTranslation()

  return (
    <nav
      className={
        mobile
          ? 'flex flex-col gap-1'
          : 'hidden items-center justify-center gap-2 md:flex lg:gap-4'
      }
      aria-label={t('nav.home')}
    >
      {HEADER_NAV.map((item) => (
        <NavItem
          key={item.labelKey}
          label={t(item.labelKey)}
          active={isNavActive(item, pathname, hash)}
          mobile={mobile}
          onClick={() => onSelect(item)}
        />
      ))}
    </nav>
  )
}

function NavItem({
  label,
  active,
  mobile = false,
  onClick,
}: {
  label: string
  active: boolean
  mobile?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full whitespace-nowrap font-medium transition-colors',
        mobile ? 'rounded-xl px-3 py-3 text-left' : 'w-auto px-1 py-2 text-[13px] lg:text-sm',
        active ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-600',
      )}
    >
      {label}
      {active ? (
        <span
          className={cn(
            'absolute rounded-full bg-emerald-600',
            mobile ? 'top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2' : 'bottom-0 left-1/2 h-1 w-4 -translate-x-1/2',
          )}
          aria-hidden
        />
      ) : null}
    </button>
  )
}
