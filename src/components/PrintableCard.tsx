import { Eye, Heart, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getCategoryThemes } from '@/shared/config/categories'
import { printablePath } from '@/shared/config/catalog'
import { pickLocalized } from '@/shared/lib/detailCopy'
import { matchesQuery } from '@/services/printableService'
import { useBookmarkStore } from '@/shared/store/useBookmarkStore'
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
  const bookmarked = useBookmarkStore((state) => state.ids.includes(printable.id))
  const likesCount = bookmarked ? 4 : 3
  const viewsCount = printable.views || 17

  return (
    <Link
      to={printablePath(printable.slug || printable.id)}
      state={{ printable }}
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md"
    >
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-50/40 p-4">
        <span className="pointer-events-none absolute top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-sm backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
          🖨️ {t('detail.previewBw', '흑백 도안 미리보기')}
        </span>
        <img
          src={displayImage(printable)}
          alt={title}
          className="h-full w-full object-contain transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:contrast-125 group-hover:grayscale"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="w-full space-y-1.5 border-t border-slate-100 bg-white p-3">
        <p className="truncate text-[11px] font-semibold tracking-tight text-slate-400 sm:text-[12px]">
          {theme ? `${age} · ${theme}` : age}
        </p>
        <h3 className="line-clamp-2 w-full break-words text-[14px] font-bold leading-snug text-slate-800 transition-colors group-hover:text-emerald-600 sm:text-[15px]">
          {title}
        </h3>
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-400 sm:text-[12px]">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              <span>{likesCount}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              <span>{viewsCount.toLocaleString(locale)}</span>
            </span>
          </div>
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-colors group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-600"
          >
            <Printer className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
