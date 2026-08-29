import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { A4Preview } from '@/components/detail/A4Preview'
import { DetailSkeleton } from '@/components/detail/DetailSkeleton'
import { InfoSection } from '@/components/detail/InfoSection'
import { RelatedPrintables } from '@/components/detail/RelatedPrintables'
import { usePrintableQuery, usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { DEMO_PRINTABLES } from '@/services/printableService'
import { CATEGORY_LABEL } from '@/shared/config/categories'
import { CATALOG_GROUPS, categoryPath } from '@/shared/config/catalog'
import { detailTitle, megaBundleCopy, relatedSectionTitle } from '@/shared/lib/detailCopy'
import type { Printable } from '@/types/printable'

type Crumb = { label: string; to?: string }
type DetailLocationState = { printable?: Printable }

function catalogTopic(printable: Printable) {
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
    const topicForRelated = catalogTopic(printable)
    const pool = catalog.data ?? DEMO_PRINTABLES
    const others = pool.filter((item) => item.id !== printable.id)
    const sameTopic = others.filter((item) =>
      [item.title_ko, ...item.tags].join(' ').includes(topicForRelated.query || item.category),
    )
    const seen = new Set<string>()
    const unique: Printable[] = []
    for (const item of [...sameTopic, ...others]) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      unique.push(item)
      if (unique.length >= 4) break
    }
    return unique
  }, [catalog.data, printable])

  if (!printable) {
    if (isPending || !isFetched) return <DetailSkeleton />
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted">
        도안을 찾을 수 없어요.
      </div>
    )
  }

  const title = detailTitle(printable)
  const topic = catalogTopic(printable)
  const mega = megaBundleCopy(printable)

  const crumbs: Crumb[] = [
    { label: '홈', to: '/' },
    { label: CATEGORY_LABEL[printable.category], to: categoryPath(topic.id) },
    { label: topic.label, to: categoryPath(topic.id) },
    { label: title },
  ]

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-1 text-sm font-bold text-muted" aria-label="경로">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
              {index > 0 ? <ChevronRight size={14} /> : null}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-emerald-600">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ink">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_360px]">
          <A4Preview printable={{ ...printable, title }} />
          <InfoSection printable={{ ...printable, title }} />
        </div>

        <section className="mt-10 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-extrabold tracking-wide text-emerald-600">MEGA 패키지</p>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900">{mega.title}</h2>
            <p className="mt-2 text-sm text-gray-500">
              {mega.price} · {mega.description}
            </p>
          </div>
          <Link
            to="/premium"
            className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 sm:mt-0"
          >
            패키지 한 번에 받기
          </Link>
        </section>

        <RelatedPrintables items={related} topicLabel={relatedSectionTitle(printable)} />
      </div>
    </div>
  )
}

export default PrintableDetailPage
