import { useEffect, useMemo, useState } from 'react'
import { ADMIN_PRINTABLE_CATEGORIES, PRINTABLE_TSV_HEADER } from '@/admin/adminOptions'
import { useBulkPrintableUpload } from '@/admin/useBulkPrintableUpload'
import { FileDropZone } from '@/components/admin/FileDropZone'
import { isImageFile, type BulkMatchRow } from '@/admin/matchBulkPrintables'
import { cn } from '@/shared/lib/cn'

const TSV_ACCEPT = '.tsv,.csv,.txt,text/tab-separated-values,text/csv,text/plain'
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'

function FileThumb({ file }: { file?: File }) {
  const src = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(() => () => {
    if (src) URL.revokeObjectURL(src)
  }, [src])
  if (!src) {
    return <div className="h-12 w-12 rounded-lg bg-slate-100" aria-hidden />
  }
  return <img src={src} alt="" className="h-12 w-12 rounded-lg bg-slate-100 object-cover" />
}

function categoryLabel(row: BulkMatchRow['row']) {
  const slug = row.catalog_slug || row.category
  return ADMIN_PRINTABLE_CATEGORIES.find((item) => item.id === slug)?.label || slug || '-'
}

export function AdminUploadPage() {
  const bulk = useBulkPrintableUpload()
  const [doneNote, setDoneNote] = useState('')
  const progressPct = bulk.progress && bulk.progress.total
    ? Math.round((bulk.progress.current / bulk.progress.total) * 100)
    : 0

  const onTsvFiles = (incoming: File[]) => {
    const sheet = incoming.find((file) => /\.(tsv|csv|txt)$/i.test(file.name) || file.type.includes('csv') || file.type.includes('tab'))
    if (!sheet) {
      setDoneNote('TSV 또는 CSV 파일을 올려 주세요.')
      return
    }
    void bulk.loadTsvFile(sheet)
  }

  const onImageFiles = (incoming: File[]) => {
    bulk.addImageFiles(incoming.filter(isImageFile))
  }

  const runUpload = async () => {
    setDoneNote('')
    const result = await bulk.uploadMatched()
    if (result.errors.length) setDoneNote(result.errors.slice(0, 6).join(' / '))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">대량 업로드</h1>
        <p className="mt-1 text-sm text-muted">
          TSV 메타데이터와 이미지 파일을 드롭하면 파일명으로 짝을 맞춘 뒤 Storage 업로드와 DB 등록을 진행합니다.
        </p>
        <p className="mt-2 break-all text-[11px] leading-5 text-slate-500">{PRINTABLE_TSV_HEADER}</p>
      </div>

      {bulk.message ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">{bulk.message}</p>
      ) : null}
      {doneNote ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{doneNote}</p> : null}
      {bulk.duplicateNames.length ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          동일 파일명이 2개 이상입니다. 첫 파일만 사용하며 업로드할 수 없습니다:{' '}
          {bulk.duplicateNames.join(', ')}
        </p>
      ) : null}
      {bulk.parseErrors.length ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">{bulk.parseErrors.join(' / ')}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <FileDropZone
          label="1. TSV / CSV 메타데이터"
          hint="헤더가 있는 TSV 또는 CSV를 드롭하세요. 붙여넣기 등록은 사용하지 않습니다."
          accept={TSV_ACCEPT}
          multiple={false}
          disabled={bulk.uploading}
          onFiles={onTsvFiles}
        >
          {bulk.tsvName ? (
            <p className="mt-3 text-xs font-bold text-emerald-800">
              {bulk.tsvName} · {bulk.rows.length}행
            </p>
          ) : null}
        </FileDropZone>
        <FileDropZone
          label="2. 이미지 파일 (JPG / PNG / WEBP)"
          hint="색칠공부: {slug}_b.jpg + {slug}_c.jpg · 일반: {slug}.jpg. 폴더째 드롭도 됩니다."
          accept={IMAGE_ACCEPT}
          disabled={bulk.uploading}
          onFiles={onImageFiles}
        >
          {bulk.files.length ? (
            <p className="mt-3 text-xs font-bold text-emerald-800">이미지 {bulk.files.length}장</p>
          ) : null}
        </FileDropZone>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm">
        <span className="font-bold text-ink">매칭 {bulk.matchedCount}건</span>
        <span className="font-bold text-red-600">누락 {bulk.missingCount}건</span>
        {bulk.unmatched.length ? (
          <span className="text-xs font-medium text-muted">미사용 이미지 {bulk.unmatched.length}장</span>
        ) : null}
        <button
          type="button"
          disabled={bulk.uploading || !bulk.matchedCount || bulk.duplicateNames.length > 0}
          onClick={() => void runUpload()}
          className="ml-auto h-10 rounded-full bg-emerald-600 px-4 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          매칭된 도안 업로드
        </button>
        <button
          type="button"
          disabled={bulk.uploading}
          onClick={bulk.reset}
          className="h-10 rounded-full border border-line px-4 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
        >
          초기화
        </button>
      </div>

      {bulk.progress ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>
              {bulk.progress.current}/{bulk.progress.total} · {bulk.progress.label}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white">
        <table className="min-w-[820px] w-full text-left text-sm">
          <thead className="bg-emerald-50/70 text-xs font-extrabold text-slate-600">
            <tr>
              <th className="px-3 py-3">상태</th>
              <th className="px-3 py-3">미리보기</th>
              <th className="px-3 py-3">제목</th>
              <th className="px-3 py-3">카테고리</th>
              <th className="px-3 py-3">기대 파일</th>
              <th className="px-3 py-3">누락</th>
            </tr>
          </thead>
          <tbody>
            {bulk.matches.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-sm font-medium text-muted">
                  TSV와 이미지를 올리면 매칭 결과가 여기에 표시됩니다.
                </td>
              </tr>
            ) : (
              bulk.matches.map((item) => (
                <tr key={`${item.baseSlug}-${item.index}`} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold',
                        item.status === 'matched' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700',
                      )}
                    >
                      {item.status === 'matched' ? '성공' : '실패'}
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500">{item.mode === 'pair' ? 'BW+Color' : '단일'}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <FileThumb file={item.bwFile} />
                      {item.mode === 'pair' ? <FileThumb file={item.colorFile} /> : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-bold text-ink">{item.row.title_ko || item.row.slug || '-'}</td>
                  <td className="px-3 py-2 text-slate-600">{categoryLabel(item.row)}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    <p>{item.expectedBw || '-'}</p>
                    {item.mode === 'pair' ? <p>{item.expectedColor || '-'}</p> : null}
                  </td>
                  <td className="px-3 py-2 text-xs font-bold text-red-600">
                    {item.missing.length ? item.missing.join(', ') : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUploadPage
