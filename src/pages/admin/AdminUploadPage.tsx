import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { ADMIN_PRINTABLE_CATEGORIES, PRINTABLE_TSV_HEADER } from '@/admin/adminOptions'
import { filesFromDataTransfer } from '@/admin/collectDroppedFiles'
import { isImageFile } from '@/admin/matchBulkPrintables'
import {
  useBulkPrintableUpload,
  type SmartPairRow,
  type SmartPairStatus,
} from '@/admin/useBulkPrintableUpload'
import { FileDropZone } from '@/components/admin/FileDropZone'
import { cn } from '@/shared/lib/cn'

const TSV_ACCEPT = '.tsv,.csv,.txt,text/tab-separated-values,text/csv,text/plain'
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'

function isSheetFile(file: File) {
  return /\.(tsv|csv|txt)$/i.test(file.name) || file.type.includes('csv') || file.type.includes('tab') || file.type.includes('text')
}

function FileThumb({ file, emptyLabel }: { file?: File; emptyLabel: string }) {
  const src = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(
    () => () => {
      if (src) URL.revokeObjectURL(src)
    },
    [src],
  )
  if (!src) {
    return (
      <div className="flex h-28 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-400">
        {emptyLabel}
      </div>
    )
  }
  return <img src={src} alt="" className="h-28 w-full rounded-xl bg-slate-100 object-contain" />
}

function categoryLabel(row: SmartPairRow['row']) {
  const slug = row.catalog_slug || row.category || row.category_en || row.category_ko
  return ADMIN_PRINTABLE_CATEGORIES.find((item) => item.id === slug)?.label || slug || ''
}

function statusMeta(status: SmartPairStatus) {
  if (status === 'ready') return { label: '✅ 준비 완료', className: 'bg-emerald-100 text-emerald-800' }
  if (status === 'need-bw') return { label: '⚠️ 흑백 필요', className: 'bg-amber-100 text-amber-800' }
  if (status === 'need-color') return { label: '⚠️ 컬러 필요', className: 'bg-orange-100 text-orange-800' }
  return { label: '⚠️ 흑백·컬러 필요', className: 'bg-red-100 text-red-700' }
}

function SlotBox({
  kind,
  file,
  index,
  lastIndex,
  disabled,
  onMove,
  onReplace,
}: {
  kind: 'bw' | 'color'
  file?: File
  index: number
  lastIndex: number
  disabled: boolean
  onMove: (from: number, to: number) => void
  onReplace: (index: number, file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isBw = kind === 'bw'

  return (
    <div
      className={cn(
        'rounded-2xl border p-3',
        isBw ? 'border-slate-200 bg-slate-50/80' : 'border-violet-100 bg-violet-50/50',
      )}
    >
      <p className="mb-2 text-[11px] font-extrabold text-slate-600">{isBw ? '🖨️ 흑백 도안' : '🎨 컬러 예시'}</p>
      <FileThumb file={file} emptyLabel={isBw ? '흑백 이미지를 올려 주세요' : '컬러 이미지를 올려 주세요'} />
      <p className="mt-2 truncate text-[11px] font-bold text-slate-500" title={file?.name}>
        {file?.name || '파일 없음'}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={disabled || index === 0}
          onClick={() => onMove(index, index - 1)}
          className="h-8 rounded-full border border-line bg-white px-2.5 text-[11px] font-extrabold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          위로
        </button>
        <button
          type="button"
          disabled={disabled || index >= lastIndex}
          onClick={() => onMove(index, index + 1)}
          className="h-8 rounded-full border border-line bg-white px-2.5 text-[11px] font-extrabold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          아래로
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="h-8 rounded-full bg-slate-800 px-2.5 text-[11px] font-extrabold text-white hover:bg-slate-700 disabled:opacity-40"
        >
          교체
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const next = event.target.files?.[0]
          if (next) onReplace(index, next)
          event.target.value = ''
        }}
      />
    </div>
  )
}

