import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { CATALOG_NAV_GROUPS, type CatalogNavItem } from '@/shared/config/catalog'
import { isAgeFilterId } from '@/shared/config/smartFilters'
import { cn } from '@/shared/lib/cn'

type SidebarProps = {
  activeSlug?: string
  activeSituation?: string
  onNavigate?: () => void
}

const DEFAULT_OPEN_IDS = ['kids-age', 'kids-theme'] as const

function navItemActive(item: CatalogNavItem, pathname: string, search: URLSearchParams) {
  const url = new URL(item.path, 'http://doolia.local')
  if (pathname !== url.pathname) {
    if (url.searchParams.has('age') && pathname === '/category') {
      const age = url.searchParams.get('age')
      return Boolean(age) && search.get('age') === age
    }
    return false
  }
  for (const [key, value] of url.searchParams.entries()) {
    if (search.get(key) !== value) return false
  }
  return true
}

export function Sidebar({ activeSlug, onNavigate }: SidebarProps) {
  const location = useLocation()
  const [params] = useSearchParams()
  const catalogAllActive = location.pathname === '/category' && !params.get('age') && !params.get('q')
  const onKidsThemes = location.pathname === '/category/coloring-pages' || activeSlug === 'coloring-pages'
  const onSeniorThemes = location.pathname === '/category/senior-art' || activeSlug === 'senior-art'
  const ageParam = params.get('age') ?? ''
  const onAgeBrowse = isAgeFilterId(ageParam) && ageParam !== 'all'

  const [openIds, setOpenIds] = useState<string[]>(() => {
    const ids: string[] = [...DEFAULT_OPEN_IDS]
    if (onSeniorThemes) ids.push('senior-art')
    if (onAgeBrowse) ids.push('kids-age')
    return [...new Set(ids)]
  })

  useEffect(() => {
    setOpenIds((current) => {
      const extra: string[] = []
      if (onSeniorThemes) extra.push('senior-art')
      if (onKidsThemes) extra.push('kids-theme')
      if (onAgeBrowse) extra.push('kids-age')
      if (extra.length === 0) return current
      return [...new Set([...current, ...extra])]
    })
  }, [onAgeBrowse, onKidsThemes, onSeniorThemes])

  const isOpen = (id: string) => openIds.includes(id)

  const toggle = (id: string) => {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id],
    )
  }

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 select-none flex-col gap-5 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4 font-sans lg:w-72">
      <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto" aria-label="카테고리">
        <Link
          to="/category"
          onClick={onNavigate}
          className={cn(
            'flex items-center justify-between rounded-2xl border px-4 py-3 text-[15px] font-bold tracking-tight shadow-2xs transition-all',
            catalogAllActive
              ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-700 shadow-sm'
              : 'border-slate-200/80 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50',
          )}
        >
          <span className="flex items-center gap-2">
            <span className="text-base">📚</span>
            <span>전체 색칠도안</span>
          </span>
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
              catalogAllActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600',
            )}
          >
            ALL
          </span>
        </Link>

        {CATALOG_NAV_GROUPS.map((group) => (
          <AccordionCard
            key={group.id}
            open={isOpen(group.id)}
            icon={group.icon}
            title={group.name}
            onToggle={() => toggle(group.id)}
          >
            {group.items.map((item) => (
              <SubMenuLink
                key={item.id}
                to={item.path}
                active={navItemActive(item, location.pathname, params)}
                icon={item.icon}
                onClick={onNavigate}
              >
                {item.name}
              </SubMenuLink>
            ))}
          </AccordionCard>
        ))}
      </nav>
    </aside>
  )
}

function SubMenuLink({
  to,
  active,
  onClick,
  icon,
  children,
}: {
  to: string
  active: boolean
  onClick?: () => void
  icon?: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-bold transition-all',
        active
          ? 'bg-emerald-50 font-bold text-emerald-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      )}
    >
      {icon ? (
        <span className="w-5 shrink-0 text-center text-sm leading-none">{icon}</span>
      ) : (
        <span
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full transition-all',
            active ? 'scale-125 bg-emerald-600' : 'bg-slate-300 group-hover:bg-slate-400',
          )}
        />
      )}
      <span className="tracking-tight">{children}</span>
    </Link>
  )
}

function AccordionCard({
  open,
  icon,
  title,
  onToggle,
  children,
}: {
  open: boolean
  icon: string
  title: string
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-2 shadow-2xs">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[14.5px] font-bold tracking-tight text-slate-800 transition-colors hover:text-emerald-700"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span>{title}</span>
        </span>
        <span className="text-xs text-slate-400">{open ? '▲' : '▼'}</span>
      </button>
      {open ? (
        <div className="mt-1 space-y-0.5 border-t border-slate-100 pt-1.5">{children}</div>
      ) : null}
    </div>
  )
}
