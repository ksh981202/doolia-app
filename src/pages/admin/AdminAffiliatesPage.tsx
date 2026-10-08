import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  affiliateCtr,
  deleteAdminAffiliate,
  emptyAffiliateDraft,
  listAdminAffiliates,
  saveAdminAffiliate,
  updateAdminAffiliate,
  type AffiliateRecord,
} from '@/services/affiliateService'
import { cn } from '@/shared/lib/cn'

const KPI_CARD =
  'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300'
const KPI_LABEL = 'text-[11.5px] font-semibold tracking-wide text-slate-400 uppercase'
const KPI_VALUE = 'mt-2 text-[26px] font-bold tracking-tight text-slate-800'
const INPUT =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-800 outline-none focus:border-emerald-400'
const LABEL = 'mb-1 block text-[12px] font-semibold text-slate-500'

function parseThemes(value: string) {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return items.length ? items : ['all']
}

function AffiliateThumb({ item }: { item: AffiliateRecord }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      className="relative h-14 w-20 overflow-hidden rounded-lg border border-slate-100 bg-slate-50"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && item.video_url ? (
        <video src={item.video_url} poster={item.image_url} muted playsInline autoPlay loop className="h-full w-full object-cover" />
      ) : item.image_url ? (
        <img src={item.image_url} alt={item.title_ko || item.title_en} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-[11px] font-medium text-slate-400">미리보기</div>
      )}
    </div>
  )
}

