import { Bookmark, Download } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { useOpenPrintable } from '@/features/gallery/model/useOpenPrintable'
import { CATEGORY_LABEL } from '@/shared/config/categories'
import { ageBadge } from '@/shared/lib/ageBadge'
import { cn } from '@/shared/lib/cn'
import { cardCategoryMeta, ageGroupLabel, educationEffect } from '@/shared/lib/printableMeta'
import { useBookmarkStore } from '@/shared/store/useBookmarkStore'
import { useDownloadStore } from '@/shared/store/useDownloadStore'
import type { Printable } from '@/types/printable'

type PrintableCardProps = {
  printable: Printable
  variant?: 'home' | 'catalog'
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
          src={printable.image_bw_url || printable.image_color_url}
          alt={printable.title_ko}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1.5 bg-white p-4">
        <span className="inline-block w-fit rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          {ageGroupLabel(printable.tags)}
        </span>
        <h3 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-emerald-600">
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
  const openPrintable = useOpenPrintable()
  const openModal = useDownloadStore((state) => state.openModal)
  const toggle = useBookmarkStore((state) => state.toggle)
  const bookmarked = useBookmarkStore((state) => state.ids.includes(printable.id))
  const open = () => openPrintable(printable)

  return (
    <article
      role="link"
      tabIndex={0}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(16,185,129,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(16,185,129,0.14)]"
      onClick={open}
      onKeyDown={(event) => openOnEnterOrSpace(event, open)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-soft">
        <img
          src={printable.image_color_url}
          alt={printable.title_ko}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-brand px-2 py-1 text-[11px] font-extrabold tracking-wide text-white shadow-sm">
          FREE
        </span>
        <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-extrabold text-ink shadow-sm">
          {ageBadge(printable.tags)}
        </span>
      </div>
      <div className="space-y-3 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-bold text-ink">{printable.title_ko}</h3>
            <p className="mt-1 text-xs font-medium text-muted">{CATEGORY_LABEL[printable.category]}</p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              toggle(printable.id)
            }}
            className={cn(
              'mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full',
              bookmarked ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-page',
            )}
            aria-label="북마크"
          >
            <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            openModal(printable)
          }}
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand text-sm font-extrabold text-white transition hover:bg-brand-dark"
        >
          <Download size={16} />
          무료 PDF 다운로드
        </button>
      </div>
    </article>
  )
}
