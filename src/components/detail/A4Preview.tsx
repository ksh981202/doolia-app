import { Download, Heart, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LightboxModal } from '@/components/LightboxModal'
import { cn } from '@/shared/lib/cn'
import { useBookmarkStore } from '@/shared/store/useBookmarkStore'
import { useDownloadStore } from '@/shared/store/useDownloadStore'
import type { Printable } from '@/types/printable'

type PreviewMode = 'line' | 'color'

export function A4Preview({ printable }: { printable: Printable }) {
  const [mode, setMode] = useState<PreviewMode>('line')
  const [isZoomed, setIsZoomed] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const openModal = useDownloadStore((state) => state.openModal)
  const toggle = useBookmarkStore((state) => state.toggle)
  const bookmarked = useBookmarkStore((state) => state.ids.includes(printable.id))
  const likesCount = bookmarked ? 4 : 3
  const src = mode === 'line' ? printable.image_bw_url : printable.image_color_url
  const title = printable.title_ko

  useEffect(() => {
    if (!shareMsg) return
    const timer = window.setTimeout(() => setShareMsg(''), 2000)
    return () => window.clearTimeout(timer)
  }, [shareMsg])

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMsg('링크를 복사했어요')
    } catch {
      setShareMsg('복사에 실패했어요')
    }
  }

  return (
    <div className="flex items-start gap-4 sm:gap-5">
      <div className="flex shrink-0 flex-col gap-3">
        <ThumbnailButton
          src={printable.image_bw_url}
          label="흑백 도안"
          active={mode === 'line'}
          onClick={() => setMode('line')}
        />
        <ThumbnailButton
          src={printable.image_color_url}
          label="컬러 예시"
          active={mode === 'color'}
          onClick={() => setMode('color')}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <A4Paper src={src} title={title} mode={mode} onZoom={() => setIsZoomed(true)} />

        <div className="relative mt-3 grid w-full grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => toggle(printable.id)}
            className={cn(
              'flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-bold shadow-2xs transition-all active:scale-[0.99] sm:text-sm',
              bookmarked
                ? 'border-rose-200 bg-rose-50/80 text-rose-600'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
            )}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? '좋아요 취소' : '좋아요'}
          >
            <Heart className={cn('h-4 w-4 text-rose-500', bookmarked && 'fill-rose-500')} />
            <span>좋아요{likesCount > 0 ? ` ${likesCount}` : ''}</span>
          </button>
          <button
            type="button"
            onClick={() => openModal(printable)}
            title="A4 PDF 파일로 내 기기에 저장"
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-[0.99] sm:text-sm"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>PDF 저장</span>
          </button>
          <button
            type="button"
            onClick={() => void share()}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-[0.99] sm:text-sm"
          >
            <Share2 className="h-4 w-4 text-slate-600" />
            <span>공유</span>
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

      <LightboxModal
        open={isZoomed}
        src={src}
        title={title}
        onClose={() => setIsZoomed(false)}
        onPrint={() => {
          setIsZoomed(false)
          openModal(printable)
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
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex h-28 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 bg-white p-1.5 shadow-xs transition-all sm:h-32 sm:w-24',
        active
          ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
          : 'border-slate-200 opacity-70 hover:opacity-100',
      )}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full rounded-xl object-contain"
      />
    </button>
  )
}

function A4Paper({
  src,
  title,
  mode,
  onZoom,
}: {
  src: string
  title: string
  mode: PreviewMode
  onZoom: () => void
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const loaded = loadedSrc === src

  useEffect(() => {
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
      {mode === 'line' ? (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-900/75 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-sm">
          <span>🎨</span>
          <span>좌측 썸네일로 색칠 예시 확인</span>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onZoom}
        className="absolute bottom-3 right-3 z-10 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-slate-900 group-hover:opacity-100"
      >
        크게 보기
      </button>
      <img
        src={src}
        alt={`${title} ${mode === 'line' ? '선화' : '컬러'} 미리보기`}
        decoding="async"
        className={cn(
          'relative z-[1] h-full w-full cursor-zoom-in rounded-xl object-contain transition-transform duration-300 group-hover:scale-[1.02]',
          !loaded && 'opacity-0',
        )}
        onClick={onZoom}
        onLoad={() => setLoadedSrc(src)}
        onError={() => setLoadedSrc(src)}
      />
    </div>
  )
}
