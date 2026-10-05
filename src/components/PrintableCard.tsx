import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getCategoryThemes } from '@/shared/config/categories'
import { printablePath } from '@/shared/config/catalog'
import { pickLocalized } from '@/shared/lib/detailCopy'
import { matchesQuery } from '@/services/printableService'
import { getDisplayImageUrl } from '@/shared/utils/printableAssets'
import { usePrintableSocial } from '@/shared/store/usePrintableEngagement'
import type { Printable } from '@/types/printable'

type PrintableCardProps = {
  printable: Printable
  variant?: 'home' | 'catalog'
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
  const hay = [printable.age_group, printable.age_group_en, ...printable.tags].filter(Boolean).join(' ')
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

export function PrintableCard({ printable }: PrintableCardProps) {
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

  return (
    <Link
      to={printablePath(printable.slug || printable.id)}
      state={{ printable }}
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md"
      onPointerDown={() => {
        const line = printable.image_bw_url || printable.line_art_url
        if (!line) return
        const img = new Image()
        img.src = getDisplayImageUrl(line, 640)
      }}
    >
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-50/40 p-4">
        <span className="pointer-events-none absolute top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-sm backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
          🖨️ {t('detail.previewBw', '흑백 도안 미리보기')}
        </span>
        <img
          src={getDisplayImageUrl(displayImage(printable), 640)}
          alt={title}
          className="h-full w-full object-contain transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:contrast-125 group-hover:grayscale"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            const original = displayImage(printable)
            if (original && event.currentTarget.src !== original) event.currentTarget.src = original
          }}
        />
      </div>

      <div className="flex flex-1 flex-col justify-between bg-white p-3.5 sm:p-4">
        <div>
          <p className="mb-1 line-clamp-1 text-[12.5px] font-bold leading-tight tracking-tight text-emerald-600 sm:text-[13px]">
            {theme ? `${age} · ${theme}` : age}
          </p>
          <h3 className="line-clamp-2 break-words text-[16px] font-bold leading-snug tracking-tight text-slate-800 transition-colors group-hover:text-emerald-600 sm:text-[17px]">
            {title}
          </h3>
        </div>
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-100/90 pt-2 text-slate-500">
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
