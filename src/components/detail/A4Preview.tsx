import { ChevronDown } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { LightboxModal } from '@/components/LightboxModal'
import { cn } from '@/shared/lib/cn'
import { useDownloadStore } from '@/shared/store/useDownloadStore'
import type { Printable } from '@/types/printable'

type PreviewMode = 'line' | 'color'

export function A4Preview({ printable }: { printable: Printable }) {
  const [mode, setMode] = useState<PreviewMode>('line')
  const [openTip, setOpenTip] = useState(true)
  const [openTerms, setOpenTerms] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const openModal = useDownloadStore((state) => state.openModal)
  const src = mode === 'line' ? printable.image_bw_url : printable.image_color_url
  const title = printable.title_ko

  return (
    <div>
      <div className="flex flex-row items-start gap-4">
        <div className="flex w-20 shrink-0 flex-col gap-3 sm:w-24">
          <p className="mb-1 text-xs font-bold text-gray-500">미리보기</p>
          <button
            type="button"
            onClick={() => setMode('line')}
            className={cn(
              'aspect-[3/4] cursor-pointer overflow-hidden rounded-lg border-2 bg-white transition-all',
              mode === 'line'
                ? 'border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-gray-200 opacity-70 hover:opacity-100',
            )}
            aria-label="흑백 도안"
          >
            <img
              src={printable.image_bw_url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain"
            />
          </button>
          <p className="text-center text-[10px] font-bold text-gray-500">흑백 도안</p>
          <button
            type="button"
            onClick={() => setMode('color')}
            className={cn(
              'aspect-[3/4] cursor-pointer overflow-hidden rounded-lg border-2 bg-white transition-all',
              mode === 'color'
                ? 'border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-gray-200 opacity-70 hover:opacity-100',
            )}
            aria-label="컬러 완성 예시"
          >
            <img
              src={printable.image_color_url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain"
            />
          </button>
          <p className="text-center text-[10px] font-bold text-gray-500">컬러 예시</p>
        </div>

        <A4Paper
          src={src}
          title={title}
          mode={mode}
          onZoom={() => setIsZoomed(true)}
        />
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

      <div className="mt-8 space-y-3">
        <Accordion title="도안 소개 & 활용 팁" open={openTip} onToggle={() => setOpenTip((value) => !value)}>
          {title} 도안은 A4 용지에 맞춰 300DPI로 제작되었습니다. 두꺼운 색연필이나 수성 마카로 칠하면
          선이 또렷하게 살아납니다. 처음에는 큰 면부터 칠하고, 눈·이빨 같은 디테일은 마지막에 마무리해
          보세요.
        </Accordion>
        <Accordion title="이용 안내" open={openTerms} onToggle={() => setOpenTerms((value) => !value)}>
          DOOLIA Printables 무료 도안은 가정 및 교실의 비상업적 인쇄에 한해 사용할 수 있습니다. 상업적
          재판매, 재배포, 워터마크 제거는 허용되지 않습니다. © DOOLIA Printables
        </Accordion>
      </div>
    </div>
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
    <div className="relative mx-auto flex min-w-0 flex-1 aspect-[1/1.414] max-w-[460px] items-center justify-center overflow-hidden rounded-xl border border-gray-200/90 bg-white p-6 shadow-2xl">
      {!loaded ? <div className="absolute inset-0 animate-pulse bg-slate-200" /> : null}
      <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-gray-900/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
        🖨️ A4 · 300 DPI
      </span>
      <button
        type="button"
        onClick={onZoom}
        className="absolute bottom-4 right-4 z-10 flex cursor-pointer items-center gap-1 rounded-lg bg-gray-900/80 px-3 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-sm transition-all hover:bg-gray-900"
      >
        🔍 크게 보기
      </button>
      <img
        src={src}
        alt={`${title} ${mode === 'line' ? '선화' : '컬러'} 미리보기`}
        decoding="async"
        className={cn(
          'relative z-[1] max-h-full max-w-full cursor-zoom-in object-contain drop-shadow-sm',
          !loaded && 'opacity-0',
        )}
        onClick={onZoom}
        onLoad={() => setLoadedSrc(src)}
        onError={() => setLoadedSrc(src)}
      />
    </div>
  )
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left text-sm font-extrabold"
        aria-expanded={open}
      >
        {title}
        <ChevronDown size={18} className={cn('text-muted transition', open && 'rotate-180')} />
      </button>
      {open ? <div className="mt-3 border-t border-gray-100 pt-3 text-sm leading-7 text-muted">{children}</div> : null}
    </section>
  )
}
