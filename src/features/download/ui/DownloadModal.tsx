import { Download, ExternalLink, Printer, X } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { incrementPrintableDownloads } from '@/services/printableService'
import type { Printable } from '@/types/printable'
import { AD_COUNTDOWN_SECONDS } from '@/shared/config/categories'
import { incrementAffiliateClick, incrementAffiliateImpression } from '@/services/affiliateService'
import {
  AFFILIATE_GUIDE_TITLE,
  type AffiliateItem,
  getAffiliateLink,
  pickAffiliateText,
  prefetchAffiliateMedia,
  resolveAffiliateVideoUrl,
} from '@/shared/config/affiliates'
import { TOUCH_ICON, cn } from '@/shared/lib/cn'
import { detailTitle } from '@/shared/lib/detailCopy'
import { prefetchPrintImage, printPrintable } from '@/shared/lib/printPage'
import { getDisplayImageUrl, printableLineArtUrl, printableViewUrl } from '@/shared/utils/printableAssets'
import { useDownloadStore } from '@/shared/store/useDownloadStore'

function AffiliateMedia({ affiliate, alt }: { affiliate: AffiliateItem; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoSrc = resolveAffiliateVideoUrl(affiliate)
  const [showVideo, setShowVideo] = useState(Boolean(videoSrc))

  useEffect(() => {
    setShowVideo(Boolean(videoSrc))
  }, [videoSrc])

  useEffect(() => {
    const node = videoRef.current
    if (!node || !showVideo) return
    node.muted = true
    node.defaultMuted = true
    node.playsInline = true
    const play = () => {
      void node.play().catch(() => undefined)
    }
    play()
    node.addEventListener('canplay', play)
    node.addEventListener('loadeddata', play)
    return () => {
      node.removeEventListener('canplay', play)
      node.removeEventListener('loadeddata', play)
      node.pause()
    }
  }, [videoSrc, showVideo])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 shadow-sm">
      {showVideo && videoSrc ? (
        <video
          key={videoSrc}
          ref={videoRef}
          src={videoSrc}
          poster={affiliate.image}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="h-full w-full object-cover"
          onError={() => setShowVideo(false)}
        />
      ) : (
        <img src={affiliate.image} alt={alt} className="h-full w-full object-cover" />
      )}
    </div>
  )
}

export function DownloadModal() {
  const { isOpen, printable, affiliate, closeModal } = useDownloadStore()

  useEffect(() => {
    prefetchAffiliateMedia()
  }, [])

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
  const originalSrc = printableViewUrl(printable, viewMode)
  const previewSrc = getDisplayImageUrl(originalSrc, 1000)
  const affiliateLink = getAffiliateLink(affiliate, lang)
  const affiliateKey = affiliate.id.startsWith('affiliate_') ? affiliate.id : `affiliate_${affiliate.id}`
  const affiliateBadge = t('affiliate.badge', { defaultValue: pickAffiliateText(affiliate.badge, lang) })
  const affiliateHeadline = t(`affiliate.${affiliateKey}.title`, {
    defaultValue: pickAffiliateText(affiliate.headline, lang),
  })
  const affiliatePain = t(`affiliate.${affiliateKey}.pain_point`, {
    defaultValue: pickAffiliateText(affiliate.painPoint, lang),
  })
  const affiliateGuide = t('affiliate.guide', { defaultValue: pickAffiliateText(AFFILIATE_GUIDE_TITLE, lang) })
  const affiliateBenefit1 = t(`affiliate.${affiliateKey}.point1`, {
    defaultValue: pickAffiliateText(affiliate.benefit1, lang),
  })
  const affiliateBenefit2 = t(`affiliate.${affiliateKey}.point2`, {
    defaultValue: pickAffiliateText(affiliate.benefit2, lang),
  })
  const affiliateCta = t(`affiliate.${affiliateKey}.cta_btn`, {
    defaultValue: pickAffiliateText(affiliate.ctaText, lang),
  })

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

  useEffect(() => {
    prefetchPrintImage(printableLineArtUrl(printable) || originalSrc)
  }, [printable, originalSrc])

  useEffect(() => {
    void incrementAffiliateImpression(affiliate.id)
  }, [affiliate.id])

  const handleDownload = async () => {
    if (!ready || generating) return
    setError('')
    setGenerating(true)
    try {
      const { generatePrintablePdf } = await import('@/shared/lib/generatePrintablePdf')
      await generatePrintablePdf(printable, { variant: viewMode })
      await incrementPrintableDownloads(printable.id)
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : 'PDF를 만들지 못했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const handleAffiliateNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    void incrementAffiliateClick(affiliate.id)
    window.open(affiliateLink, '_blank', 'noopener,noreferrer')
  }

  const handleDirectPrint = () => {
    const printTitle = title || 'DOOLIA Printable'
    const ok = printPrintable(printTitle, printableLineArtUrl(printable) || originalSrc)
    if (!ok) {
      setError(t('detail.notFound', '도안을 찾을 수 없어요.'))
      return
    }
    void incrementPrintableDownloads(printable.id)
  }

  return (
    <div
      className="modal-backdrop no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-4"
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
          className={`${TOUCH_ICON} absolute top-3 right-3 z-20 rounded-full bg-slate-100/80 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 sm:top-4 sm:right-4`}
          aria-label={t('detail.back', '닫기')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid max-h-[92dvh] grid-cols-1 divide-y divide-slate-100 overflow-y-auto md:max-h-[92vh] md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="flex min-h-0 flex-col space-y-3 p-4 sm:space-y-4 sm:p-7">
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
                className="mb-2 truncate text-[18px] font-bold leading-snug tracking-tight text-slate-900 sm:mb-3 sm:text-[20px]"
              >
                {title}
              </h2>
            </div>

            <div className="relative mx-auto flex w-full max-h-[42vh] items-center justify-center rounded-2xl border border-slate-200/60 bg-slate-50/50 p-1 sm:max-h-[500px]">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={title}
                  className="max-h-[42vh] w-full select-none object-contain sm:max-h-[500px]"
                />
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

          <div className="flex min-h-0 flex-col justify-between space-y-3 p-4 sm:space-y-3.5 sm:p-7">
            <div>
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1 text-[13px] font-bold tracking-tight text-emerald-900 sm:text-[13.5px]">
                {affiliateBadge}
              </span>
              <h3 className="mt-1.5 line-clamp-1 text-[18px] font-bold leading-snug tracking-tight text-slate-900 sm:text-[20px]">
                {affiliateHeadline}
              </h3>
            </div>

            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleAffiliateNavigate}
              className="block"
            >
              <AffiliateMedia affiliate={affiliate} alt={affiliateHeadline} />
            </a>

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
                onClick={handleAffiliateNavigate}
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
