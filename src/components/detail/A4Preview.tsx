import { Heart, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LightboxModal } from '@/components/LightboxModal'
import { cn } from '@/shared/lib/cn'
import { printableColorUrl, printableLineArtUrl } from '@/shared/utils/printableAssets'
import { useBookmarkStore } from '@/shared/store/useBookmarkStore'
import type { Printable } from '@/types/printable'

type PreviewMode = 'line' | 'color'

export function A4Preview({ printable }: { printable: Printable }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<PreviewMode>('line')
  const [isZoomed, setIsZoomed] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const toggle = useBookmarkStore((state) => state.toggle)
  const bookmarked = useBookmarkStore((state) => state.ids.includes(printable.id))
  const likesCount = bookmarked ? 4 : 3
  const lineSrc = printableLineArtUrl(printable)
  const colorSrc = printableColorUrl(printable)
  const previewSrc = mode === 'color' ? colorSrc : lineSrc
  const title = printable.title || printable.title_ko
  const likesLabel = t('detail.likes', '좋아요')

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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="flex shrink-0 flex-col gap-3">
          <ThumbnailButton
            src={lineSrc}
            label={t('detail.thumbnailBw', '흑백 도안')}
            active={mode === 'line'}
            onClick={() => setMode('line')}
          />
          <ThumbnailButton
            src={colorSrc}
            label={t('detail.thumbnailColor', '컬러 예시')}
            active={mode === 'color'}
            onClick={() => setMode('color')}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <A4Paper
            src={previewSrc}
            title={title}
            zoomLabel={t('detail.zoomIn', '크게 보기')}
            onZoom={() => setIsZoomed(true)}
          />

          <div className="relative grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => toggle(printable.id)}
              className={cn(
                'flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border bg-white text-[14px] font-medium text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.99]',
                bookmarked ? 'border-rose-200 bg-rose-50/80 text-rose-600' : 'border-slate-200',
              )}
              aria-pressed={bookmarked}
              aria-label={likesLabel}
            >
              <Heart className={cn('h-4 w-4 text-rose-500', bookmarked && 'fill-rose-500')} />
              <span>
                {likesLabel} {likesCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => void share()}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[14px] font-medium text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.99]"
            >
              <Share2 className="h-4 w-4 text-slate-600" />
              <span>{t('detail.share', '공유하기')}</span>
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

      <div id="doolia-print-sheet" className="hidden">
        <img src={lineSrc} alt={title} />
      </div>

      <LightboxModal
        open={isZoomed}
        src={previewSrc}
        title={title}
        onClose={() => setIsZoomed(false)}
        onPrint={() => {
          setIsZoomed(false)
          window.print()
        }}
      />
    </div>
  )
}

function ThumbnailButton({
  src,
  label,
  active,
  onClick,
}: {
  src: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        'flex aspect-square w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 transition-all sm:w-24',
        active ? 'border-2 border-emerald-500' : 'border border-slate-200 opacity-80 hover:opacity-100',
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full rounded-xl object-contain" />
      ) : (
        <span className="px-1 text-center text-[10px] font-bold text-slate-400">{label}</span>
      )}
    </button>
  )
}

function A4Paper({
  src,
  title,
  zoomLabel,
  onZoom,
}: {
  src: string
  title: string
  zoomLabel: string
  onZoom: () => void
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const loaded = loadedSrc === src

  useEffect(() => {
    if (!src) {
      setLoadedSrc(src)
      return
    }
    const image = document.createElement('img')
    image.src = src
    if (image.complete && image.naturalWidth > 0) {
      setLoadedSrc(src)
      return
    }
    const markLoaded = () => setLoadedSrc(src)
    image.addEventListener('load', markLoaded)
    image.addEventListener('error', markLoaded)
    return () => {
      image.removeEventListener('load', markLoaded)
      image.removeEventListener('error', markLoaded)
    }
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
      {src ? (
        <img
          key={src}
          src={src}
          alt={title}
          decoding="async"
          className={cn(
            'relative z-[1] h-full w-full cursor-zoom-in rounded-xl object-contain transition-all duration-300 group-hover:scale-[1.02]',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          onClick={onZoom}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setLoadedSrc(src)}
        />
      ) : null}
    </div>
  )
}
