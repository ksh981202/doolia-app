import { Download, ExternalLink, Printer, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { incrementPrintableDownloads } from '@/services/printableService'
import type { Printable } from '@/types/printable'
import { AD_COUNTDOWN_SECONDS } from '@/shared/config/categories'
import { cn } from '@/shared/lib/cn'
import { detailTitle } from '@/shared/lib/detailCopy'
import { generatePrintablePdf } from '@/shared/lib/generatePrintablePdf'
import { printableLineArtUrl } from '@/shared/utils/printableAssets'
import { useDownloadStore } from '@/shared/store/useDownloadStore'

const AFFILIATE_IMAGE =
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop'
const AFFILIATE_COUPANG = `https://www.coupang.com/np/search?q=${encodeURIComponent('무독성 유아 크레파스')}`
const AFFILIATE_AMAZON = 'https://www.amazon.com/s?k=crayola+ultra+clean+washable+crayons'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function safePrintUrl(url: string) {
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    return parsed.href
  } catch {
    return ''
  }
}

function printDocumentHtml(title: string, imgUrl: string) {
  const safeTitle = escapeHtml(title || 'DOOLIA Printable')
  const safeUrl = escapeHtml(imgUrl)
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <style>
      @page { size: auto; margin: 0; }
      html, body { margin: 0; height: 100%; background: #fff; }
      body { display: flex; align-items: center; justify-content: center; }
      img { max-width: 90%; max-height: 90%; object-fit: contain; }
    </style>
  </head>
  <body>
    <img src="${safeUrl}" alt="${safeTitle}" onload="window.focus(); window.print();" />
  </body>
</html>`
}

function writePrintHtml(target: Document, title: string, imgUrl: string) {
  target.open()
  target.write(printDocumentHtml(title, imgUrl))
  target.close()
}

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
  const { t, i18n } = useTranslation()
  const [secondsLeft, setSecondsLeft] = useState(AD_COUNTDOWN_SECONDS)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const ready = secondsLeft <= 0 && !generating
  const lang = (i18n.language || i18n.resolvedLanguage || 'ko').split('-')[0]
  const title = detailTitle(printable, i18n.language || i18n.resolvedLanguage)
  const previewSrc = printableLineArtUrl(printable)
  const affiliateLink = lang === 'ko' ? AFFILIATE_COUPANG : AFFILIATE_AMAZON

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

  const handleDirectPrint = () => {
    const imgUrl = safePrintUrl(printableLineArtUrl(printable))
    const printTitle = title || 'DOOLIA Printable'
    if (!imgUrl) {
      setError(t('detail.notFound', '도안을 찾을 수 없어요.'))
      return
    }

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      writePrintHtml(printWindow.document, printTitle, imgUrl)
      void incrementPrintableDownloads(printable.id)
      return
    }

    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument
    if (!doc) {
      iframe.remove()
      window.print()
      return
    }
    writePrintHtml(doc, printTitle, imgUrl)
    const cleanup = () => iframe.remove()
    iframe.contentWindow?.addEventListener('afterprint', cleanup)
    window.setTimeout(cleanup, 60_000)
    void incrementPrintableDownloads(printable.id)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-slate-100/80 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
          aria-label={t('detail.back', '닫기')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid max-h-[92vh] grid-cols-1 divide-y divide-slate-100 overflow-y-auto md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="flex min-h-0 flex-col space-y-4 p-6 sm:p-7">
            <div>
              <span className="rounded-full border border-emerald-200/50 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                {t('detail.printPreview', 'PRINT PREVIEW')}
              </span>
              <h2
                id="download-modal-title"
                className="mt-1.5 truncate text-lg font-extrabold text-slate-900 sm:text-xl"
              >
                {title}
              </h2>
            </div>

            <div className="relative mx-auto flex min-h-[420px] w-full flex-1 items-center justify-center rounded-2xl border border-slate-200/60 bg-slate-50/50 p-1 sm:min-h-[480px]">
              {previewSrc ? (
                <img src={previewSrc} alt={title} className="h-full w-full select-none object-contain" />
              ) : (
                <p className="text-xs font-semibold text-slate-400">{t('detail.notFound', '미리보기 없음')}</p>
              )}
            </div>

            {error ? <p className="text-center text-sm font-bold text-red-600">{error}</p> : null}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDirectPrint}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
              >
                <Printer className="h-4 w-4 shrink-0" />
                <span className="truncate">{t('detail.printNowBtn', '즉시 바로 인쇄')}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={!ready}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[14px] font-bold transition-all',
                  ready
                    ? 'cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400',
                )}
              >
                <Download className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {generating
                    ? 'PDF 생성 중...'
                    : secondsLeft > 0
                      ? `광고 시청 중… ${secondsLeft}초`
                      : t('detail.downloadBtn', '무료 PDF 저장')}
                </span>
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-col justify-between space-y-3.5 p-6 sm:p-7">
            <div>
              <span className="rounded-full border border-emerald-200/50 bg-emerald-50 px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-wider text-emerald-700">
                {t('detail.affiliatePick', "✨ DOOLIA'S CHOICE")}
              </span>
              <h3 className="mt-1.5 text-lg font-extrabold text-slate-900 sm:text-[21px]">
                {t('detail.affiliateHeadline', '아이와 함께하는 미술놀이 추천 준비물')}
              </h3>
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100 shadow-xs">
              <img
                src={AFFILIATE_IMAGE}
                alt={t('detail.affiliateImgAlt', '미술 놀이 준비물')}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/80 px-4 py-3">
                <span className="shrink-0 text-lg">⚠️</span>
                <p className="break-keep text-[14px] font-bold leading-snug text-amber-950 sm:text-[14.5px]">
                  {t(
                    'detail.affiliatePain',
                    '아이와 색칠놀이를 하다 보면 손이나 옷에 크레용이 묻어 신경 쓰일 때가 있죠.',
                  )}
                </p>
              </div>

              <div className="space-y-2.5 rounded-xl border border-slate-200/60 bg-slate-50/90 p-4">
                <p className="flex items-center gap-2 text-[14px] font-extrabold text-slate-900 sm:text-[14.5px]">
                  <span className="text-base text-emerald-600">💡</span>
                  <span>{t('detail.affiliatePlayTip', '이런 크레용을 찾아보세요')}</span>
                </p>
                <ul className="space-y-2 text-[13.5px] font-semibold text-slate-700 sm:text-[14px]">
                  <li className="flex items-center gap-2.5">
                    <span className="shrink-0 text-base font-extrabold text-emerald-600">✔</span>
                    <span>{t('detail.affiliateB1Text', '물티슈나 물로 쉽게 닦이는 워셔블 제품')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="shrink-0 text-base font-extrabold text-emerald-600">✔</span>
                    <span>{t('detail.affiliateB2Text', '아이 손에 부담이 적은 부드러운 발색')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-0.5">
              <a
                href={affiliateLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-[15px] font-extrabold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] sm:text-[15.5px]"
              >
                <span>{t('detail.affiliateCta', '아이용 지워지는 크레용 둘러보기')}</span>
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                {t('detail.affiliateDisclaimer', '제휴 활동의 일환으로 일정 수수료를 지급받을 수 있습니다.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
