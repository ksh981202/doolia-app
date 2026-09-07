import { Brain, Gift, Home, Lightbulb, Palette, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { HEADER_NAV, isNavActive, type HeaderNavItem } from '@/components/header/nav'
import { cn } from '@/shared/lib/cn'

const NAV_ICONS: Record<HeaderNavItem['match'], LucideIcon> = {
  home: Home,
  playToolbox: Lightbulb,
  coloring: Palette,
  brain: Brain,
  premium: Gift,
}

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
          : 'hidden items-center rounded-full bg-slate-100/80 p-1 md:flex'
      }
      aria-label={t('nav.home')}
    >
      {HEADER_NAV.map((item) => (
        <NavItem
          key={item.labelKey}
          icon={NAV_ICONS[item.match]}
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
  icon: Icon,
  label,
  active,
  mobile = false,
  onClick,
}: {
  icon: LucideIcon
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
        'inline-flex items-center gap-1.5 whitespace-nowrap font-medium transition-colors',
        mobile
          ? 'w-full justify-start rounded-xl px-3 py-3 text-left text-sm'
          : 'w-auto rounded-full px-3 py-1.5 text-[13px] lg:px-3.5 lg:text-sm',
        active
          ? mobile
            ? 'bg-emerald-50 font-bold text-emerald-700'
            : 'bg-white font-bold text-emerald-700 shadow-sm'
          : 'text-gray-600 hover:text-emerald-700',
      )}
    >
      <Icon
        aria-hidden
        className={cn('shrink-0', mobile ? 'h-4 w-4' : 'h-3.5 w-3.5 lg:h-4 lg:w-4')}
        strokeWidth={2}
      />
      {label}
    </button>
  )
}
