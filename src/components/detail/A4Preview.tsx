import { Heart, Share2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { LightboxModal } from '@/components/LightboxModal'
import { cn } from '@/shared/lib/cn'
import { seoPrintableAlt } from '@/shared/config/seo'
import {
  prefetchPrintImage,
  isMobilePrintHost,
  printPrintable,
  PRINT_BRAND_FOOTER_LEFT,
  PRINT_BRAND_FOOTER_RIGHT,
} from '@/shared/lib/printPage'
import { getDisplayImageUrl, printableColorUrl, printableLineArtUrl } from '@/shared/utils/printableAssets'
import { useDownloadStore } from '@/shared/store/useDownloadStore'
import { usePrintableSocial } from '@/shared/store/usePrintableEngagement'
import type { Printable } from '@/types/printable'

type PreviewMode = 'line' | 'color'

const PREVIEW_WIDTH = 640
const THUMB_WIDTH = 240
const LIGHTBOX_WIDTH = 1400

function prefetchImage(url: string) {
  if (!url) return
  const img = new Image()
  img.src = url
}

function waitForImage(url: string) {
  return new Promise<void>((resolve) => {
    if (!url) {
      resolve()
      return
    }
    const img = new Image()
    const done = () => resolve()
    img.onload = done
    img.onerror = done
    img.src = url
    if (img.complete) resolve()
  })
}

export function A4Preview({ printable }: { printable: Printable }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<PreviewMode>('color')
  const [isZoomed, setIsZoomed] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const printingRef = useRef(false)
  const { isLiked, likesCount, toggleLike } = usePrintableSocial(printable)
  const setViewMode = useDownloadStore((state) => state.setViewMode)

  useEffect(() => {
    setViewMode(mode === 'color' ? 'color' : 'bw')
  }, [mode, setViewMode])
  const lineSrc = printableLineArtUrl(printable)
  const colorSrc = printableColorUrl(printable)
  const linePreview = getDisplayImageUrl(lineSrc, PREVIEW_WIDTH)
  const colorPreview = getDisplayImageUrl(colorSrc, PREVIEW_WIDTH)
  const previewSrc = mode === 'color' ? colorPreview : linePreview
  const previewFallback = mode === 'color' ? colorSrc : lineSrc
  const title = printable.title || printable.title_ko
  const printAlt = seoPrintableAlt(printable.title_ko || title)
  const likesLabel = t('detail.likes', '좋아요')

  useEffect(() => {
    prefetchImage(getDisplayImageUrl(lineSrc, THUMB_WIDTH))
    prefetchImage(mode === 'color' ? linePreview : colorPreview)
  }, [mode, linePreview, colorPreview, lineSrc])

  useEffect(() => {
    if (!previewSrc) return
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = previewSrc
    link.setAttribute('fetchpriority', 'high')
    document.head.appendChild(link)
    return () => link.remove()
  }, [previewSrc])

  useEffect(() => {
    if (!shareMsg) return
    const timer = window.setTimeout(() => setShareMsg(''), 2000)
    return () => window.clearTimeout(timer)
  }, [shareMsg])

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMsg(t('detail.linkCopied', '링크를 복사했어요'))
    } catch {
      setShareMsg(t('detail.copyFailed', '복사에 실패했어요'))
    }
  }

  useEffect(() => {
    prefetchPrintImage(lineSrc)
  }, [lineSrc])

  const requestPrint = () => {
    if (printingRef.current) return
    printingRef.current = true
    if (isMobilePrintHost()) {
      printPrintable(printAlt, lineSrc)
      printingRef.current = false
      return
    }
    void waitForImage(lineSrc).finally(() => {
      window.print()
      printingRef.current = false
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="flex shrink-0 flex-col gap-3">
          <ThumbnailButton
            src={getDisplayImageUrl(lineSrc, THUMB_WIDTH)}
            fallbackSrc={lineSrc}
            label={t('detail.thumbnailBw', '흑백 도안')}
            alt={printAlt}
            active={mode === 'line'}
            onClick={() => setMode('line')}
          />
          <ThumbnailButton
            src={getDisplayImageUrl(colorSrc, THUMB_WIDTH)}
            fallbackSrc={colorSrc}
            label={t('detail.thumbnailColor', '컬러 예시')}
            alt={printAlt}
            active={mode === 'color'}
            onClick={() => setMode('color')}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <A4Paper
            src={previewSrc}
            fallbackSrc={previewFallback}
            title={printAlt}
            zoomLabel={t('detail.zoomIn', '크게 보기')}
            onZoom={() => setIsZoomed(true)}
          />

          <div className="relative flex w-full flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={toggleLike}
              className={cn(
                'flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border bg-white px-2 text-[14px] font-medium text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.99]',
                isLiked ? 'border-rose-200 bg-rose-50/80 text-rose-600' : 'border-slate-200',
              )}
              aria-pressed={isLiked}
              aria-label={likesLabel}
            >
              <Heart className={cn('h-4 w-4 shrink-0 text-rose-500', isLiked && 'fill-rose-500')} />
              <span className="min-w-0 truncate">
                {likesLabel} {likesCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => void share()}
              className="flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-[14px] font-medium text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.99]"
            >
              <Share2 className="h-4 w-4 shrink-0 text-slate-600" />
              <span className="min-w-0 truncate">{t('detail.share', '공유하기')}</span>
            </button>
            {shareMsg ? (
              <p
                role="status"
                className="pointer-events-none absolute -top-10 right-0 z-10 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-md"
              >
                {shareMsg}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {createPortal(
        <div id="doolia-print-sheet" className="print-sheet hidden">
          <div className="printable-art">
            {lineSrc ? <img className="printable-image" src={lineSrc} alt={printAlt} /> : null}
          </div>
          <div className="print-brand-footer">
            <span className="brand-left">{PRINT_BRAND_FOOTER_LEFT}</span>
            <span className="brand-right">{PRINT_BRAND_FOOTER_RIGHT}</span>
          </div>
        </div>,
        document.body,
      )}

      <LightboxModal
        open={isZoomed}
        src={getDisplayImageUrl(previewFallback, LIGHTBOX_WIDTH) || previewSrc}
        title={printAlt}
        onClose={() => setIsZoomed(false)}
        onPrint={() => {
          setIsZoomed(false)
          void requestPrint()
        }}
      />
    </div>
  )
}

function ThumbnailButton({
  src,
  fallbackSrc,
  label,
  alt,
  active,
  onClick,
}: {
  src: string
  fallbackSrc: string
  label: string
  alt: string
  active: boolean
  onClick: () => void
}) {
  const [current, setCurrent] = useState(src)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setCurrent(src)
    setLoaded(false)
  }, [src])

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        'relative flex aspect-square w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 transition-all sm:w-24',
        active ? 'border-2 border-emerald-500' : 'border border-slate-200 opacity-80 hover:opacity-100',
      )}
    >
      {current ? (
        <>
          {!loaded ? <span className="absolute inset-1 animate-pulse rounded-xl bg-slate-100" /> : null}
          <img
            key={current}
            src={current}
            alt={alt}
            loading="eager"
            decoding="async"
            {...{ fetchpriority: 'high' }}
            className={cn('relative z-[1] h-full w-full rounded-xl object-contain', loaded ? 'opacity-100' : 'opacity-0')}
            onLoad={() => setLoaded(true)}
            ref={(node) => {
              if (node?.complete && node.naturalWidth > 0) queueMicrotask(() => setLoaded(true))
            }}
            onError={() => {
              if (fallbackSrc && current !== fallbackSrc) {
                setLoaded(false)
                setCurrent(fallbackSrc)
              }
            }}
          />
        </>
      ) : (
        <span className="px-1 text-center text-[10px] font-bold text-slate-400">{label}</span>
      )}
    </button>
  )
}

