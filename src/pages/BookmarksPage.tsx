import { Link } from 'react-router-dom'
import { PrintableCard } from '@/components/PrintableCard'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { useBookmarkStore } from '@/shared/store/useBookmarkStore'

export function BookmarksPage() {
  const ids = useBookmarkStore((state) => state.ids)
  const { data, isLoading } = usePrintablesQuery()
  const items = (data ?? []).filter((item) => ids.includes(item.id))

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">북마크</h1>
      <p className="mt-2 text-sm text-muted">저장한 도안을 한곳에서 다시 볼 수 있어요.</p>
      {isLoading ? (
        <p className="mt-8 text-muted">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-muted">
          아직 북마크한 도안이 없어요. 카드의 북마크 아이콘을 눌러 저장해 보세요.
          <Link to="/category/coloring-pages" className="mt-3 block font-bold text-brand">
            자동차 & 탈것 보러 가기
          </Link>
        </p>
      ) : (
        <div id="category-grid" className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((printable) => (
            <PrintableCard key={printable.id} printable={printable} variant="catalog" />
          ))}
        </div>
      )}
    </div>
  )
}
