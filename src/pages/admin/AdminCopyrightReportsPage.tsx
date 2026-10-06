import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_PENDING_COUNTS_KEY, ADMIN_REPORTS_COUNT_KEY, notifyAdminPendingChanged } from '@/admin/pendingEvents'
import { listAdminPrintables, setPrintablePublished, type AdminPrintable } from '@/services/adminPrintableService'
import {
  listCopyrightReports,
  updateCopyrightReport,
  type CopyrightReport,
  type ReportStatus,
} from '@/services/copyrightReportService'
import { printablePath } from '@/shared/config/catalog'
import { getDisplayImageUrl } from '@/shared/utils/printableAssets'

const STATUS_LABEL: Record<ReportStatus, string> = {
  pending: '대기중',
  reviewed: '검토중',
  resolved: '처리완료',
}

const TYPE_LABEL: Record<CopyrightReport['report_type'], string> = {
  copyright: '저작권 침해 요청',
  modification: '도안 수정 제안',
  other: '기타 문의',
}

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '대기중' },
  { key: 'reviewed', label: '검토중' },
  { key: 'resolved', label: '처리완료' },
] as const

type PrintableMeta = {
  id: string
  imageUrl: string
  published: boolean
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('ko-KR')
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return '처리에 실패했습니다.'
}

function printableThumb(item: AdminPrintable) {
  return item.image_bw_url || item.line_art_url || item.image_color_url || item.color_image_url || ''
}

function buildPrintableMeta(printables: AdminPrintable[]) {
  const byId = new Map(printables.map((item) => [item.id, item]))
  const bySlug = new Map(printables.map((item) => [item.slug, item]))

  return (report: CopyrightReport): PrintableMeta | null => {
    const found =
      (report.printable_id ? byId.get(report.printable_id) : undefined) ||
      (report.printable_slug ? bySlug.get(report.printable_slug) : undefined) ||
      (report.printable_slug ? bySlug.get(report.printable_slug.replace(/_[bc]$/i, '')) : undefined)
    if (!found) return null
    return {
      id: found.id,
      imageUrl: printableThumb(found),
      published: found.published !== false,
    }
  }
}

function pendingReportsAfter(items: CopyrightReport[], id: string, status?: ReportStatus) {
  return items.filter((row) => (row.id === id ? (status ?? row.status) : row.status) === 'pending').length
}

