import { ChevronDown } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { CATALOG_GROUPS, categoryPath, getCatalogTopic } from '@/shared/config/catalog'
import { SITUATION_ITEMS, isSituationId, situationPath } from '@/shared/config/playSituations'
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
    'block rounded-lg px-3 py-2.5 text-[13px] leading-snug',
    selected
      ? 'bg-emerald-50 font-bold text-emerald-700'
      : 'font-semibold text-ink/70 hover:bg-page hover:text-ink',
  )
}

export function Sidebar({ activeSlug, activeSituation, onNavigate }: SidebarProps) {
  const location = useLocation()
  const [params] = useSearchParams()
  const ageParam = params.get('age') ?? ''
  const activeAge = isAgeFilterId(ageParam) && ageParam !== 'all' ? ageParam : null
  const categoryParam = params.get('category')
  const activeCategory =
    activeSlug ?? (categoryParam && getCatalogTopic(categoryParam) ? categoryParam : undefined)
  const situationFromPath = location.pathname.match(/^\/situation\/([^/]+)/)?.[1]
  const currentSituation =
    (isSituationId(activeSituation) ? activeSituation : undefined) ??
    (isSituationId(situationFromPath) ? situationFromPath : undefined)

  const activeGroupId = CATALOG_GROUPS.find((group) =>
    group.children.some((child) => child.id === activeCategory),
  )?.id

  const [openIds, setOpenIds] = useState<string[]>(() => {
    const ids = ['situation']
    if (activeAge) ids.push('age')
    if (activeGroupId) ids.push(activeGroupId)
    else ids.push('age', 'kids')
    return [...new Set(ids)]
  })

  useEffect(() => {
    const next: string[] = []
    if (currentSituation) next.push('situation')
    if (activeAge) next.push('age')
    if (activeGroupId) next.push(activeGroupId)
    if (next.length === 0) return
    setOpenIds((current) => [...new Set([...current, ...next])])
  }, [activeAge, activeGroupId, currentSituation])

  const isOpen = (id: string) => openIds.includes(id)

  const toggle = (id: string) => {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id],
    )
  }

  return (
    <aside className="flex h-full min-h-0 w-[280px] shrink-0 flex-col border-r border-line bg-white">
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-4" aria-label="카테고리">
        <AccordionGroup
          id="situation"
          open={isOpen('situation')}
          title="📦 5대 상황별 놀이 도구함"
          badge="HIT"
          highlight
          onToggle={() => toggle('situation')}
        >
          {SITUATION_ITEMS.map((item) => (
            <Link
              key={item.id}
              to={situationPath(item.id)}
              onClick={onNavigate}
              className={cn(itemClass(currentSituation === item.id), 'whitespace-normal')}
            >
              <span className="block">
                {item.emoji} {item.title}
              </span>
              <span
                className={cn(
                  'mt-0.5 block text-[11px] font-medium',
                  currentSituation === item.id ? 'text-emerald-600/80' : 'text-muted',
                )}
              >
                {item.sub}
              </span>
            </Link>
          ))}
        </AccordionGroup>

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
      </nav>

      <div className="p-4">
        <Link
          to="/premium"
          onClick={onNavigate}
          className="flex h-12 items-center justify-center rounded-2xl bg-[linear-gradient(120deg,#7c3aed,#4f46e5)] text-sm font-extrabold text-white shadow-lg"
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
          'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-extrabold text-ink',
          highlight ? 'hover:bg-emerald-100/70' : 'hover:bg-emerald-50',
        )}
        aria-expanded={open}
        aria-controls={`sidebar-${id}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate">{title}</span>
          {badge ? (
            <span className="shrink-0 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-white">
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
