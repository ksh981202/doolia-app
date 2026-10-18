import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Trash2 } from 'lucide-react'
import { deleteBundle, getBundles, type AdminBundle } from '@/services/adminBundleService'
import EditBundleModal from '@/components/admin/EditBundleModal'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<AdminBundle[]>([])
  const [editingBundle, setEditingBundle] = useState<AdminBundle | null>(null)

  const loadBundles = async () => {
    const data = await getBundles()
    setBundles(data)
  }

  useEffect(() => {
    void loadBundles()
  }, [])

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    if (!confirm(`「${title}」모음집을 삭제할까요?`)) return
    await deleteBundle(id)
    await loadBundles()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">도안 모음집(번들) 관리</h1>
          <p className="mt-1 text-sm text-muted">30선 테마별 모음집 및 PDF 발행 내역을 관리합니다.</p>
        </div>
        <div>
          <Link
            to="/admin/printables"
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            + 새 모음집 만들기 (도안 선택)
          </Link>
        </div>
      </div>

      {bundles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-ink">발행된 모음집 없음</h3>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            아직 발행된 모음집이 없습니다. 도안 관리에서 30개 도안을 선택해 첫 번째 모음집을 발행해 보세요.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold tracking-wide text-slate-500">
                <tr>
                  <th className="w-16 px-4 py-3 text-center">No.</th>
                  <th className="w-28 px-4 py-3">상태</th>
                  <th className="px-4 py-3">제목</th>
                  <th className="w-32 px-4 py-3">포함 도안 수</th>
                  <th className="w-32 px-4 py-3">등록일</th>
                  <th className="w-24 px-4 py-3 text-right">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bundles.map((bundle, index) => (
                  <tr
                    key={bundle.id}
                    className="cursor-pointer transition hover:bg-slate-50/80"
                    onClick={() => setEditingBundle(bundle)}
                  >
                    <td className="px-4 py-3.5 text-center font-mono text-xs font-medium text-slate-500">
                      {bundles.length - index}
                    </td>
                    <td className="px-4 py-3.5">
                      {bundle.status === 'published' ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                          발행됨
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200/60">
                          초안
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        {bundle.cover_image_url && (
                          <img
                            src={bundle.cover_image_url}
                            alt=""
                            className="h-9 w-9 rounded-lg bg-slate-100 object-cover ring-1 ring-slate-200/50"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{bundle.title_ko}</p>
                          {bundle.title_en && <p className="text-xs text-slate-400">{bundle.title_en}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 font-medium">
                      {bundle.item_slugs?.length ?? 0}개
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-xs text-slate-500">
                      {formatDate(bundle.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, bundle.id, bundle.title_ko)}
                        className="inline-flex h-8 items-center gap-1 rounded-full bg-red-50 px-3 text-[11px] font-extrabold text-red-600 ring-1 ring-red-100 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditBundleModal
        isOpen={Boolean(editingBundle)}
        bundle={editingBundle}
        onClose={() => setEditingBundle(null)}
        onSuccess={loadBundles}
      />
    </div>
  )
}

