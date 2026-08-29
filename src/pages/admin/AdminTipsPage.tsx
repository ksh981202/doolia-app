import { type FormEvent, useEffect, useRef, useState } from 'react'
import { PARENTING_TIP_CATEGORIES, type ParentingTipTopicId } from '@/data/parentingTipsData'
import { TipBody } from '@/components/parenting/TipBody'
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
import { cn } from '@/shared/lib/cn'

const BODY_PLACEHOLDER = `HTML 태그(<div>, <span>, <table>, <img> 등)와 마크다운(## 제목, - 목록, **강조**)을 자유롭게 작성하세요.
인라인 style(색상, 배경, 여백, 폰트 크기)도 지원됩니다.

## 소제목 예시

본문을 작성하세요.

<div style="padding:16px;background:#ecfdf5;border-radius:16px;color:#047857">
  HTML + 인라인 스타일 박스 예시
</div>`

const emptyDraft = (): TipDraft => ({
  slug: '',
  title: '',
  excerpt: '',
  category: 'cognition',
  thumbnail: '',
  readMinutes: 6,
  published: false,
  bodyMarkdown: '## 소제목\n\n본문에 HTML과 마크다운을 함께 작성하세요.\n\n- 요약 포인트',
  takeaways: '',
})

const BODY_IMAGE_TAG = (url: string) =>
  `<img src="${url}" alt="육아 팁 이미지" class="w-full h-auto rounded-2xl my-6 shadow-sm" />`

const R2_BODY_IMAGE_TAG = (url: string) =>
  `<img src="${url}" alt="DOOLIA 고화질 AI 이미지" class="w-full h-auto rounded-2xl my-6 shadow-md border border-gray-100" />`

function insertAtCaret(source: string, start: number, end: number, snippet: string) {
  const from = Math.max(0, Math.min(start, source.length))
  const to = Math.max(from, Math.min(end, source.length))
  return {
    next: `${source.slice(0, from)}${snippet}${source.slice(to)}`,
    caret: from + snippet.length,
  }
}