function TsvMetaZone({
  disabled,
  tsvName,
  rowCount,
  onSheet,
  onText,
}: {
  disabled: boolean
  tsvName: string
  rowCount: number
  onSheet: (file: File) => void
  onText: (text: string) => void
}) {
  const [active, setActive] = useState(false)
  const [draft, setDraft] = useState('')

  const applyDraft = () => {
    const text = draft.trim()
    if (!text) return
    onText(text)
  }

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setActive(false)
    if (disabled) return
    const files = await filesFromDataTransfer(event.dataTransfer)
    const sheet = files.find(isSheetFile)
    if (sheet) onSheet(sheet)
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault()
        if (!disabled) setActive(true)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) setActive(true)
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => void onDrop(event)}
      className={cn(
        'flex min-h-[220px] flex-col rounded-2xl border-2 border-dashed px-4 py-4 transition',
        disabled ? 'opacity-60' : 'hover:border-emerald-400 hover:bg-emerald-50/40',
        active ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-200 bg-white',
      )}
    >
      <p className="text-sm font-extrabold text-ink">1. TSV / CSV 메타데이터</p>
      <p className="mt-1 text-xs leading-5 text-muted">헤더가 있는 TSV를 붙여넣거나 .tsv / .csv 파일을 드롭하세요.</p>
      <textarea
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onPaste={(event) => {
          const text = event.clipboardData.getData('text')
          if (text.trim()) {
            setDraft(text)
            onText(text)
          }
        }}
        placeholder="slug	type	title_ko	…"
        className="mt-3 min-h-[88px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] leading-5 text-slate-700 outline-none focus:border-emerald-400"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || !draft.trim()}
          onClick={applyDraft}
          className="h-8 rounded-full bg-emerald-600 px-3 text-[11px] font-extrabold text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          붙여넣기 적용
        </button>
        <label className="inline-flex h-8 cursor-pointer items-center rounded-full border border-line bg-white px-3 text-[11px] font-extrabold text-slate-600 hover:bg-slate-50">
          파일 선택
          <input
            type="file"
            accept={TSV_ACCEPT}
            disabled={disabled}
            className="hidden"
            onChange={(event) => {
              const sheet = event.target.files?.[0]
              if (sheet) onSheet(sheet)
              event.target.value = ''
            }}
          />
        </label>
      </div>
      {tsvName ? (
        <p className="mt-3 text-xs font-bold text-emerald-800">
          {tsvName} · {rowCount}행
        </p>
      ) : null}
    </div>
  )
}

