import { PrintableCard } from '@/components/PrintableCard'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'

export function PrintableGrid() {
  const { data, isLoading, isError } = usePrintablesQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-brand-soft" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="rounded-2xl bg-white p-6 text-center font-semibold text-red-600">
        도안을 불러오지 못했어요. Supabase 환경 변수를 확인해 주세요.
      </p>
    )
  }

  if (!data?.length) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/60">
        아직 이 카테고리의 도안이 없어요.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {data.map((printable) => (
        <PrintableCard key={printable.id} printable={printable} />
      ))}
    </div>
  )
}
