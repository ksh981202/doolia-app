import { type FormEvent, useEffect, useState } from 'react'
import { PARENTING_TIP_CATEGORIES, type ParentingTipTopicId } from '@/data/parentingTipsData'
import {
  deleteTip,
  listAdminTips,
  saveTip,
  setTipPublished,
  type AdminTip,
  type TipDraft,
} from '@/services/adminTipService'
import { uploadAdminFile } from '@/services/adminPrintableService'

const emptyDraft = (): TipDraft => ({
  slug: '',
  title: '',
  excerpt: '',
  category: 'cognition',
  thumbnail: '',
  readMinutes: 6,
  published: false,
  bodyMarkdown: '## 소제목\n\n본문을 마크다운으로 작성하세요.\n\n- 요약 포인트',
  takeaways: '',
})

export function AdminTipsPage() {
  const [items, setItems] = useState<AdminTip[]>([])
  const [draft, setDraft] = useState<TipDraft>(emptyDraft())
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const reload = () => listAdminTips().then(setItems)
  useEffect(() => {
    void reload()
  }, [])

  const edit = (item: AdminTip) => {
    setDraft({
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      category: item.category,
      thumbnail: item.thumbnail,
      readMinutes: item.readMinutes,
      published: item.published,
      bodyMarkdown: item.bodyMarkdown,
      takeaways: item.takeaways.join('\n'),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await saveTip(draft)
      setDraft(emptyDraft())
      setMessage('칼럼을 저장했습니다.')
      await reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장 실패 (parenting_tips 테이블/RLS 확인)')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">육아·놀이 팁 관리</h1>
        <p className="mt-1 text-sm text-muted">마크다운 본문과 SEO 요약문을 작성하고 발행 상태를 제어합니다.</p>
      </div>
      {message ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">{message}</p> : null}

      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 sm:grid-cols-2 sm:p-5">
        <label className="text-sm font-bold text-ink sm:col-span-2">
          제목
          <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium" />
        </label>
        <label className="text-sm font-bold text-ink">
          슬러그
          <input required value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="coloring-book-emotional-effects" className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium" />
        </label>
        <label className="text-sm font-bold text-ink">
          카테고리
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as ParentingTipTopicId })}
            className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium"
          >
            {PARENTING_TIP_CATEGORIES.filter((item) => item.id !== 'all').map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-ink">
          읽는 시간 (분)
          <input type="number" min={1} value={draft.readMinutes} onChange={(e) => setDraft({ ...draft, readMinutes: Number(e.target.value) })} className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium" />
        </label>
        <label className="text-sm font-bold text-ink">
          썸네일 업로드
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void uploadAdminFile('parenting-tips', file).then((url) => setDraft((current) => ({ ...current, thumbnail: url })))
            }}
            className="mt-1 w-full text-sm"
          />
        </label>
        <label className="text-sm font-bold text-ink sm:col-span-2">
          썸네일 URL
          <input value={draft.thumbnail} onChange={(e) => setDraft({ ...draft, thumbnail: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium" />
        </label>
        <label className="text-sm font-bold text-ink sm:col-span-2">
          메타 요약문 (SEO)
          <textarea required rows={3} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className="mt-1 w-full rounded-xl border border-line p-3 font-medium" />
        </label>
        <label className="text-sm font-bold text-ink sm:col-span-2">
          본문 (Markdown)
          <textarea required rows={10} value={draft.bodyMarkdown} onChange={(e) => setDraft({ ...draft, bodyMarkdown: e.target.value })} className="mt-1 w-full rounded-xl border border-line p-3 font-mono text-sm" />
        </label>
        <label className="text-sm font-bold text-ink sm:col-span-2">
          부모 실행 요약 (줄바꿈으로 구분)
          <textarea rows={4} value={draft.takeaways} onChange={(e) => setDraft({ ...draft, takeaways: e.target.value })} className="mt-1 w-full rounded-xl border border-line p-3 text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
          발행
        </label>
        <button disabled={busy} type="submit" className="h-11 rounded-full bg-emerald-600 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60">
          {draft.id ? '칼럼 수정 저장' : '새 칼럼 등록'}
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-emerald-50/70 text-xs font-extrabold text-slate-600">
            <tr>
              <th className="px-3 py-3">작성일</th>
              <th className="px-3 py-3">제목</th>
              <th className="px-3 py-3">카테고리</th>
              <th className="px-3 py-3">조회수</th>
              <th className="px-3 py-3">상태</th>
              <th className="px-3 py-3">작업</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.slug} className="border-t border-slate-100">
                <td className="px-3 py-2 whitespace-nowrap">{item.publishedAt}</td>
                <td className="px-3 py-2 font-bold text-ink">{item.title}</td>
                <td className="px-3 py-2">{item.category}</td>
                <td className="px-3 py-2">{item.views}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => void setTipPublished(item.id, !item.published).then(reload)}
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${item.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}
                  >
                    {item.published ? '발행' : '숨김'}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button type="button" onClick={() => edit(item)} className="mr-2 text-xs font-bold text-emerald-700">
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('이 칼럼을 삭제할까요?')) void deleteTip(item.id).then(reload)
                    }}
                    className="text-xs font-bold text-red-600"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminTipsPage
