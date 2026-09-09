import type { KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { useOpenPrintable } from '@/features/gallery/model/useOpenPrintable'
import { printablePath } from '@/shared/config/catalog'
import { cardCategoryMeta, ageGroupLabel, educationEffect } from '@/shared/lib/printableMeta'
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

export function PrintableCard({ printable, variant = 'home' }: PrintableCardProps) {
  if (variant === 'catalog') {
    return <CatalogPrintableCard printable={printable} />
  }
  return <ShowcasePrintableCard printable={printable} />
}

function openOnEnterOrSpace(event: KeyboardEvent<HTMLElement>, open: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    open()
  }
}

function ShowcasePrintableCard({ printable }: { printable: Printable }) {
  const openPrintable = useOpenPrintable()
  const meta = cardCategoryMeta(printable)
  const open = () => openPrintable(printable)

  return (
    <div
      role="link"
      tabIndex={0}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/5"
      onClick={open}
      onKeyDown={(event) => openOnEnterOrSpace(event, open)}
    >
      <div className="relative flex aspect-[3/4] items-center justify-center border-b border-gray-100 bg-slate-50/50 p-6">
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-gray-200/60 bg-white/90 px-3 py-1 text-xs font-bold text-gray-800 shadow-sm backdrop-blur-sm">
          <span>{meta.emoji}</span>
          <span>{meta.label}</span>
          <span className="text-gray-300">·</span>
          <span className="font-extrabold text-emerald-600">{printable.downloads.toLocaleString()}회</span>
        </div>
        <img
          src={displayImage(printable)}
          alt={printable.title_ko}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1.5 bg-white p-4">
        <span className="inline-block w-fit rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[12px] font-bold text-emerald-700">
          {ageGroupLabel(ageTags(printable))}
        </span>
        <h3 className="text-[16px] font-bold text-slate-900 line-clamp-1 transition-colors group-hover:text-emerald-600">
          {printable.title_ko}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-slate-500">
          {educationEffect(printable)}
        </p>
      </div>
    </div>
  )
}

function CatalogPrintableCard({ printable }: { printable: Printable }) {
  return (
    <Link
      to={printablePath(printable.slug || printable.id)}
      state={{ printable }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:shadow-xl"
    >
      <div className="relative flex aspect-[3/4] items-center justify-center bg-white p-4">
        <img
          src={displayImage(printable)}
          alt={printable.title_ko}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain"
        />
        <span className="absolute top-2.5 right-2.5 z-10 rounded-full border border-emerald-200/70 bg-emerald-50/95 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 shadow-2xs backdrop-blur-2xs">
          {ageGroupLabel(ageTags(printable))}
        </span>
      </div>
      <div className="flex items-center justify-center border-t border-slate-100 bg-slate-50/80 px-4 py-3 text-center transition-colors group-hover:bg-emerald-50/50">
        <h3 className="text-[15px] font-bold tracking-tight text-slate-800 line-clamp-1 group-hover:text-emerald-900">
          {printable.title_ko}
        </h3>
      </div>
    </Link>
  )
}