export function AdminCopyrightReportsPage() {
  const queryClient = useQueryClient()
  const [items, setItems] = useState<CopyrightReport[]>([])
  const [printables, setPrintables] = useState<AdminPrintable[]>([])
  const [filter, setFilter] = useState<'all' | ReportStatus>('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageOk, setMessageOk] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  const resolveMeta = useMemo(() => buildPrintableMeta(printables), [printables])

  const reload = async () => {
    const [rows, catalog] = await Promise.all([listCopyrightReports(), listAdminPrintables()])
    setItems(rows)
    setPrintables(catalog)
  }

  useEffect(() => {
    setLoading(true)
    void reload()
      .catch((error) => {
        setMessageOk(false)
        setMessage(errorMessage(error))
      })
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.status === filter)),
    [filter, items],
  )
  const pendingCount = items.filter((item) => item.status === 'pending').length

  const syncPendingBadges = (reports: number) => {
    queryClient.setQueryData(ADMIN_REPORTS_COUNT_KEY, reports)
    queryClient.setQueryData(ADMIN_PENDING_COUNTS_KEY, (current: { reports: number; inquiries: number } | undefined) => ({
      reports,
      inquiries: current?.inquiries ?? 0,
    }))
    notifyAdminPendingChanged({ reports })
    void queryClient.invalidateQueries({ queryKey: ADMIN_REPORTS_COUNT_KEY })
    void queryClient.invalidateQueries({ queryKey: ADMIN_PENDING_COUNTS_KEY })
  }

  const patchRow = async (id: string, patch: { status?: ReportStatus; admin_notes?: string | null }) => {
    setBusyId(id)
    try {
      await updateCopyrightReport(id, patch)
      setItems((current) =>
        current.map((row) =>
          row.id === id
            ? {
                ...row,
                status: patch.status ?? row.status,
                admin_notes: patch.admin_notes === undefined ? row.admin_notes : patch.admin_notes,
              }
            : row,
        ),
      )
      if (patch.status) syncPendingBadges(pendingReportsAfter(items, id, patch.status))
      setMessageOk(true)
      setMessage('반영했습니다.')
    } catch (error) {
      setMessageOk(false)
      setMessage(errorMessage(error))
    } finally {
      setBusyId('')
    }
  }

  const saveNote = async (id: string) => {
    const next = noteText.trim()
    await patchRow(id, { admin_notes: next || null })
    setEditingNoteId(null)
  }

  const togglePublish = async (item: CopyrightReport) => {
    const meta = resolveMeta(item)
    if (!meta) return
    const nextPublished = !meta.published
    const actionName = meta.published ? '비공개(숨김)' : '공개'
    if (!confirm(`해당 도안(${item.printable_slug || item.printable_title})을 즉시 ${actionName} 처리하시겠습니까?`)) return
    setBusyId(item.id)
    try {
      await setPrintablePublished(meta.id, nextPublished)
      setPrintables((current) =>
        current.map((row) => (row.id === meta.id ? { ...row, published: nextPublished } : row)),
      )
      if (!nextPublished && item.status === 'pending') {
        await updateCopyrightReport(item.id, { status: 'reviewed' })
        setItems((current) => current.map((row) => (row.id === item.id ? { ...row, status: 'reviewed' } : row)))
        syncPendingBadges(pendingReportsAfter(items, item.id, 'reviewed'))
      }
      void queryClient.invalidateQueries({ queryKey: ['printables'] })
      setMessageOk(true)
      setMessage(`도안이 성공적으로 ${actionName} 처리되었습니다.`)
    } catch (error) {
      setMessageOk(false)
      setMessage(errorMessage(error))
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">저작권 · 권리침해 신고 관리</h1>
            {pendingCount > 0 ? (
              <span className="animate-pulse rounded-full bg-rose-100 px-2.5 py-0.5 text-[12px] font-extrabold text-rose-700">
                대기 {pendingCount}건
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] text-slate-500">
            접수된 저작권 문의 및 도안 수정 요청을 검토하고, 문제 발생 시 즉시 비공개 조치할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1">
          {FILTERS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-lg px-3.5 py-1.5 text-[13px] font-bold transition-all ${
                filter === tab.key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message ? (
        <p className={`text-sm font-bold ${messageOk ? 'text-emerald-700' : 'text-rose-600'}`}>{message}</p>
      ) : null}

      {loading ? (
        <div className="py-16 text-center font-medium text-slate-400">데이터를 불러오는 중입니다...</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center text-slate-400">
          <p className="text-[15px] font-bold">접수된 문의 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((report) => {
            const meta = resolveMeta(report)
            const href =
              report.printable_slug || report.printable_id
                ? printablePath(report.printable_slug || report.printable_id)
                : report.page_url || ''
            const published = meta?.published ?? true
            const imageUrl = meta?.imageUrl ? getDisplayImageUrl(meta.imageUrl, 240) : ''

            return (
              <div
                key={report.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs transition-all ${
                  report.status === 'pending' ? 'border-amber-200 ring-2 ring-amber-100/50' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="flex shrink-0 items-start gap-4 lg:w-[32%]">
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No Image</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {report.printable_slug ? (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-700">
                            {report.printable_slug}
                          </span>
                        ) : (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-500">
                            사이트 일반
                          </span>
                        )}
                        {meta ? (
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold ${
                              published ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {published ? '공개중' : '비공개'}
                          </span>
                        ) : null}
                        {report.good_faith_agreed ? (
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            권리 확인
                          </span>
                        ) : (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            미동의
                          </span>
                        )}
                      </div>

                      <h4 className="truncate text-[14.5px] font-bold text-slate-900">
                        {report.printable_title || '도안 미지정 문의'}
                      </h4>

                      <div className="space-y-0.5 pt-0.5 text-[12px] text-slate-500">
                        <p>
                          <strong className="font-semibold text-slate-700">{report.reporter_name || '-'}</strong>
                          {' · '}
                          <a href={`mailto:${report.reporter_email}`} className="text-indigo-600 hover:underline">
                            {report.reporter_email}
                          </a>
                        </p>
                        <p className="text-[11.5px] text-slate-400">접수일시: {formatDate(report.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2.5 rounded-xl border border-slate-200/60 bg-slate-50/70 p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md border border-rose-200/60 bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                        {TYPE_LABEL[report.report_type]}
                      </span>
                      {href ? (
                        <Link
                          to={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11.5px] font-semibold text-slate-500 underline hover:text-slate-800"
                        >
                          도안 페이지 확인 ↗
                        </Link>
                      ) : null}
                    </div>

                    <p className="rounded-lg border border-slate-200/80 bg-white p-3 text-[13px] leading-relaxed font-normal whitespace-pre-wrap text-slate-800">
                      {report.content}
                    </p>

                    <div className="pt-1">
                      {editingNoteId === report.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(event) => setNoteText(event.target.value)}
                            placeholder="처리 결과 및 내부 메모를 입력하세요"
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            disabled={busyId === report.id}
                            onClick={() => void saveNote(report.id)}
                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-slate-900 disabled:opacity-50"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNoteId(null)}
                            className="px-2 py-1.5 text-[12px] text-slate-400 hover:text-slate-600"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[12px] text-slate-500">
                          <span className="truncate">
                            <strong>메모:</strong> {report.admin_notes || '등록된 메모가 없습니다.'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(report.id)
                              setNoteText(report.admin_notes || '')
                            }}
                            className="ml-2 shrink-0 text-[11.5px] font-bold text-slate-500 underline hover:text-slate-800"
                          >
                            메모 작성/수정
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 lg:w-[15%] lg:flex-col lg:items-end">
                    <select
                      value={report.status}
                      disabled={busyId === report.id}
                      onChange={(event) => void patchRow(report.id, { status: event.target.value as ReportStatus })}
                      className={`w-full cursor-pointer rounded-xl border px-3 py-1.5 text-[12.5px] font-bold outline-none ${
                        report.status === 'pending'
                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : report.status === 'reviewed'
                            ? 'border-blue-200 bg-blue-50 text-blue-800'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {(['pending', 'reviewed', 'resolved'] as const).map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </option>
                      ))}
                    </select>

                    {meta ? (
                      <button
                        type="button"
                        disabled={busyId === report.id}
                        onClick={() => void togglePublish(report)}
                        className={`w-full rounded-xl px-3 py-2 text-[12.5px] font-bold shadow-xs transition-all disabled:opacity-50 ${
                          published
                            ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {published ? '🔴 도안 즉시 비공개' : '🟢 도안 다시 공개하기'}
                      </button>
                    ) : (
                      <p
                        className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-center text-[12px] font-bold text-slate-400"
                        title="연결된 도안이 없어 공개 상태를 변경할 수 없습니다."
                      >
                        대상 도안 없음
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminCopyrightReportsPage
