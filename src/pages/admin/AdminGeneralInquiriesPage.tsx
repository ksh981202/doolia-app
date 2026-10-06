import { useEffect, useMemo, useState } from 'react'
import {
  listGeneralInquiries,
  updateGeneralInquiry,
  type GeneralInquiry,
  type InquiryStatus,
  type InquiryType,
} from '@/services/generalInquiryService'

const STATUS_LABEL: Record<InquiryStatus, string> = {
  pending: '대기중',
  processing: '처리중',
  resolved: '처리완료',
}

const TYPE_META: Record<InquiryType, { emoji: string; label: string; className: string }> = {
  suggestion: { emoji: '🎨', label: '도안 제안', className: 'border-emerald-200/60 bg-emerald-50 text-emerald-700' },
  partnership: { emoji: '🤝', label: '제휴 문의', className: 'border-indigo-200/60 bg-indigo-50 text-indigo-700' },
  bug: { emoji: '🛠️', label: '오류 신고', className: 'border-rose-200/60 bg-rose-50 text-rose-700' },
  other: { emoji: '💬', label: '기타 문의', className: 'border-slate-200 bg-slate-50 text-slate-600' },
}

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '대기중' },
  { key: 'processing', label: '처리중' },
  { key: 'resolved', label: '처리완료' },
] as const

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('ko-KR')
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return '처리에 실패했습니다.'
}

export function AdminGeneralInquiriesPage() {
  const [items, setItems] = useState<GeneralInquiry[]>([])
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageOk, setMessageOk] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  const reload = async () => {
    setItems(await listGeneralInquiries())
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

  const patchRow = async (id: string, patch: { status?: InquiryStatus; admin_note?: string }) => {
    setBusyId(id)
    try {
      await updateGeneralInquiry(id, patch)
      setItems((current) =>
        current.map((row) =>
          row.id === id
            ? {
                ...row,
                status: patch.status ?? row.status,
                admin_note: patch.admin_note === undefined ? row.admin_note : patch.admin_note,
              }
            : row,
        ),
      )
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
    await patchRow(id, { admin_note: noteText.trim() })
    setEditingNoteId(null)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">일반 문의 관리</h1>
            {pendingCount > 0 ? (
              <span className="animate-pulse rounded-full bg-rose-100 px-2.5 py-0.5 text-[12px] font-extrabold text-rose-700">
                대기 {pendingCount}건
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] text-slate-500">
            문의하기 페이지에서 접수된 도안 제안, 제휴, 오류 신고를 확인하고 처리 상태를 남깁니다.
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
          {visible.map((inquiry) => {
            const type = TYPE_META[inquiry.type]
            return (
              <div
                key={inquiry.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs transition-all ${
                  inquiry.status === 'pending' ? 'border-amber-200 ring-2 ring-amber-100/50' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="flex shrink-0 items-start gap-4 lg:w-[28%]">
                    <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-2xl shadow-2xs">
                      <span aria-hidden="true">{type.emoji}</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-extrabold ${type.className}`}>
                        {type.label}
                      </span>
                      <h4 className="truncate text-[14.5px] font-bold text-slate-900">{inquiry.name}</h4>
                      <div className="space-y-0.5 pt-0.5 text-[12px] text-slate-500">
                        <p>
                          <a href={`mailto:${inquiry.email}`} className="text-indigo-600 hover:underline">
                            {inquiry.email}
                          </a>
                        </p>
                        <p className="text-[11.5px] text-slate-400">접수일시: {formatDate(inquiry.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2.5 rounded-xl border border-slate-200/60 bg-slate-50/70 p-3.5">
                    <p className="rounded-lg border border-slate-200/80 bg-white p-3 text-[13px] leading-relaxed font-normal whitespace-pre-wrap text-slate-800">
                      {inquiry.content}
                    </p>
                    <div className="pt-1">
                      {editingNoteId === inquiry.id ? (
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
                            disabled={busyId === inquiry.id}
                            onClick={() => void saveNote(inquiry.id)}
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
                            <strong>메모:</strong> {inquiry.admin_note || '등록된 메모가 없습니다.'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(inquiry.id)
                              setNoteText(inquiry.admin_note || '')
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
                      value={inquiry.status}
                      disabled={busyId === inquiry.id}
                      onChange={(event) => void patchRow(inquiry.id, { status: event.target.value as InquiryStatus })}
                      className={`w-full cursor-pointer rounded-xl border px-3 py-1.5 text-[12.5px] font-bold outline-none ${
                        inquiry.status === 'pending'
                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : inquiry.status === 'processing'
                            ? 'border-blue-200 bg-blue-50 text-blue-800'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {(['pending', 'processing', 'resolved'] as const).map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </option>
                      ))}
                    </select>
                    <a
                      href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`[DOOLIA] ${type.label} 답변`)}`}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-bold text-slate-700 shadow-xs hover:bg-slate-50"
                    >
                      ✉️ 메일 답장
                    </a>
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

export default AdminGeneralInquiriesPage