export function AdminTipsPage() {
  const [items, setItems] = useState<AdminTip[]>([])
  const [draft, setDraft] = useState<TipDraft>(emptyDraft())
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [bodyTab, setBodyTab] = useState<'edit' | 'preview'>('edit')
  const [bodyImageFile, setBodyImageFile] = useState<File | null>(null)
  const [bodyImageUrl, setBodyImageUrl] = useState('')
  const [bodyImageUploading, setBodyImageUploading] = useState(false)
  const [bodyImageNote, setBodyImageNote] = useState('')
  const [libraryOpen, setLibraryOpen] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const bodyFileRef = useRef<HTMLInputElement>(null)
  const caretRef = useRef<{ start: number; end: number } | null>(null)

  const rememberCaret = () => {
    const el = bodyRef.current
    if (!el) return
    caretRef.current = { start: el.selectionStart, end: el.selectionEnd }
  }

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
    setBodyTab('edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await saveTip(draft)
      setDraft(emptyDraft())
      setBodyTab('edit')
      setBodyImageFile(null)
      setBodyImageUrl('')
      setBodyImageNote('')
      if (bodyFileRef.current) bodyFileRef.current.value = ''
      caretRef.current = null
      setMessage('칼럼을 저장했습니다.')
      await reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장 실패 (parenting_tips 테이블/RLS 확인)')
    } finally {
      setBusy(false)
    }
  }

  const uploadBodyImage = async () => {
    if (!bodyImageFile) {
      setBodyImageNote('이미지 파일을 먼저 선택해 주세요.')
      return
    }
    setBodyImageUploading(true)
    setBodyImageNote('')
    try {
      const url = await uploadAdminFile('parenting-tips', bodyImageFile)
      setBodyImageUrl(url)
      setBodyImageNote('업로드 완료. HTML 삽입 또는 URL 복사를 사용할 수 있습니다.')
    } catch (error) {
      setBodyImageNote(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다. 본문은 그대로 유지됩니다.')
    } finally {
      setBodyImageUploading(false)
    }
  }

  const insertHtmlAtCaret = (snippet: string, note: string) => {
    const el = bodyRef.current
    const live = bodyTab === 'edit' && el
    setDraft((current) => {
      const fallback = current.bodyMarkdown.length
      const start = live ? el.selectionStart : (caretRef.current?.start ?? fallback)
      const end = live ? el.selectionEnd : (caretRef.current?.end ?? start)
      const { next, caret } = insertAtCaret(current.bodyMarkdown, start, end, snippet)
      caretRef.current = { start: caret, end: caret }
      return { ...current, bodyMarkdown: next }
    })
    setBodyTab('edit')
    setBodyImageNote(note)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const textarea = bodyRef.current
        if (!textarea || caretRef.current == null) return
        const pos = caretRef.current.start
        textarea.focus()
        textarea.setSelectionRange(pos, pos)
      })
    })
  }

  const insertBodyImageHtml = () => {
    if (!bodyImageUrl) return
    insertHtmlAtCaret(BODY_IMAGE_TAG(bodyImageUrl), '본문 커서 위치에 이미지 HTML을 삽입했습니다.')
  }

  const insertR2Image = (url: string) => {
    insertHtmlAtCaret(R2_BODY_IMAGE_TAG(url), 'R2 이미지를 본문 커서 위치에 삽입했습니다.')
    setLibraryOpen(false)
  }

  const copyBodyImageUrl = async () => {
    if (!bodyImageUrl) return
    try {
      await navigator.clipboard.writeText(bodyImageUrl)
      setBodyImageNote('이미지 URL을 클립보드에 복사했습니다.')
    } catch {
      setBodyImageNote('URL 복사에 실패했습니다. 주소를 직접 선택해 복사해 주세요.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">육아·놀이 팁 관리</h1>
        <p className="mt-1 text-sm text-muted">HTML·마크다운 본문과 SEO 요약문을 작성하고 발행 상태를 제어합니다.</p>
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

        <div className="sm:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 sm:p-4">
          <p className="text-sm font-bold text-ink">📷 본문용 이미지 업로드</p>
          <p className="mt-1 text-xs font-medium leading-5 text-muted">
            외부 버킷에 들어가지 않고 여기서 올린 뒤, 본문 커서 위치에 HTML로 바로 넣을 수 있습니다.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              ref={bodyFileRef}
              type="file"
              accept="image/*"
              onChange={(event) => {
                setBodyImageFile(event.target.files?.[0] ?? null)
                setBodyImageNote('')
              }}
              className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-emerald-100 file:px-3 file:py-1 file:text-xs file:font-extrabold file:text-emerald-800"
            />
            <button
              type="button"
              disabled={bodyImageUploading}
              onClick={() => void uploadBodyImage()}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {bodyImageUploading ? '업로드 중... ⏳' : '이미지 업로드'}
            </button>
          </div>
          {bodyImageNote ? (
            <p className={`mt-2 text-xs font-bold ${/실패|먼저 선택/.test(bodyImageNote) ? 'text-red-600' : 'text-emerald-800'}`}>
              {bodyImageNote}
            </p>
          ) : null}
          {bodyImageUrl ? (
            <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-3 sm:flex-row sm:items-start">
              <img
                src={bodyImageUrl}
                alt="업로드된 본문 이미지 미리보기"
                className="h-32 w-full rounded-2xl object-cover shadow-sm sm:h-24 sm:w-40 sm:shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="break-all text-xs font-medium leading-5 text-slate-500">{bodyImageUrl}</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={insertBodyImageHtml}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 px-4 text-xs font-extrabold text-white hover:bg-emerald-700"
                  >
                    HTML 코드로 본문 삽입
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyBodyImageUrl()}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 bg-white px-4 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50"
                  >
                    URL 복사
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-ink">본문 (HTML / Markdown 지원)</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  rememberCaret()
                  setLibraryOpen(true)
                }}
                className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 px-3.5 text-xs font-extrabold text-white hover:bg-emerald-700"
              >
                📷 R2 사진 첨부 / 미디어 라이브러리
              </button>
              <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50/70 p-0.5" role="tablist" aria-label="본문 편집 모드">
                <button
                  type="button"
                  role="tab"
                  aria-selected={bodyTab === 'edit'}
                  onClick={() => setBodyTab('edit')}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-extrabold',
                    bodyTab === 'edit' ? 'bg-emerald-600 text-white' : 'text-emerald-800 hover:bg-white',
                  )}
                >
                  편집
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={bodyTab === 'preview'}
                  onClick={() => setBodyTab('preview')}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-extrabold',
                    bodyTab === 'preview' ? 'bg-emerald-600 text-white' : 'text-emerald-800 hover:bg-white',
                  )}
                >
                  미리보기
                </button>
              </div>
            </div>
          </div>
          <textarea
            ref={bodyRef}
            required
            rows={12}
            value={draft.bodyMarkdown}
            onChange={(e) => setDraft((current) => ({ ...current, bodyMarkdown: e.target.value }))}
            onSelect={rememberCaret}
            onClick={rememberCaret}
            onKeyUp={rememberCaret}
            onBlur={rememberCaret}
            placeholder={BODY_PLACEHOLDER}
            className={cn(
              'mt-1 w-full rounded-xl border border-line p-3 font-mono text-sm',
              bodyTab !== 'edit' && 'hidden',
            )}
          />
          {bodyTab === 'preview' ? (
            <div className="mt-1 min-h-[280px] rounded-xl border border-emerald-100 bg-page p-4">
              {draft.bodyMarkdown.trim() ? (
                <TipBody source={draft.bodyMarkdown} />
              ) : (
                <p className="text-sm font-medium text-muted">본문을 입력하면 여기에 미리보기가 표시됩니다.</p>
              )}
            </div>
          ) : null}
        </div>

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

      <R2MediaLibraryModal open={libraryOpen} onClose={() => setLibraryOpen(false)} onSelect={insertR2Image} />
    </div>
  )
}

export default AdminTipsPage
