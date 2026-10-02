import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { printablePath } from '@/shared/config/catalog'
import { pickLocalized } from '@/shared/lib/detailCopy'
import { ageGroupLabel } from '@/shared/lib/printableMeta'
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

function ageTags(printable: Printable) {
  return [printable.age_group, printable.age_group_en, ...printable.tags].filter(Boolean)
}

export function PrintableCard({ printable }: PrintableCardProps) {
  const { t, i18n } = useTranslation()
  const title = pickLocalized(printable, 'title', i18n.language || i18n.resolvedLanguage) || printable.title
  const age = ageGroupLabel(ageTags(printable)).replace(/^만\s*/, '') || t('detail.allAges', '전연령')

  return (
    <Link
      to={printablePath(printable.slug || printable.id)}
      state={{ printable }}
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all hover:border-emerald-500/50 hover:shadow-md"
    >
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-50/40 p-4">
        <span className="absolute top-3 right-3 z-10 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 shadow-2xs backdrop-blur-xs">
          {age}
        </span>
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

      <div className="flex items-start justify-between gap-2 border-t border-slate-100 bg-white px-4 py-3">
        <h3 className="line-clamp-2 h-[2.75rem] min-w-0 flex-1 text-[14px] font-bold leading-snug text-slate-800 transition-colors group-hover:text-emerald-700">
          {title}
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all group-hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white sm:text-sm">
          <span aria-hidden>🖨️</span>
          <span>{t('detail.freePrint', '무료 인쇄')}</span>
        </span>
      </div>
    </Link>
  )
}
