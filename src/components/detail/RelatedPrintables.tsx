import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PrintableCard } from '@/components/PrintableCard'
import type { Printable } from '@/types/printable'

export function RelatedPrintables({
  items,
  topicLabel,
  categoryLabel,
  categoryTo,
}: {
  items: Printable[]
  topicLabel: string
  categoryLabel?: string
  categoryTo?: string
}) {
  if (!items.length) return null

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">{topicLabel}</h2>
        {categoryTo && categoryLabel ? (
          <Link
            to={categoryTo}
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            {categoryLabel} 더보기
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
        {items.map((printable) => (
          <PrintableCard key={printable.id} printable={printable} variant="catalog" />
        ))}
      </div>
    </section>
  )
}
