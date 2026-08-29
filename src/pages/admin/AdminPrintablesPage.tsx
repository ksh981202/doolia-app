import { type FormEvent, useEffect, useState } from 'react'
import { ADMIN_PRINTABLE_CATEGORIES, AGE_OPTIONS, PRINTABLE_TSV_HEADER } from '@/admin/adminOptions'
import { parsePrintableSheet } from '@/admin/parsePrintableSheet'
import {
  deletePrintable,
  importPrintableRows,
  listAdminPrintables,
  savePrintable,
  setPrintablePublished,
  uploadAdminFile,
  type AdminPrintable,
  type PrintableDraft,
} from '@/services/adminPrintableService'

const emptyDraft = (): PrintableDraft => ({
  slug: '',
  title_ko: '',
  title_en: '',
  catalog_slug: 'coloring-pages',
  age: '4-5',
  tags: '',
  image_bw_url: '',
  image_color_url: '',
  pdf_url: '',
  published: true,
  description: '',
})

export function AdminPrintablesPage() {
  const [items, setItems] = useState<AdminPrintable[]>([])
  const [draft, setDraft] = useState<PrintableDraft>(emptyDraft())
  const [sheet, setSheet] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const reload = () => listAdminPrintables().then(setItems)

  useEffect(() => {
    void reload()
  }, [])

  const onFile = async (key: 'image_bw_url' | 'image_color_url' | 'pdf_url', file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      const url = await uploadAdminFile('printables', file)
      setDraft((current) => ({ ...current, [key]: url }))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '업로드 실패')
    } finally {
      setBusy(false)
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await savePrintable(draft)
      setDraft(emptyDraft())
      setMessage('도안을 저장했습니다.')
      await reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장 실패 (Supabase RLS/스키마를 확인하세요)')
    } finally {
      setBusy(false)
    }
  }

  const importSheet = async () => {
    const parsed = parsePrintableSheet(sheet)
    if (!parsed.rows.length) {
      setMessage(parsed.errors[0] || '가져올 행이 없습니다.')
      return
    }
    setBusy(true)
    try {
      const result = await importPrintableRows(parsed.rows)
      setMessage(`${result.saved.length}건 등록. ${result.errors.length ? result.errors.join(' / ') : ''}`)
      await reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">도안 관리</h1>
        <p className="mt-1 text-sm text-muted">흑백/컬러 이미지와 A4 PDF를 등록하거나 TSV/CSV로 대량 등록합니다.</p>
      </div>
      {message ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">{message}</p> : null}

      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 sm:grid-cols-2 sm:p-5">
        <label className="text-sm font-bold text-ink">
          제목 (한글)
          <input required value={draft.title_ko} onChange={(e) => setDraft({ ...draft, title_ko: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium" />
        </label>
        <label className="text-sm font-bold text-ink">
          제목 (영문)
          <input value={draft.title_en} onChange={(e) => setDraft({ ...draft, title_en: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium" />
        </label>
        <label className="text-sm font-bold text-ink">
          슬러그
          <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="tyranno-coloring" className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium" />
        </label>
        <label className="text-sm font-bold text-ink">
          카테고리
          <select value={draft.catalog_slug} onChange={(e) => setDraft({ ...draft, catalog_slug: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium">
            {ADMIN_PRINTABLE_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-ink">
          연령대
          <select value={draft.age} onChange={(e) => setDraft({ ...draft, age: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium">
            {AGE_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-ink">
          주제 태그
          <input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} placeholder="공룡, 초급" className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium" />
        </label>
        <label className="text-sm font-bold text-ink sm:col-span-2">
          흑백 이미지 (BW)
          <input type="file" accept="image/*" onChange={(e) => void onFile('image_bw_url', e.target.files?.[0])} className="mt-1 w-full text-sm" />
          {draft.image_bw_url ? <span className="mt-1 block truncate text-xs text-muted">{draft.image_bw_url}</span> : null}
        </label>
        <label className="text-sm font-bold text-ink sm:col-span-2">
          컬러 이미지 (Color)
          <input type="file" accept="image/*" onChange={(e) => void onFile('image_color_url', e.target.files?.[0])} className="mt-1 w-full text-sm" />
          {draft.image_color_url ? <span className="mt-1 block truncate text-xs text-muted">{draft.image_color_url}</span> : null}
        </label>
        <label className="text-sm font-bold text-ink sm:col-span-2">
          A4 PDF
          <input type="file" accept="application/pdf,image/*" onChange={(e) => void onFile('pdf_url', e.target.files?.[0])} className="mt-1 w-full text-sm" />
          {draft.pdf_url ? <span className="mt-1 block truncate text-xs text-muted">{draft.pdf_url}</span> : null}
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
          바로 발행
        </label>
        <button disabled={busy} type="submit" className="h-11 rounded-full bg-emerald-600 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60">
          새 도안 등록
        </button>
      </form>

      <section className="rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-extrabold text-ink">대량 등록 (TSV/CSV 18열)</h2>
        <p className="mt-1 break-all text-xs text-muted">{PRINTABLE_TSV_HEADER}</p>
        <textarea
          value={sheet}
          onChange={(e) => setSheet(e.target.value)}
          rows={6}
          placeholder="헤더 + 행을 붙여넣으세요"
          className="mt-3 w-full rounded-xl border border-line p-3 font-mono text-xs"
        />
        <button type="button" disabled={busy} onClick={() => void importSheet()} className="mt-3 h-10 rounded-full bg-slate-900 px-4 text-sm font-bold text-white">
          대량 등록 실행
        </button>
      </section>

      <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-emerald-50/70 text-xs font-extrabold text-slate-600">
            <tr>
              <th className="px-3 py-3">썸네일</th>
              <th className="px-3 py-3">제목</th>
              <th className="px-3 py-3">카테고리</th>
              <th className="px-3 py-3">다운로드</th>
              <th className="px-3 py-3">상태</th>
              <th className="px-3 py-3">삭제</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <img src={item.image_color_url || item.image_bw_url} alt="" className="h-12 w-12 rounded-lg object-cover bg-slate-100" />
                </td>
                <td className="px-3 py-2 font-bold text-ink">{item.title_ko}</td>
                <td className="px-3 py-2 text-slate-600">{item.catalog_slug || item.category}</td>
                <td className="px-3 py-2">{item.downloads}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => void setPrintablePublished(item.id, !item.published).then(reload)}
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${item.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}
                  >
                    {item.published ? '발행' : '숨김'}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('이 도안을 삭제할까요?')) void deletePrintable(item.id).then(reload)
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

export default AdminPrintablesPage
