import { ChevronDown } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useSearchParams } from 'react-router-dom'
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

function itemClass(selected: boolean) {
  return cn(
    'block rounded-lg px-3 py-2.5 text-[14px] leading-normal',
    selected
      ? 'bg-emerald-50 font-bold text-emerald-700'
      : 'font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900',
  )
}

export function Sidebar({ activeSlug, onNavigate }: SidebarProps) {
  const [params] = useSearchParams()
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
    else ids.push('age', 'kids')
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
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col border-r border-line bg-white pr-6">
      <nav className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 pt-4" aria-label="카테고리">
        <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/50 p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between px-2 py-1.5">
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <span>📦</span>
              <span>5대 상황별 놀이 도구함</span>
            </span>
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              HIT
            </span>
          </div>
          <div className="space-y-1">
            {SITUATION_ITEMS.map((item) => (
              <NavLink
                key={item.id}
                to={situationPath(item.id)}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white/80 text-slate-800 hover:bg-white hover:text-emerald-700',
                  )
                }
              >
                <span>{item.emoji}</span>
                <span className="text-[14px] font-bold sm:text-[15px]">{item.title}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 shadow-sm">
          <div className="mb-2.5 flex items-center justify-between border-b border-slate-200/60 px-2 py-1 pb-2">
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <span>📚</span>
              <span>무료 도안 모아보기</span>
            </span>
            <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              ALL
            </span>
          </div>
          <div className="space-y-4">
          <AccordionGroup
            id="age"
            open={isOpen('age')}
            title="👶 연령별 모아보기"
            onToggle={() => toggle('age')}
          >
            {AGE_BROWSE_ITEMS.map((item) => (
              <Link
                key={item.id}
                to={`/category?age=${item.id}`}
                onClick={onNavigate}
                className={cn(itemClass(activeAge === item.id), 'whitespace-nowrap')}
              >
                {item.browseLabel}
              </Link>
            ))}
          </AccordionGroup>

          {CATALOG_GROUPS.map((group) => (
            <AccordionGroup
              key={group.id}
              id={group.id}
              open={isOpen(group.id)}
              title={`${group.emoji} ${group.label}`}
              onToggle={() => toggle(group.id)}
            >
              {group.children.map((child) => (
                <Link
                  key={child.id}
                  to={catalogLink(child.id, params)}
                  onClick={onNavigate}
                  className={cn(itemClass(activeCategory === child.id), 'whitespace-nowrap')}
                >
                  {child.label}
                </Link>
              ))}
            </AccordionGroup>
          ))}
          </div>
        </div>
      </nav>

      <div className="p-4">
        <Link
          to="/premium"
          onClick={onNavigate}
          className="flex h-12 items-center justify-center rounded-2xl bg-slate-900 text-[15px] font-bold text-white shadow-lg transition-colors hover:bg-slate-800"
        >
          MEGA 묶음집 ($4.99)
        </Link>
      </div>
    </aside>
  )
}

function AccordionGroup({
  id,
  open,
  title,
  badge,
  highlight,
  onToggle,
  children,
}: {
  id: string
  open: boolean
  title: string
  badge?: string
  highlight?: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className={cn('mb-0.5', highlight && 'rounded-2xl bg-emerald-50/80 p-1 ring-1 ring-emerald-100')}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[15px] font-bold text-slate-900',
          highlight ? 'hover:bg-emerald-100/70' : 'hover:bg-emerald-50',
        )}
        aria-expanded={open}
        aria-controls={`sidebar-${id}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate">{title}</span>
          {badge ? (
            <span className="shrink-0 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-white">
              {badge}
            </span>
          ) : null}
        </span>
        <ChevronDown size={16} className={cn('shrink-0 text-muted transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div
        id={`sidebar-${id}`}
        className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mb-1 ml-2 space-y-0.5 border-l border-line pb-1 pl-3">{children}</div>
        </div>
      </div>
    </div>
  )
}
