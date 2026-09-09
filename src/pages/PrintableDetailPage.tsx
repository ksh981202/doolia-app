import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { A4Preview } from '@/components/detail/A4Preview'
import { DetailSkeleton } from '@/components/detail/DetailSkeleton'
import { InfoSection } from '@/components/detail/InfoSection'
import { RelatedPrintables } from '@/components/detail/RelatedPrintables'
import { usePrintableQuery, usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { DEMO_PRINTABLES } from '@/services/printableService'
import { CATALOG_GROUPS, categoryPath, matchesTopicCategory } from '@/shared/config/catalog'
import { detailTitle, megaBundleCopy, relatedSectionTitle } from '@/shared/lib/detailCopy'
import { formatAgeRange } from '@/shared/lib/printableMeta'
import type { Printable } from '@/types/printable'

type Crumb = { label: string; to?: string }
type DetailLocationState = { printable?: Printable }

function catalogTopic(printable: Printable) {
  const byCategory = CATALOG_GROUPS.flatMap((group) => group.children).find(
    (child) => matchesTopicCategory(printable.category, child) || child.id === printable.category,
  )
  if (byCategory) return byCategory
  const hay = [printable.title_ko, printable.title_en, ...printable.tags].join(' ').toLowerCase()
  const match = CATALOG_GROUPS.flatMap((group) => group.children).find(
    (child) => child.query && hay.includes(child.query.toLowerCase()),
  )
  if (match) return match
  return (
    CATALOG_GROUPS.flatMap((group) => group.children).find((child) => child.id === 'coloring-pages') ??
    CATALOG_GROUPS[0].children[0]
  )
}

function matchesKey(item: Printable, key: string | undefined) {
  return Boolean(key) && (item.id === key || item.slug === key)
}

export function PrintableDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const fromState = (location.state as DetailLocationState | null)?.printable
  const seeded = fromState && matchesKey(fromState, id) ? fromState : undefined
  const { data, isPending, isFetched } = usePrintableQuery(id)
  const catalog = usePrintablesQuery()
  const demo = DEMO_PRINTABLES.find((item) => matchesKey(item, id))
  const printable = data ?? seeded ?? demo

  const related = useMemo(() => {
    if (!printable) return []
    const pool = catalog.data ?? DEMO_PRINTABLES
    const others = pool.filter((item) => item.id !== printable.id)
    const ageKey = formatAgeRange([printable.age_group, printable.age_group_en, ...printable.tags].join(' '))
    const score = (item: Printable) => {
      const sameCategory = item.category === printable.category ? 2 : 0
      const itemAge = formatAgeRange([item.age_group, item.age_group_en, ...item.tags].join(' '))
      const sameAge = ageKey && itemAge === ageKey ? 1 : 0
      return sameCategory + sameAge
    }
    return [...others].sort((a, b) => score(b) - score(a) || b.downloads - a.downloads).slice(0, 4)
  }, [catalog.data, printable])

  if (!printable) {
    if (isPending || !isFetched) return <DetailSkeleton />
    return (
      <div className="py-16 text-center text-muted">
        도안을 찾을 수 없어요.
      </div>
    )
  }

  const title = detailTitle(printable)
  const topic = catalogTopic(printable)
  const mega = megaBundleCopy(printable)

  const crumbs: Crumb[] = [
    { label: '홈', to: '/' },
    { label: topic.label, to: categoryPath(topic.id) },
    { label: title },
  ]

  return (
    <div className="bg-page">
      <main className="py-6 sm:py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500" aria-label="경로">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="inline-flex min-w-0 items-center gap-2">
              {index > 0 ? <ChevronRight size={14} className="shrink-0 text-slate-400" /> : null}
              {crumb.to ? (
                <Link to={crumb.to} className="shrink-0 hover:text-emerald-600">
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate font-bold text-slate-800">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <A4Preview printable={{ ...printable, title }} />
          </div>
          <div className="lg:col-span-5">
            <InfoSection printable={{ ...printable, title }} />
          </div>
        </div>

        <RelatedPrintables
          items={related}
          topicLabel={relatedSectionTitle(printable)}
          categoryLabel={topic.label}
          categoryTo={categoryPath(topic.id)}
        />

        <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">MEGA 패키지</p>
            <h2 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">{mega.title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {mega.price} · {mega.description}
            </p>
          </div>
          <Link
            to="/premium"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800"
          >
            패키지 한 번에 받기
          </Link>
        </section>
      </main>
    </div>
  )
}

export default PrintableDetailPage
