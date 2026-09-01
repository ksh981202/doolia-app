import { type FormEvent, useEffect, useRef, useState } from 'react'
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
import { R2MediaLibraryModal } from '@/components/admin/R2MediaLibraryModal'
import { TipWysiwygEditor, type TipWysiwygEditorHandle } from '@/components/admin/TipWysiwygEditor'

const emptyDraft = (): TipDraft => ({
  slug: '',
  title: '',
  excerpt: '',
  category: 'cognition',
  thumbnail: '',
  readMinutes: 6,
  published: false,
  bodyMarkdown: '',
})

export function AdminTipsPage() {
  const [items, setItems] = useState<AdminTip[]>([])
  const [draft, setDraft] = useState<TipDraft>(emptyDraft())
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [libraryTarget, setLibraryTarget] = useState<'body' | 'thumbnail' | null>(null)
  const [editorKey, setEditorKey] = useState(0)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [thumbnailNote, setThumbnailNote] = useState('')
  const [toast, setToast] = useState('')
  const editorRef = useRef<TipWysiwygEditorHandle>(null)
  const thumbnailFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const clearThumbnail = () => {
    setDraft((current) => {
      if (current.thumbnail.startsWith('blob:')) URL.revokeObjectURL(current.thumbnail)
      return { ...current, thumbnail: '' }
    })
    if (thumbnailFileRef.current) thumbnailFileRef.current.value = ''
    setThumbnailNote('썸네일을 삭제했습니다.')
  }

  const reload = () => listAdminTips().then(setItems)
  useEffect(() => {
    void reload()
  }, [])

  const resetEditor = () => setEditorKey((key) => key + 1)

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
    })
    resetEditor()
    setThumbnailNote('')
    setToast('선택한 칼럼을 수정 모드로 불러왔습니다.')
    if (thumbnailFileRef.current) thumbnailFileRef.current.value = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft.bodyMarkdown.trim()) {
      setMessage('본문을 입력해 주세요.')
      return
    }
    setBusy(true)
    try {
      await saveTip(draft)
      setDraft(emptyDraft())
      resetEditor()
      setThumbnailNote('')
      if (thumbnailFileRef.current) thumbnailFileRef.current.value = ''
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
        <p className="mt-1 text-sm text-muted">
          제목은 상세 페이지 H1로 출력됩니다. 본문은 네이버/티스토리처럼 화면에서 바로 편집하고, 원하는 위치를 클릭한 뒤 사진을 넣으면 됩니다.
        </p>
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
        <div className="sm:col-span-2 space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-ink">썸네일</p>
            <button
              type="button"
              onClick={() => setLibraryTarget('thumbnail')}
              className="inline-flex h-9 items-center justify-center rounded-full bg-emerald-600 px-3.5 text-xs font-extrabold text-white hover:bg-emerald-700"
            >
              🖼️ 라이브러리
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-bold text-ink">
              파일 업로드
              <input
                ref={thumbnailFileRef}
                type="file"
                accept="image/*"
                disabled={thumbnailUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  setThumbnailUploading(true)
                  setThumbnailNote('')
                  void uploadAdminFile('parenting-tips', file)
                    .then((url) => {
                      setDraft((current) => ({ ...current, thumbnail: url }))
                      setThumbnailNote('썸네일을 올렸습니다.')
                    })
                    .catch((error) => {
                      setThumbnailNote(error instanceof Error ? error.message : '썸네일 업로드에 실패했습니다.')
                    })
                    .finally(() => setThumbnailUploading(false))
                }}
                className="mt-1 w-full text-sm"
              />
            </label>
            <label className="text-sm font-bold text-ink">
              썸네일 URL
              <input
                value={draft.thumbnail}
                onChange={(e) => {
                  setDraft({ ...draft, thumbnail: e.target.value })
                  setThumbnailNote('')
                }}
                placeholder="https://... 또는 라이브러리에서 선택"
                className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 font-medium"
              />
            </label>
          </div>
          {thumbnailUploading ? <p className="text-xs font-bold text-emerald-800">업로드 중...</p> : null}
          {thumbnailNote ? (
            <p className={`text-xs font-bold ${/실패/.test(thumbnailNote) ? 'text-red-600' : 'text-emerald-800'}`}>{thumbnailNote}</p>
          ) : null}
          {draft.thumbnail.trim() ? (
            <div className="flex items-start gap-3">
              <img
                src={draft.thumbnail}
                alt="썸네일 미리보기"
                className="h-auto w-[140px] rounded-2xl border border-emerald-100 bg-white object-cover shadow-sm"
              />
              <button
                type="button"
                onClick={clearThumbnail}
                className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white px-3 text-[11px] font-extrabold text-red-600 hover:bg-red-50"
              >
                🗑️ 썸네일 삭제
              </button>
            </div>
          ) : (
            <p className="text-xs font-medium text-muted">라이브러리에서 고르거나, 파일을 올리거나, URL을 입력하면 미리보기가 나타납니다.</p>
          )}
        </div>
        <label className="text-sm font-bold text-ink sm:col-span-2">
          메타 요약문 (SEO)
          <textarea required rows={3} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className="mt-1 w-full rounded-xl border border-line p-3 font-medium" />
        </label>

        <div className="sm:col-span-2">
          <TipWysiwygEditor
            key={`${draft.id ?? 'new'}-${editorKey}`}
            ref={editorRef}
            value={draft.bodyMarkdown}
            initialMode={draft.id ? 'visual' : 'html'}
            onChange={(html) => setDraft((current) => ({ ...current, bodyMarkdown: html }))}
            onOpenLibrary={() => setLibraryTarget('body')}
          />
        </div>

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
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm font-medium text-muted">
                  등록된 칼럼이 없습니다. 위에서 새 칼럼을 등록해 주세요.
                </td>
              </tr>
            ) : (
              items.map((item) => (
              <tr key={item.id || item.slug} className="border-t border-slate-100">
                <td className="px-3 py-2 whitespace-nowrap">{item.publishedAt}</td>
                <td className="px-3 py-2 font-bold text-ink">
                  <a
                    href={`/parenting-tips/${item.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-800 hover:underline"
                  >
                    {item.title}
                  </a>
                </td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <R2MediaLibraryModal
        open={libraryTarget != null}
        onClose={() => setLibraryTarget(null)}
        onSelect={(url) => {
          if (libraryTarget === 'thumbnail') {
            setDraft((current) => ({ ...current, thumbnail: url }))
            if (thumbnailFileRef.current) thumbnailFileRef.current.value = ''
            setThumbnailNote('라이브러리에서 썸네일을 선택했습니다.')
          } else {
            editorRef.current?.insertImage(url)
          }
          setLibraryTarget(null)
        }}
      />
      {toast ? (
        <div
          role="status"
          className="fixed right-4 top-20 z-50 max-w-sm rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-extrabold text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}

export default AdminTipsPage
