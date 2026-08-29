import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { CATALOG_GROUPS, categoryPath, getCatalogTopic } from '@/shared/config/catalog'
import { AGE_BROWSE_ITEMS, isAgeFilterId } from '@/shared/config/smartFilters'
import { cn } from '@/shared/lib/cn'

type SidebarProps = {
  activeSlug?: string
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
    'block rounded-lg px-3 py-2.5 text-[13px] leading-snug whitespace-nowrap',
    selected
      ? 'bg-emerald-50 font-bold text-emerald-700'
      : 'font-semibold text-ink/70 hover:bg-page hover:text-ink',
  )
}

export function Sidebar({ activeSlug, onNavigate }: SidebarProps) {
  const location = useLocation()
  const [params] = useSearchParams()
  const ageParam = params.get('age') ?? ''
  const activeAge = isAgeFilterId(ageParam) && ageParam !== 'all' ? ageParam : null
  const categoryParam = params.get('category')
  const activeCategory =
    activeSlug ?? (categoryParam && getCatalogTopic(categoryParam) ? categoryParam : undefined)
  const tipsActive = location.pathname === '/parenting-tips' || location.pathname.startsWith('/parenting-tips/')

  const activeGroupId = CATALOG_GROUPS.find((group) =>
    group.children.some((child) => child.id === activeCategory),
  )?.id

  const [openIds, setOpenIds] = useState<string[]>(['age', 'kids'])
  const isOpen = (id: string) =>
    openIds.includes(id) || id === activeGroupId || (id === 'age' && Boolean(activeAge))

  const toggle = (id: string) => {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id],
    )
  }

  return (
    <aside className="flex h-full min-h-0 w-[280px] shrink-0 flex-col border-r border-line bg-white">
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-4" aria-label="카테고리">
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
              className={itemClass(activeAge === item.id)}
            >
              {item.label}
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
                className={itemClass(activeCategory === child.id)}
              >
                {child.label}
              </Link>
            ))}
          </AccordionGroup>
        ))}

        <Link
          to="/parenting-tips"
          onClick={onNavigate}
          className={cn(
            'mt-2 block rounded-xl px-3 py-2 text-sm',
            tipsActive
              ? 'bg-emerald-50 font-bold text-emerald-700'
              : 'font-extrabold text-ink hover:bg-emerald-50',
          )}
        >
          📖 육아·놀이 팁
        </Link>
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
  onToggle,
  children,
}: {
  id: string
  open: boolean
  title: string
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-extrabold text-ink hover:bg-emerald-50"
        aria-expanded={open}
        aria-controls={`sidebar-${id}`}
      >
        {title}
        <ChevronDown size={16} className={cn('shrink-0 text-muted transition', open && 'rotate-180')} />
      </button>
      {open ? (
        <div id={`sidebar-${id}`} className="mb-1 ml-2 space-y-0.5 border-l border-line pl-3">
          {children}
        </div>
      ) : null}
    </div>
  )
}