function AffiliateFormModal({
  draft,
  onClose,
  onSaved,
}: {
  draft: AffiliateRecord
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState(draft)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isEdit = Boolean(draft.id)

  const set = (patch: Partial<AffiliateRecord>) => setForm((current) => ({ ...current, ...patch }))

  const save = async () => {
    if (!form.title_ko.trim() && !form.title_en.trim()) {
      setError('상품명을 입력하세요.')
      return
    }
    if (!form.affiliate_url.trim()) {
      setError('제휴 링크를 입력하세요.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await saveAdminAffiliate({
        ...form,
        id: form.id.trim() || form.title_en.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40),
      })
      onSaved()
      onClose()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '저장에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-[16px] font-bold tracking-tight text-slate-800">
          {isEdit ? '제휴 광고 수정' : '새 제휴 광고 등록'}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={LABEL}>ID (영문 슬러그)</span>
            <input className={INPUT} value={form.id} disabled={isEdit} onChange={(e) => set({ id: e.target.value })} />
          </label>
          <label>
            <span className={LABEL}>상품명 (KO)</span>
            <input className={INPUT} value={form.title_ko} onChange={(e) => set({ title_ko: e.target.value })} />
          </label>
          <label>
            <span className={LABEL}>상품명 (EN)</span>
            <input className={INPUT} value={form.title_en} onChange={(e) => set({ title_en: e.target.value })} />
          </label>
          <label className="sm:col-span-2">
            <span className={LABEL}>설명 / 페인포인트 (KO)</span>
            <textarea
              className={`${INPUT} h-20 py-2`}
              value={form.description_ko}
              onChange={(e) => set({ description_ko: e.target.value })}
            />
          </label>
          <label className="sm:col-span-2">
            <span className={LABEL}>설명 / 페인포인트 (EN)</span>
            <textarea
              className={`${INPUT} h-20 py-2`}
              value={form.description_en}
              onChange={(e) => set({ description_en: e.target.value })}
            />
          </label>
          <label>
            <span className={LABEL}>배지 (KO)</span>
            <input className={INPUT} value={form.badge_ko} onChange={(e) => set({ badge_ko: e.target.value })} />
          </label>
          <label>
            <span className={LABEL}>배지 (EN)</span>
            <input className={INPUT} value={form.badge_en} onChange={(e) => set({ badge_en: e.target.value })} />
          </label>
          <label className="sm:col-span-2">
            <span className={LABEL}>국내 제휴 링크 (쿠팡)</span>
            <input className={INPUT} value={form.affiliate_url} onChange={(e) => set({ affiliate_url: e.target.value })} />
          </label>
          <label className="sm:col-span-2">
            <span className={LABEL}>글로벌 제휴 링크 (아마존)</span>
            <input
              className={INPUT}
              value={form.affiliate_url_en}
              onChange={(e) => set({ affiliate_url_en: e.target.value })}
            />
          </label>
          <label>
            <span className={LABEL}>이미지 경로</span>
            <input className={INPUT} value={form.image_url} onChange={(e) => set({ image_url: e.target.value })} />
          </label>
          <label>
            <span className={LABEL}>비디오 경로</span>
            <input className={INPUT} value={form.video_url} onChange={(e) => set({ video_url: e.target.value })} />
          </label>
          <label>
            <span className={LABEL}>노출 테마 (쉼표 구분)</span>
            <input
              className={INPUT}
              value={form.theme_ids.join(', ')}
              onChange={(e) => set({ theme_ids: parseThemes(e.target.value) })}
            />
          </label>
          <label>
            <span className={LABEL}>노출 순서</span>
            <input
              type="number"
              className={INPUT}
              value={form.sort_order}
              onChange={(e) => set({ sort_order: Number(e.target.value) || 0 })}
            />
          </label>
          <label>
            <span className={LABEL}>CTA (KO)</span>
            <input className={INPUT} value={form.cta_ko} onChange={(e) => set({ cta_ko: e.target.value })} />
          </label>
          <label>
            <span className={LABEL}>CTA (EN)</span>
            <input className={INPUT} value={form.cta_en} onChange={(e) => set({ cta_en: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set({ is_active: e.target.checked })}
            />
            <span className="text-[13px] font-semibold text-slate-700">활성화</span>
          </label>
        </div>
        {error ? <p className="mt-3 text-[13px] font-medium text-rose-600">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-xl px-4 text-[13px] font-semibold text-slate-500">
            취소
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="h-10 rounded-xl bg-emerald-600 px-4 text-[13px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminAffiliatesPage() {
  const [items, setItems] = useState<AffiliateRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [draft, setDraft] = useState<AffiliateRecord | null>(null)

  const reload = async () => {
    const rows = await listAdminAffiliates()
    setItems(rows)
    setLoading(false)
  }

  useEffect(() => {
    void reload().catch((err) => {
      setLoading(false)
      setMessage(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.')
    })
  }, [])

  const stats = useMemo(() => {
    const impressions = items.reduce((sum, item) => sum + (item.impression_count || 0), 0)
    const clicks = items.reduce((sum, item) => sum + (item.click_count || 0), 0)
    return {
      impressions,
      clicks,
      ctr: affiliateCtr(impressions, clicks),
      active: items.filter((item) => item.is_active).length,
    }
  }, [items])

  const toggleActive = async (item: AffiliateRecord) => {
    const next = !item.is_active
    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, is_active: next } : row)))
    try {
      await updateAdminAffiliate(item.id, { is_active: next })
    } catch (err) {
      setItems((current) => current.map((row) => (row.id === item.id ? { ...row, is_active: item.is_active } : row)))
      setMessage(err instanceof Error ? err.message : '활성 상태 변경에 실패했습니다.')
    }
  }

  const remove = async (item: AffiliateRecord) => {
    if (!confirm(`「${item.title_ko || item.id}」제휴 광고를 삭제할까요?`)) return
    try {
      await deleteAdminAffiliate(item.id)
      setItems((current) => current.filter((row) => row.id !== item.id))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-800">제휴마케팅 관리</h1>
          <p className="mt-1.5 text-[13.5px] font-medium text-slate-500">
            다운로드 모달 배너의 노출·클릭을 추적하고 광고를 켜고 끌 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDraft(emptyAffiliateDraft())}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-[13px] font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={16} /> 새 제휴 광고 등록
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={KPI_CARD}>
          <p className={KPI_LABEL}>총 노출수</p>
          <p className={KPI_VALUE}>{loading ? '—' : stats.impressions.toLocaleString()}</p>
        </div>
        <div className={KPI_CARD}>
          <p className={KPI_LABEL}>총 클릭수</p>
          <p className={cn(KPI_VALUE, 'text-emerald-600')}>{loading ? '—' : stats.clicks.toLocaleString()}</p>
        </div>
        <div className={KPI_CARD}>
          <p className={KPI_LABEL}>평균 CTR</p>
          <p className={KPI_VALUE}>{loading ? '—' : `${stats.ctr}%`}</p>
        </div>
        <div className={KPI_CARD}>
          <p className={KPI_LABEL}>활성 광고</p>
          <p className={KPI_VALUE}>{loading ? '—' : `${stats.active} / ${items.length}`}</p>
        </div>
      </div>

      {message ? <p className="text-[13px] font-medium text-rose-600">{message}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[11.5px] font-semibold tracking-wide text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-3">미리보기</th>
                <th className="px-4 py-3">상품</th>
                <th className="px-4 py-3">링크</th>
                <th className="px-4 py-3">성과</th>
                <th className="px-4 py-3">활성</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const ctr = affiliateCtr(item.impression_count, item.click_count)
                return (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-3">
                      <AffiliateThumb item={item} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13.5px] font-semibold text-slate-800">{item.title_ko || item.title_en}</p>
                      <p className="mt-0.5 text-[12px] font-medium text-slate-500">{item.title_en}</p>
                      <p className="mt-1 line-clamp-2 text-[12px] text-slate-400">{item.description_ko}</p>
                    </td>
                    <td className="px-4 py-3">
                      {item.affiliate_url ? (
                        <a
                          href={item.affiliate_url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          링크 열기 <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-[12px] text-slate-400">없음</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-slate-700">
                      {item.impression_count}회 / {item.click_count}회
                      <span className="mt-0.5 block text-[12px] font-medium text-slate-400">CTR {ctr}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.is_active}
                        onClick={() => void toggleActive(item)}
                        className={cn(
                          'relative h-6 w-11 rounded-full transition-colors',
                          item.is_active ? 'bg-emerald-500' : 'bg-slate-300',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                            item.is_active ? 'left-5' : 'left-0.5',
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDraft(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                          aria-label="수정"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50"
                          aria-label="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!loading && items.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] font-medium text-slate-400">등록된 제휴 광고가 없습니다.</p>
        ) : null}
      </div>

      {draft ? <AffiliateFormModal draft={draft} onClose={() => setDraft(null)} onSaved={() => void reload()} /> : null}
    </div>
  )
}

export default AdminAffiliatesPage
