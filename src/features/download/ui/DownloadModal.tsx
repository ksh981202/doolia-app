import { Download, ExternalLink, Printer, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { incrementPrintableDownloads } from '@/services/printableService'
import type { Printable } from '@/types/printable'
import { AD_COUNTDOWN_SECONDS } from '@/shared/config/categories'
import {
  AFFILIATE_GUIDE_TITLE,
  type AffiliateItem,
  getAffiliateLink,
  getNextAffiliateItem,
  pickAffiliateText,
} from '@/shared/config/affiliates'
import { cn } from '@/shared/lib/cn'
import { detailTitle } from '@/shared/lib/detailCopy'
import { generatePrintablePdf } from '@/shared/lib/generatePrintablePdf'
import { printFooterMarkup } from '@/shared/lib/printFooter'
import { printableViewUrl } from '@/shared/utils/printableAssets'
import { useDownloadStore } from '@/shared/store/useDownloadStore'

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
      @page { size: A4 portrait; margin: 0; }
      html, body { margin: 0; width: 210mm; height: 297mm; background: #fff; }
      .print-page {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 210mm;
        height: 297mm;
        padding: 8mm 8mm 6mm;
      }
      .print-page img { flex: 1; width: 100%; min-height: 0; object-fit: contain; }
      .print-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 3mm;
        padding: 1.5mm 2mm 0;
        border-top: 0.4pt solid #cbd5e1;
        color: #64748b;
        font-family: "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
        font-size: 10px;
        font-weight: 500;
      }
      .print-footer-brand { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
      .print-footer-name { color: #334155; font-weight: 700; }
      .print-footer-sep { color: #94a3b8; }
      .print-footer-legal { color: #94a3b8; font-size: 9.5px; text-align: right; }
    </style>
  </head>
  <body>
    <div class="print-page">
      <img src="${safeUrl}" alt="${safeTitle}" onload="window.focus(); window.print();" />
      ${printFooterMarkup()}
    </div>
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
  const wasOpen = useRef(false)
  const affiliateRef = useRef<AffiliateItem | null>(null)

  if (isOpen && !wasOpen.current) {
    affiliateRef.current = getNextAffiliateItem()
  }
  wasOpen.current = isOpen
  const affiliate = affiliateRef.current

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeModal])

  if (!isOpen || !printable || !affiliate) return null

  return (
    <DownloadModalBody
      key={`${printable.id}-${affiliate.id}`}
      printable={printable}
      affiliate={affiliate}
      onClose={closeModal}
    />
  )
}

function DownloadModalBody({
  printable,
  affiliate,
  onClose,
}: {
  printable: Printable
  affiliate: AffiliateItem
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const viewMode = useDownloadStore((state) => state.viewMode)
  const setViewMode = useDownloadStore((state) => state.setViewMode)
  const [secondsLeft, setSecondsLeft] = useState(AD_COUNTDOWN_SECONDS)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const ready = secondsLeft <= 0 && !generating
  const lang = (i18n.language || i18n.resolvedLanguage || 'ko').split('-')[0]
  const title = detailTitle(printable, i18n.language || i18n.resolvedLanguage)
  const previewSrc = printableViewUrl(printable, viewMode)
  const affiliateLink = getAffiliateLink(affiliate, lang)
  const affiliateBadge = pickAffiliateText(affiliate.badge, lang)
  const affiliateHeadline = pickAffiliateText(affiliate.headline, lang)
  const affiliatePain = pickAffiliateText(affiliate.painPoint, lang)
  const affiliateGuide = pickAffiliateText(AFFILIATE_GUIDE_TITLE, lang)
  const affiliateBenefit1 = pickAffiliateText(affiliate.benefit1, lang)
  const affiliateBenefit2 = pickAffiliateText(affiliate.benefit2, lang)
  const affiliateCta = pickAffiliateText(affiliate.ctaText, lang)

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
      await generatePrintablePdf(printable, { variant: viewMode })
      await incrementPrintableDownloads(printable.id)
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : 'PDF를 만들지 못했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDirectPrint = () => {
    const imgUrl = safePrintUrl(printableViewUrl(printable, viewMode))
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
              <div className="mb-2 flex items-center justify-between gap-2 pr-10 md:pr-0">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-[12.5px] font-bold text-emerald-800">
                  🖨️ {t('detail.printPreview', 'PRINT PREVIEW')}
                </span>
                <div
                  className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold"
                  role="tablist"
                  aria-label={t('detail.previewMode', '도안 보기')}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'bw'}
                    onClick={() => setViewMode('bw')}
                    className={cn(
                      'rounded-md px-2.5 py-1 transition-all',
                      viewMode === 'bw'
                        ? 'bg-white font-bold text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800',
                    )}
                  >
                    🖨️ {t('detail.thumbnailBw', '흑백 도안')}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'color'}
                    onClick={() => setViewMode('color')}
                    className={cn(
                      'rounded-md px-2.5 py-1 transition-all',
                      viewMode === 'color'
                        ? 'bg-white font-bold text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800',
                    )}
                  >
                    🎨 {t('detail.thumbnailColor', '컬러 예시')}
                  </button>
                </div>
              </div>
              <h2
                id="download-modal-title"
                className="mb-3 truncate text-[19px] font-bold leading-snug tracking-tight text-slate-900 sm:text-[20px]"
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
                className="flex h-[46px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-[14.5px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
              >
                <Printer className="h-4 w-4 shrink-0" />
                <span className="truncate">{t('detail.printNowBtn', '즉시 바로 인쇄')}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={!ready}
                className={cn(
                  'flex h-[46px] items-center justify-center gap-2 rounded-xl px-3 text-[14.5px] font-bold transition-all',
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
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1 text-[13px] font-bold tracking-tight text-emerald-900 sm:text-[13.5px]">
                {affiliateBadge}
              </span>
              <h3 className="mt-1.5 line-clamp-1 text-[18px] font-bold leading-snug tracking-tight text-slate-900 sm:text-[20px]">
                {affiliateHeadline}
              </h3>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 shadow-sm">
              <img src={affiliate.image} alt={affiliateHeadline} className="h-full w-full object-cover" />
            </div>

            <div>
              <div className="my-2 flex items-center justify-center gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2.5">
                <span className="flex-shrink-0 text-base">⚠️</span>
                <p className="text-center text-[13.5px] font-semibold leading-normal tracking-tight text-amber-950 sm:text-[14px]">
                  {affiliatePain}
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="mb-1 flex items-center gap-1.5 text-[12.5px] font-bold text-slate-700">
                  <span>💡</span>
                  <span>{affiliateGuide}</span>
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[13px] font-medium leading-snug text-slate-700 sm:text-[13.5px]">
                    <span className="mt-0.5 flex-shrink-0 font-bold text-emerald-500">✓</span>
                    <span>{affiliateBenefit1}</span>
                  </li>
                  <li className="flex items-start gap-2 text-[13px] font-medium leading-snug text-slate-700 sm:text-[13.5px]">
                    <span className="mt-0.5 flex-shrink-0 font-bold text-emerald-500">✓</span>
                    <span>{affiliateBenefit2}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <a
                href={affiliateLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-[15px] font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-[0.99] sm:text-[16px]"
              >
                <span>{affiliateCta}</span>
                <ExternalLink className="h-4 w-4 shrink-0 text-white" />
              </a>
              <p className="mt-1.5 text-center text-[11.5px] tracking-tight text-slate-400">
                {t('detail.affiliateDisclaimer', '제휴 활동의 일환으로 일정 수수료를 지급받을 수 있습니다.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
