import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { CATALOG_GROUPS, categoryPath, getCatalogTopic } from '@/shared/config/catalog'
import { SITUATION_ITEMS, situationPath } from '@/shared/config/playSituations'
import { AGE_BROWSE_ITEMS, isAgeFilterId } from '@/shared/config/smartFilters'
import { cn } from '@/shared/lib/cn'

type SidebarProps = {
  activeSlug?: string
  activeSituation?: string
  onNavigate?: () => void
}

function catalogLink(slug: string, params: URLSearchParams) {
  const next = new URLSearchParams()
  const age = params.get('age')
  const theme = params.get('theme')
  const query = params.get('q')
  const sort = params.get('sort')
  if (age) next.set('age', age)
  if (theme) next.set('theme', theme)
  if (query) next.set('q', query)
  if (sort) next.set('sort', sort)
  const search = next.toString()
  return `${categoryPath(slug)}${search ? `?${search}` : ''}`
}

export function Sidebar({ activeSlug, onNavigate }: SidebarProps) {
  const location = useLocation()
  const [params] = useSearchParams()
  const catalogAllActive = location.pathname === '/category' && !location.search
  const ageParam = params.get('age') ?? ''
  const activeAge = isAgeFilterId(ageParam) && ageParam !== 'all' ? ageParam : null
  const categoryParam = params.get('category')
  const activeCategory =
    activeSlug ?? (categoryParam && getCatalogTopic(categoryParam) ? categoryParam : undefined)
  const activeGroupId = CATALOG_GROUPS.find((group) =>
    group.children.some((child) => child.id === activeCategory),
  )?.id

  const [openIds, setOpenIds] = useState<string[]>(() => {
    const ids: string[] = []
    if (activeAge) ids.push('age')
    if (activeGroupId) ids.push(activeGroupId)
    else ids.push('kids')
    return [...new Set(ids)]
  })

  useEffect(() => {
    const next: string[] = []
    if (activeAge) next.push('age')
    if (activeGroupId) next.push(activeGroupId)
    if (next.length === 0) return
    setOpenIds((current) => [...new Set([...current, ...next])])
  }, [activeAge, activeGroupId])

  const isOpen = (id: string) => openIds.includes(id)

  const toggle = (id: string) => {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id],
    )
  }

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 select-none flex-col gap-5 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4 font-sans lg:w-72">
      <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto" aria-label="카테고리">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 shadow-2xs">
          <Link
            to="/situation/all"
            onClick={onNavigate}
            className="group mb-2.5 flex cursor-pointer items-center justify-between px-1"
          >
            <span className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-slate-900 group-hover:text-emerald-700">
              <span className="text-base">📦</span>
              <span>맞춤 놀이 도구함</span>
            </span>
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
              HIT
            </span>
          </Link>
          <div className="space-y-1">
            {SITUATION_ITEMS.map((item) => (
              <NavLink
                key={item.id}
                to={situationPath(item.id)}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14.5px] font-bold tracking-tight transition-all',
                    isActive
                      ? 'bg-emerald-50 font-extrabold text-emerald-900'
                      : 'text-slate-800 hover:bg-emerald-50 hover:text-emerald-900',
                  )
                }
              >
                <span className="text-base">{item.emoji}</span>
                <span className="tracking-tight">{item.title}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <Link
          to="/category"
          onClick={onNavigate}
          className={cn(
            'flex items-center justify-between rounded-2xl border px-4 py-3 text-[15px] font-bold tracking-tight shadow-2xs transition-all',
            catalogAllActive
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
              : 'border-slate-200/80 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50',
          )}
        >
          <span className="flex items-center gap-2">
            <span className="text-base">📚</span>
            <span>무료 도안 모아보기</span>
          </span>
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
              catalogAllActive ? 'bg-white text-emerald-700' : 'bg-slate-100 text-slate-600',
            )}
          >
            ALL
          </span>
        </Link>

        <div className="space-y-1.5">
          <AccordionCard
            open={isOpen('age')}
            icon="👶"
            title="연령별 모아보기"
            onToggle={() => toggle('age')}
          >
            {AGE_BROWSE_ITEMS.map((item) => (
              <SubMenuLink
                key={item.id}
                to={`/category?age=${item.id}`}
                active={activeAge === item.id}
                onClick={onNavigate}
              >
                {item.browseLabel}
              </SubMenuLink>
            ))}
          </AccordionCard>

          {CATALOG_GROUPS.map((group) => (
            <AccordionCard
              key={group.id}
              open={isOpen(group.id)}
              icon={group.emoji}
              title={group.label}
              onToggle={() => toggle(group.id)}
            >
              {group.children.map((child) => (
                <SubMenuLink
                  key={child.id}
                  to={catalogLink(child.id, params)}
                  active={activeCategory === child.id}
                  onClick={onNavigate}
                >
                  {child.label}
                </SubMenuLink>
              ))}
            </AccordionCard>
          ))}
        </div>
      </nav>
    </aside>
  )
}

function SubMenuLink({
  to,
  active,
  onClick,
  children,
}: {
  to: string
  active: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-bold transition-all',
        active
          ? 'bg-emerald-50 font-extrabold text-emerald-900'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 shrink-0 rounded-full transition-all',
          active ? 'scale-125 bg-emerald-600' : 'bg-slate-300 group-hover:bg-slate-400',
        )}
      />
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