function A4Paper({
  src,
  fallbackSrc,
  title,
  zoomLabel,
  onZoom,
}: {
  src: string
  fallbackSrc: string
  title: string
  zoomLabel: string
  onZoom: () => void
}) {
  const [activeSrc, setActiveSrc] = useState(src)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setActiveSrc(src)
    setLoaded(false)
  }, [src])

  return (
    <div className="group relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)]">
      {!loaded ? <div className="absolute inset-0 animate-pulse bg-slate-100" /> : null}
      <button
        type="button"
        onClick={onZoom}
        className="absolute bottom-3 right-3 z-10 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-slate-900 group-hover:opacity-100"
      >
        {zoomLabel}
      </button>
      {activeSrc ? (
        <img
          key={activeSrc}
          src={activeSrc}
          alt={title}
          loading="eager"
          decoding="sync"
          {...{ fetchpriority: 'high' }}
          className={cn(
            'relative z-[1] h-full w-full cursor-zoom-in rounded-xl object-contain group-hover:scale-[1.02]',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          onClick={onZoom}
          onLoad={() => setLoaded(true)}
          ref={(node) => {
            if (node?.complete && node.naturalWidth > 0) queueMicrotask(() => setLoaded(true))
          }}
          onError={() => {
            if (fallbackSrc && activeSrc !== fallbackSrc) {
              setLoaded(false)
              setActiveSrc(fallbackSrc)
            }
          }}
        />
      ) : null}
    </div>
  )
}
