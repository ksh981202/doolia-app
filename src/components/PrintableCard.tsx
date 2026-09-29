import { Link } from 'react-router-dom'
import { printablePath } from '@/shared/config/catalog'
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
  const title = printable.title_ko || printable.title
  const age = ageGroupLabel(ageTags(printable)).replace(/^만\s*/, '') || '전연령'

  return (
    <Link
      to={printablePath(printable.slug || printable.id)}
      state={{ printable }}
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all hover:border-emerald-500/50 hover:shadow-md"
    >
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-50/40 p-4">
        <span className="absolute top-3 right-3 z-10 rounded-full border border-emerald-200/80 bg-white/90 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 shadow-2xs backdrop-blur-xs">
          {age}
        </span>
        <img
          src={displayImage(printable)}
          alt={title}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-white px-4 py-3">
        <h3 className="truncate text-[15px] font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
          {title}
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11.5px] font-bold text-emerald-800 shadow-2xs transition-all group-hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white">
          <span aria-hidden>🔍</span>
          <span>도안 보기</span>
        </span>
      </div>
    </Link>
  )
}
