import { PrintableCard } from '@/components/PrintableCard'
import type { Printable } from '@/types/printable'

export function RelatedPrintables({
  items,
  topicLabel,
}: {
  items: Printable[]
  topicLabel: string
}) {
  if (!items.length) return null

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-semibold text-ink">{topicLabel}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((printable) => (
          <PrintableCard key={printable.id} printable={printable} variant="catalog" />
        ))}
      </div>
    </section>
  )
}