export function AdminUploadPage() {
  const bulk = useBulkPrintableUpload()
  const [doneNote, setDoneNote] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const progressPct = bulk.progress && bulk.progress.total
    ? Math.round((bulk.progress.current / bulk.progress.total) * 100)
    : 0
  const bwCount = bulk.bwFiles.filter(Boolean).length
  const colorCount = bulk.colorFiles.filter(Boolean).length
  const lastIndex = Math.max(bulk.pairs.length - 1, 0)

  const onTsvSheet = (file: File) => {
    if (!isSheetFile(file)) {
      setDoneNote('TSV 또는 CSV 파일을 올려 주세요.')
      return
    }
    setDoneNote('')
    void bulk.loadTsvFile(file)
  }

  const runUpload = async () => {
    setDoneNote('')
    setLogs((current) => [...current, `업로드 시작 · ${bulk.pairs.length}건`])
    const result = await bulk.uploadMatched()
    if (result.errors.length) {
      const convertFails = result.errors.filter((line) => line.includes('WebP 변환 실패'))
      const headline = convertFails.length
        ? `WebP 변환 실패 ${convertFails.length}건 — 원본 JPG/PNG는 업로드하지 않았습니다.`
        : ''
      setDoneNote([headline, ...result.errors].filter(Boolean).join(' / '))
      setLogs((current) => [...current, ...result.errors])
    }
    if (result.saved) {
      setLogs((current) => [...current, `${result.saved}건 등록 완료`])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">대량 업로드</h1>
        <p className="mt-1 text-sm text-muted">
          TSV 행 순서와 흑백/컬러 드롭 순서를 1:1로 맞춥니다. 파일명을 바꿀 필요 없이 올린 뒤, 업로드 시{' '}
          <code className="rounded bg-slate-100 px-1">{'{slug}_b.webp'}</code> /{' '}
          <code className="rounded bg-slate-100 px-1">{'{slug}_c.webp'}</code>로 저장됩니다.
        </p>
        <p className="mt-2 break-all text-[11px] leading-5 text-slate-500">{PRINTABLE_TSV_HEADER}</p>
      </div>

      {bulk.message ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">{bulk.message}</p>
      ) : null}
      {doneNote ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{doneNote}</p> : null}
      {bulk.parseErrors.length ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">{bulk.parseErrors.join(' / ')}</p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <TsvMetaZone
          disabled={bulk.uploading}
          tsvName={bulk.tsvName}
          rowCount={bulk.rows.length}
          onSheet={onTsvSheet}
          onText={(text) => {
            setDoneNote('')
            bulk.loadTsvText(text)
          }}
        />
        <FileDropZone
          label="2. 🖨️ 흑백 도안 파일들 (JPG/PNG/WEBP)"
          hint="선화 이미지를 여러 장 드롭하세요. 파일명은 그대로 두고 자연 정렬(GL01, GL02…) 후 TSV 행과 1:1로 맞춥니다."
          accept={IMAGE_ACCEPT}
          disabled={bulk.uploading}
          onFiles={(incoming) => bulk.addBwFiles(incoming.filter(isImageFile))}
        >
          {bwCount ? <p className="mt-3 text-xs font-bold text-emerald-800">흑백 {bwCount}장</p> : null}
        </FileDropZone>
        <FileDropZone
          label="3. 🎨 컬러 예시 파일들 (JPG/PNG/WEBP)"
          hint="컬러 예시 이미지를 여러 장 드롭하세요. 자연 정렬 후 같은 순번의 TSV 행과 짝을 맞춥니다."
          accept={IMAGE_ACCEPT}
          disabled={bulk.uploading}
          onFiles={(incoming) => bulk.addColorFiles(incoming.filter(isImageFile))}
        >
          {colorCount ? <p className="mt-3 text-xs font-bold text-emerald-800">컬러 {colorCount}장</p> : null}
        </FileDropZone>
      </div>

      <div className="space-y-3">
        {bulk.pairs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-medium text-muted">
            TSV를 올리면 도안별 검증 카드가 여기에 나타납니다.
          </div>
        ) : (
          bulk.pairs.map((item) => {
            const badge = statusMeta(item.status)
            const age = item.row.age_group || item.row.age
            const theme = item.row.theme_ko || item.row.theme
            const category = categoryLabel(item.row)
            return (
              <article
                key={`${item.slug}-${item.index}`}
                className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 md:grid-cols-[minmax(180px,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)]"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-500">No.{item.index + 1}</span>
                    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold', badge.className)}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="font-display text-lg font-semibold text-ink">{item.row.title_ko || item.slug}</p>
                  <p className="text-xs font-bold text-slate-500">
                    slug <span className="text-ink">{item.slug}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {age ? (
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-extrabold text-sky-700">{age}</span>
                    ) : null}
                    {theme ? (
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-extrabold text-violet-700">
                        {theme}
                      </span>
                    ) : null}
                    {category ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
                        {category}
                      </span>
                    ) : null}
                  </div>
                </div>
                <SlotBox
                  kind="bw"
                  file={item.bwFile}
                  index={item.index}
                  lastIndex={lastIndex}
                  disabled={bulk.uploading}
                  onMove={bulk.reorderBw}
                  onReplace={bulk.replaceBw}
                />
                <SlotBox
                  kind="color"
                  file={item.colorFile}
                  index={item.index}
                  lastIndex={lastIndex}
                  disabled={bulk.uploading}
                  onMove={bulk.reorderColor}
                  onReplace={bulk.replaceColor}
                />
              </article>
            )
          })
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm">
        <span className="font-bold text-ink">
          총 {bulk.pairs.length}개 도안 중 {bulk.readyCount}개 준비 완료
        </span>
        <button
          type="button"
          disabled={bulk.uploading || !bulk.allReady}
          onClick={() => void runUpload()}
          className="ml-auto h-10 rounded-full bg-emerald-600 px-4 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          매칭된 도안 일괄 업로드
        </button>
        <button
          type="button"
          disabled={bulk.uploading}
          onClick={() => {
            bulk.clearAll()
            setDoneNote('')
            setLogs([])
          }}
          className="h-10 rounded-full border border-line px-4 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
        >
          전체 초기화
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

      {logs.length ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-extrabold text-slate-600">업로드 로그</p>
          <ul className="mt-2 space-y-1 text-[11px] font-medium text-slate-600">
            {logs.map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default AdminUploadPage
