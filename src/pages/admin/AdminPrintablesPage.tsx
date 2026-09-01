import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deletePrintable,
  listAdminPrintables,
  setPrintablePublished,
  type AdminPrintable,
} from '@/services/adminPrintableService'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return '삭제에 실패했습니다. (권한/RLS를 확인하세요)'
}

export function AdminPrintablesPage() {
  const [items, setItems] = useState<AdminPrintable[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [messageOk, setMessageOk] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)

  const reload = () =>
    listAdminPrintables().then((next) => {
      setItems(next)
      setSelected((current) => new Set([...current].filter((id) => next.some((item) => item.id === id))))
    })

  useEffect(() => {
    void reload()
  }, [])

  const allIds = useMemo(() => items.map((item) => item.id), [items])
  const selectedCount = selected.size
  const allSelected = items.length > 0 && selectedCount === items.length

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allIds))
  }

  const toggleOne = (id: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const removeFromList = (ids: string[]) => {
    const drop = new Set(ids)
    setItems((current) => current.filter((item) => !drop.has(item.id)))
    setSelected((current) => new Set([...current].filter((id) => !drop.has(id))))
  }

  const onDelete = async (item: AdminPrintable) => {
    if (!confirm(`「${item.title_ko || item.slug}」도안을 삭제할까요?`)) return
    setBusyId(item.id)
    try {
      await deletePrintable(item.id)
      removeFromList([item.id])
      setMessageOk(true)
      setMessage('도안을 삭제했습니다.')
    } catch (error) {
      setMessageOk(false)
      setMessage(errorMessage(error))
    } finally {
      setBusyId('')
    }
  }

  const onBulkDelete = async () => {
    const ids = [...selected]
    if (!ids.length) return
    if (!confirm(`선택한 ${ids.length}개 도안을 삭제할까요?`)) return
    setBulkBusy(true)
    const failed: string[] = []
    const removed: string[] = []
    for (const id of ids) {
      try {
        await deletePrintable(id)
        removed.push(id)
      } catch {
        failed.push(id)
      }
    }
    if (removed.length) removeFromList(removed)
    if (failed.length) {
      setMessageOk(false)
      setMessage(`${removed.length}건 삭제, ${failed.length}건 실패. 권한/RLS를 확인하세요.`)
    } else {
      setMessageOk(true)
      setMessage(`선택한 ${removed.length}개 도안을 삭제했습니다.`)
    }
    setBulkBusy(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">도안 관리</h1>
        <p className="mt-1 text-sm text-muted">등록은 TSV 대량 업로드로 진행합니다. 목록에서 노출 상태와 삭제를 관리하세요.</p>
      </div>

      <Link
        to="/admin/printables/upload"
        className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-emerald-600">TSV + IMAGE PIPELINE</p>
          <h2 className="mt-1 text-lg font-extrabold text-ink">대량 자동 업로드 바로가기</h2>
          <p className="mt-1 text-sm text-muted">메타데이터 TSV와 이미지를 드롭하면 파일명으로 짝을 맞춰 R2·DB에 등록합니다.</p>
        </div>
        <span className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white">
          대량 업로드 열기
        </span>
      </Link>

      {message ? (
        <p className={`rounded-xl px-3 py-2 text-sm font-bold ${messageOk ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
          {message}
        </p>
      ) : null}

      {selectedCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm font-bold text-red-800">선택한 {selectedCount}개 도안</p>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => void onBulkDelete()}
            className="inline-flex h-10 items-center rounded-full bg-red-600 px-4 text-xs font-extrabold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {bulkBusy ? '삭제 중…' : `선택한 ${selectedCount}개 도안 일괄 삭제`}
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold tracking-wide text-slate-500">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={!items.length}
                    aria-label="전체 선택"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                </th>
                <th className="px-3 py-3 font-semibold">썸네일</th>
                <th className="px-3 py-3 font-semibold">파일명</th>
                <th className="px-3 py-3 font-semibold">썸네일 제목</th>
                <th className="px-3 py-3 font-semibold">등록일</th>
                <th className="px-3 py-3 font-semibold">상태</th>
                <th className="px-3 py-3 text-right font-semibold">작업</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm font-medium text-slate-400">
                    등록된 도안이 없습니다. 대량 업로드에서 TSV와 이미지를 올려 주세요.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleOne(item.id)}
                        aria-label={`${item.slug || item.title_ko} 선택`}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <img
                        src={item.image_color_url || item.image_bw_url}
                        alt=""
                        className="h-12 w-12 rounded-xl bg-slate-100 object-cover ring-1 ring-slate-100"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-mono text-[13px] font-bold tracking-tight text-slate-900">{item.slug || '-'}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{item.title_ko || '-'}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{item.title_en || ''}</p>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">{formatDate(item.created_at)}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          void setPrintablePublished(item.id, !item.published).then(() =>
                            setItems((current) =>
                              current.map((row) =>
                                row.id === item.id ? { ...row, published: !item.published } : row,
                              ),
                            ),
                          )
                        }
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          item.published ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.published ? '정상 노출' : '숨김'}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => void onDelete(item)}
                        className="inline-flex h-8 items-center rounded-full bg-red-50 px-3 text-[11px] font-extrabold text-red-600 ring-1 ring-red-100 hover:bg-red-600 hover:text-white disabled:opacity-50"
                      >
                        {busyId === item.id ? '삭제 중' : '삭제'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminPrintablesPage
