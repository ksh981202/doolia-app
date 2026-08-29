import { Download, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { incrementPrintableDownloads } from '@/services/printableService'
import type { Printable } from '@/types/printable'
import { AD_COUNTDOWN_SECONDS, BRAND } from '@/shared/config/categories'
import { cn } from '@/shared/lib/cn'
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
  const ready = secondsLeft <= 0

  useEffect(() => {
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
    if (!ready) return
    await incrementPrintableDownloads(printable.id)
    const anchor = document.createElement('a')
    anchor.href = printable.pdf_url
    anchor.download = `${printable.title}.pdf`
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
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
        className="w-full max-w-lg overflow-hidden rounded-[28px] border border-line bg-paper shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
              Free A4 PDF
            </p>
            <h2 id="download-modal-title" className="mt-1 font-display text-2xl font-semibold">
              {printable.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-ink"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-brand/30 bg-brand-soft p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink/80">
              <Sparkles size={16} className="text-brand" />
              광고 영역 · {AD_COUNTDOWN_SECONDS}초 후 다운로드가 열려요
            </div>
            <div className="flex h-28 items-center justify-center rounded-xl bg-white/70 text-sm font-semibold text-ink/50">
              AdSense / 파트너 광고 슬롯
            </div>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={printable.image_bw_url}
              alt={`${printable.title_ko} 선화 미리보기`}
              className="h-20 w-16 rounded-xl border border-line bg-white object-cover"
            />
            <p className="text-sm leading-6 text-ink/70">
              고화질 A4 PDF를 받은 뒤 바로 인쇄해 보세요.
              <br />
              파일 하단에는 <span className="font-bold text-ink">{BRAND.watermark}</span> 표시가
              들어갑니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={!ready}
            className={cn(
              'flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-display text-lg font-semibold transition',
              ready
                ? 'bg-brand text-white shadow-[0_6px_0_#047857] hover:bg-brand-dark'
                : 'cursor-not-allowed bg-line text-ink/40',
            )}
          >
            {ready ? (
              <>
                <Download size={20} />
                PDF 다운로드
              </>
            ) : (
              `광고 시청 중… ${secondsLeft}초`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
