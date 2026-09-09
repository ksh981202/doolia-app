import { useEffect, useState } from 'react'
import { incrementPrintableDownloads } from '@/services/printableService'
import type { Printable } from '@/types/printable'
import { AD_COUNTDOWN_SECONDS } from '@/shared/config/categories'
import { cn } from '@/shared/lib/cn'
import { generatePrintablePdf } from '@/shared/lib/generatePrintablePdf'
import { useDownloadStore } from '@/shared/store/useDownloadStore'

export function DownloadModal() {
  const { isOpen, printable, closeModal } = useDownloadStore()

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeModal])

  if (!isOpen || !printable) return null

  return <DownloadModalBody key={printable.id} printable={printable} onClose={closeModal} />
}

function DownloadModalBody({
  printable,
  onClose,
}: {
  printable: Printable
  onClose: () => void
}) {
  const [secondsLeft, setSecondsLeft] = useState(AD_COUNTDOWN_SECONDS)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const ready = secondsLeft <= 0 && !generating
  const previewSrc = printable.image_bw_url || printable.line_art_url || printable.image_color_url

  useEffect(() => {
    if (AD_COUNTDOWN_SECONDS <= 0) return
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const handleDownload = async () => {
    if (!ready || generating) return
    setError('')
    setGenerating(true)
    try {
      await generatePrintablePdf(printable)
      await incrementPrintableDownloads(printable.id)
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : 'PDF를 만들지 못했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-line bg-paper shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 pt-4">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="mb-1 inline-block text-[11px] font-black uppercase tracking-wider text-emerald-600">
                FREE A4 PRINTABLE
              </span>
              <h2
                id="download-modal-title"
                className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl"
              >
                {printable.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="relative my-4 flex w-full items-center justify-center rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-emerald-50/30 p-6">
            <div className="relative flex aspect-[1/1.414] w-44 items-center justify-center overflow-hidden rounded-lg border border-slate-200/80 bg-white p-3 shadow-xl shadow-slate-200/80 transition-transform hover:scale-[1.02] sm:w-52">
              {previewSrc ? (
                <img src={previewSrc} alt={printable.title} className="h-full w-full object-contain" />
              ) : (
                <p className="text-xs font-semibold text-slate-400">미리보기 없음</p>
              )}
              <div className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-black tracking-tight text-white bg-emerald-600">
                A4 300DPI
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs">
              <span>📄</span>
              <span>A4 표준 규격</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 shadow-2xs">
              <span>✨</span>
              <span>300 DPI 초고화질</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs">
              <span>🖨️</span>
              <span>잉크 절약 선화</span>
            </span>
          </div>

          <div className="mb-4 rounded-xl border border-emerald-200/60 bg-emerald-50/70 p-3 text-center sm:p-3.5">
            <p className="text-xs leading-relaxed text-slate-700 sm:text-[13px]">
              <strong className="mr-1 font-bold text-emerald-800">💡 놀이 팁:</strong>
              <span>출력 후 아이와 함께 굵은 테두리를 따라 색칠하며 소근육을 길러보세요!</span>
            </p>
          </div>

          {error ? <p className="mb-3 text-center text-sm font-bold text-red-600">{error}</p> : null}

          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={!ready}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-black shadow-md shadow-emerald-600/25 transition-all sm:text-base',
              ready
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'
                : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none',
            )}
          >
            {generating ? (
              'PDF 생성 중...'
            ) : secondsLeft > 0 ? (
              `광고 시청 중… ${secondsLeft}초`
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>무료 PDF 다운로드</span>
                <span className="text-xs font-semibold text-emerald-100 opacity-90">(초고화질 A4)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
