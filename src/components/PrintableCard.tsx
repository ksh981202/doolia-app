import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import { getCategoryThemes } from '@/shared/config/categories'
import { printablePath } from '@/shared/config/catalog'
import { cn } from '@/shared/lib/cn'
import { pickLocalized } from '@/shared/lib/detailCopy'
import { matchesQuery } from '@/services/printableService'
import { getCdnImageUrl, getDisplayImageUrl } from '@/shared/utils/printableAssets'
import { usePrintableSocial } from '@/shared/store/usePrintableEngagement'
import { usePrintableCollection } from '@/features/collection/usePrintableCollection'
import type { Printable } from '@/types/printable'

type PrintableCardProps = {
  printable: Printable
  variant?: 'home' | 'catalog'
  index?: number
}

function displayImage(printable: Printable) {
  return (
    printable.image_color_url ||
    printable.image_bw_url ||
    printable.line_art_url ||
    printable.color_image_url ||
    ''
  )
}

function cardAgeLabel(printable: Printable, locale: string, fallback: string) {
  const hay = [(printable as any).age_ko, printable.age_group, (printable as any).age_en, printable.age_group_en, ...printable.tags].filter(Boolean).join(' ')
  const range = hay.match(/(\d+)\s*[-~–—]\s*(\d+)/)
  const lang = locale.toLowerCase().startsWith('zh') ? 'zh' : locale.slice(0, 2)
  if (!range) return fallback
  const start = range[1]
  const end = range[2]
  if (lang === 'ko') return `${start}~${end}세`
  if (lang === 'ja') return `${start}〜${end}歳`
  if (lang === 'zh') return `${start}~${end}歲`
  if (lang === 'vi') return `${start}-${end} tuổi`
  if (lang === 'de') return `${start}–${end} Jahre`
  if (lang === 'fr') return `${start}-${end} ans`
  if (lang === 'it') return `${start}-${end} anni`
  if (lang === 'es' || lang === 'pt') return `${start}-${end} años`
  return `Ages ${start}-${end}`
}

function resolveThemeOption(printable: Printable) {
  const themes = getCategoryThemes(printable.category === 'senior-art' ? 'senior-art' : 'coloring-pages') ?? []
  const themeEn = printable.theme_en.trim().toLowerCase().replace(/[\s_]+/g, '-')
  const themeKo = printable.theme_ko.trim()
  return (
    themes.find((item) => {
      if (item.id === 'all') return false
      if (themeEn && (themeEn === item.id || themeEn.includes(item.id) || item.id.includes(themeEn))) return true
      if (themeKo && (themeKo === item.name || item.name.includes(themeKo) || themeKo.includes(item.name))) return true
      return Boolean(item.query && matchesQuery(printable, item.query))
    }) ?? null
  )
}

export function PrintableCard({ printable, index = Number.POSITIVE_INFINITY }: PrintableCardProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || i18n.resolvedLanguage || 'ko'
  const title = pickLocalized(printable, 'title', locale) || printable.title
  const age = cardAgeLabel(printable, locale, t('detail.allAges', '전연령'))
  const themeOption = resolveThemeOption(printable)
  const theme =
    (themeOption ? t(`categories.${themeOption.id}`, themeOption.name) : '') ||
    printable.theme_ko ||
    printable.theme_en ||
    t(`categories.${printable.category}`, '')
  const { likesCount, viewsCount } = usePrintableSocial(printable)
  const { isInCollection, addToCollection, removeFromCollection } = usePrintableCollection()
  const slug = printable.slug || printable.id
  const inCollection = isInCollection(slug)

  const handleToggleCollection = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (inCollection) {
      removeFromCollection(slug)
    } else {
      addToCollection({
        slug,
        title,
        image_bw_url: printable.image_bw_url || printable.line_art_url || originalSrc,
        theme: printable.theme_ko || printable.theme_en || '',
        age_group: printable.age_group || '',
      })
    }
  }

  const originalSrc = displayImage(printable)
  const src = getDisplayImageUrl(originalSrc, 640)
  const cdnSrc = getCdnImageUrl(originalSrc)
  const priority = index < 2
  const imgRef = useRef<HTMLImageElement>(null)
  const [loadedSrc, setLoadedSrc] = useState('')
  const loaded = loadedSrc === src

  useLayoutEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) setLoadedSrc(src)
  }, [src])

  return (
    <Link
      to={printablePath(printable.slug || printable.id)}
      state={{ printable }}
      className="group block min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md"
      onPointerDown={() => {
        const line = printable.image_bw_url || printable.line_art_url
        if (!line) return
        const img = new Image()
        img.src = getDisplayImageUrl(line, 640)
      }}
    >
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-100 p-4">
        <div
          className={cn(
            'absolute inset-0 bg-slate-100 transition-opacity duration-300',
            loaded ? 'pointer-events-none opacity-0' : 'animate-pulse opacity-100',
          )}
          aria-hidden
        />
        <span className="pointer-events-none absolute top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-sm backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
          🖨️ {t('detail.previewBw', '흑백 도안 미리보기')}
        </span>
        <button
          type="button"
          onClick={handleToggleCollection}
          aria-label={inCollection ? '바구니에서 제거' : '바구니에 담기'}
          className={cn(
            'absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-xs transition-all duration-200',
            inCollection
              ? 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700 hover:scale-105'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 hover:scale-105',
          )}
        >
          {inCollection ? <Check className="h-4 w-4 stroke-[2.5]" /> : <Plus className="h-4 w-4 stroke-[2.5]" />}
        </button>
        <img
          ref={imgRef}
          src={src}
          alt={title}
          width={480}
          height={640}
          className={cn(
            'relative z-[1] h-full w-full object-contain transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:contrast-125 group-hover:grayscale',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...({ fetchpriority: priority ? 'high' : 'low' } as any)}
          onLoad={() => setLoadedSrc(src)}
          onError={(event) => {
            if (cdnSrc && event.currentTarget.src !== cdnSrc) {
              event.currentTarget.src = cdnSrc
              return
            }
            setLoadedSrc(src)
          }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between bg-white p-3.5 sm:p-4">
        <div className="min-w-0">
          <p className="mb-1 line-clamp-1 min-w-0 break-words text-[12.5px] font-bold leading-tight tracking-tight text-emerald-600 sm:text-[13px]">
            {theme ? `${age} · ${theme}` : age}
          </p>
          <h3 className="line-clamp-2 min-w-0 break-words text-[16px] font-bold leading-snug tracking-tight text-slate-800 transition-colors group-hover:text-emerald-600 sm:text-[17px]">
            {title}
          </h3>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100/90 pt-2 text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[13.5px] font-semibold leading-none transition-colors hover:text-rose-500">
              <span className="text-[15px] leading-none text-rose-500">♥</span>
              {likesCount}
            </span>
            <span className="flex items-center gap-1 text-[13.5px] font-semibold leading-none">
              <span className="text-[15px] leading-none">👁</span>
              {viewsCount.toLocaleString(locale)}
            </span>
          </div>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200/60 bg-slate-50 text-slate-500 shadow-xs transition-all group-hover:border-emerald-500 group-hover:bg-emerald-500 group-hover:text-white">
            <span className="text-[15px] leading-none">🖨️</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
