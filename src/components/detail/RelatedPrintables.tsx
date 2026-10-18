import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PrintableCard } from '@/components/PrintableCard'
import { pickRelatedPrintables } from '@/shared/utils/relatedPrintables'
import type { Printable } from '@/types/printable'

export function RelatedPrintables({
  current,
  items,
  topicLabel,
  categoryTo,
}: {
  current: Printable
  items: Printable[]
  topicLabel?: string
  categoryLabel?: string
  categoryTo?: string
}) {
  const { t } = useTranslation()
  const related = useMemo(() => pickRelatedPrintables(current, items), [current, items])
  if (!related.length) return null

  return (
    <section className="mt-12 mb-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
          {topicLabel || t('detail.relatedTitle', '🎨 함께 추천하는 도안')}
        </h2>
        {categoryTo ? (
          <Link
            to={categoryTo}
            className="inline-flex shrink-0 items-center gap-0.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>{t('detail.viewMore', '더보기')}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
        {related.map((printable, index) => (
          <PrintableCard key={printable.id} printable={printable} variant="catalog" index={index} />
        ))}
      </div>
    </section>
  )
}
