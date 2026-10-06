import { ChevronRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useParams } from 'react-router-dom'
import { A4Preview } from '@/components/detail/A4Preview'
import { DetailSkeleton } from '@/components/detail/DetailSkeleton'
import { InfoSection } from '@/components/detail/InfoSection'
import { RelatedPrintables } from '@/components/detail/RelatedPrintables'
import { usePrintableQuery, usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { DEMO_PRINTABLES } from '@/services/printableService'
import { categoryPath, getAllCatalogTopics, matchesTopicCategory } from '@/shared/config/catalog'
import { seoPrintableAlt, seoPrintablePath, seoPrintableTitle } from '@/shared/config/seo'
import { detailTitle } from '@/shared/lib/detailCopy'
import { applyPageMeta } from '@/shared/lib/pageMeta'
import { usePrintableEngagement } from '@/shared/store/usePrintableEngagement'
import type { Printable } from '@/types/printable'

type Crumb = { label: string; to?: string }
type DetailLocationState = { printable?: Printable }

function catalogTopic(printable: Printable) {
  const topics = getAllCatalogTopics()
  const byCategory = topics.find(
    (child) => matchesTopicCategory(printable.category, child) || child.id === printable.category,
  )
  if (byCategory) return byCategory
  const hay = [printable.title_ko, printable.title_en, ...printable.tags].join(' ').toLowerCase()
  const match = topics.find((child) => child.query && hay.includes(child.query.toLowerCase()))
  if (match) return match
  return topics.find((child) => child.id === 'coloring-pages') ?? topics[0]
}

function matchesKey(item: Printable, key: string | undefined) {
  return Boolean(key) && (item.id === key || item.slug === key)
}

export function PrintableDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const fromState = (location.state as DetailLocationState | null)?.printable
  const seeded = fromState && matchesKey(fromState, id) ? fromState : undefined
  const { data, isPending, isFetched } = usePrintableQuery(id)
  const catalog = usePrintablesQuery()
  const demo = DEMO_PRINTABLES.find((item) => matchesKey(item, id))
  const printable = data ?? seeded ?? demo

  const relatedPool = useMemo(() => catalog.data ?? DEMO_PRINTABLES, [catalog.data])
  const recordView = usePrintableEngagement((state) => state.recordView)

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id])

  useEffect(() => {
    if (!printable) return
    recordView(printable)
  }, [printable, recordView])

  useEffect(() => {
    if (!printable) return
    const name = printable.title_ko || printable.title
    const url = seoPrintablePath(printable.slug || printable.id)
    const description = printable.description_ko || `${name} 무료 색칠도안을 A4 PDF로 프린트하세요.`
    applyPageMeta({
      title: seoPrintableTitle(name),
      description,
      image: printable.image_color_url,
      url,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CreativeWork',
            name: seoPrintableTitle(name),
            description,
            url,
            inLanguage: 'ko',
            image: {
              '@type': 'ImageObject',
              url: printable.image_color_url,
              contentUrl: printable.image_color_url,
            },
          },
          {
            '@type': 'ImageObject',
            name: seoPrintableAlt(name),
            url: printable.image_color_url,
            contentUrl: printable.image_color_url,
          },
        ],
      },
    })
  }, [printable])

  if (!printable) {
    if (isPending || !isFetched) return <DetailSkeleton />
    return (
      <div className="py-16 text-center text-muted">
        {t('detail.notFound', '도안을 찾을 수 없어요.')}
      </div>
    )
  }

  const title = detailTitle(printable, i18n.language || i18n.resolvedLanguage)
  const topic = catalogTopic(printable)
  const topicLabel = t(`categories.${topic.id}`, topic.label)

  const crumbs: Crumb[] = [
    { label: t('nav.home'), to: '/' },
    { label: topicLabel, to: categoryPath(topic.id) },
    { label: title },
  ]

  return (
    <div className="bg-page">
      <main className="py-6 sm:py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500" aria-label="Breadcrumb">
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
          <div className="min-w-0 w-full lg:col-span-7">
            <A4Preview key={printable.id || printable.slug} printable={{ ...printable, title }} />
          </div>
          <div className="flex min-w-0 w-full flex-col gap-6 lg:col-span-5">
            <InfoSection printable={{ ...printable, title }} />
          </div>
        </div>

        <RelatedPrintables
          current={printable}
          items={relatedPool}
          topicLabel={t('detail.relatedTitle', '🎨 함께 추천하는 도안')}
          categoryLabel={topicLabel}
          categoryTo={categoryPath(topic.id)}
        />
      </main>
    </div>
  )
}

export default PrintableDetailPage
