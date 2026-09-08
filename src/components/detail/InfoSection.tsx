import { Eye, Hand, Heart, Palette, PenTool, Printer, Sparkles, Target, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CATEGORY_LABEL } from '@/shared/config/categories'
import {
  brainDevelopmentPoints,
  detailAgeLabel,
  detailTitle,
  keywordChips,
  parentCoachingTip,
  printableIntro,
} from '@/shared/lib/detailCopy'
import { useBookmarkStore } from '@/shared/store/useBookmarkStore'
import { useDownloadStore } from '@/shared/store/useDownloadStore'
import type { Printable } from '@/types/printable'

function brainPointIcon(label: string): LucideIcon {
  if (/시각|관찰|눈|시선/.test(label)) return Eye
  if (/소근육|운필|쓰기/.test(label)) return PenTool
  if (/손가락|힘|근력/.test(label)) return Hand
  if (/색채|색칠|표현/.test(label)) return Palette
  if (/집중|문제|두뇌/.test(label)) return Target
  return Sparkles
}

export function InfoSection({ printable }: { printable: Printable }) {
  const openModal = useDownloadStore((state) => state.openModal)
  const bookmarked = useBookmarkStore((state) => state.ids.includes(printable.id))
  const title = detailTitle(printable)
  const age = detailAgeLabel(printable)
  const category = CATEGORY_LABEL[printable.category]
  const note = printableIntro(printable).replace(/^[“"']+|[”"']+$/g, '').trim()
  const chips = keywordChips(printable)
  const points = brainDevelopmentPoints(printable)
  const tip = parentCoachingTip(printable)
  const likesCount = (bookmarked ? 4 : 3)
  const viewsCount = printable.views || 17

  return (
    <aside>
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800">
            {age}
          </span>
          <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
            {category}
          </span>
        </div>
        <h1 className="mt-1 mb-2 break-keep text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        <div className="mb-3 flex items-center gap-4 text-sm font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
            <span>{likesCount} 좋아요</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-slate-400" />
            <span>{viewsCount.toLocaleString('ko-KR')} 조회</span>
          </div>
        </div>
        {chips.length ? (
          <div className="mb-3.5 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <Link
                key={chip}
                to={`/category?q=${encodeURIComponent(chip.replace(/^#/, ''))}`}
                className="rounded-xl bg-slate-100/90 px-3 py-1.5 text-xs font-semibold tracking-tight text-slate-700 transition-colors hover:bg-slate-200/80 sm:text-sm"
              >
                {chip}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 p-4 shadow-2xs sm:p-5">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wider text-emerald-800">
          <span>✨</span>
          <span>DOOLIA'S NOTE</span>
        </div>
        <p className="break-keep text-sm font-medium leading-relaxed text-slate-800 sm:text-base">
          “{note}”
        </p>
      </div>

      {points.length ? (
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-2xs sm:p-5">
          <span className="mb-3 block text-sm font-bold text-slate-800">🌱 우리 아이 성장 포인트</span>
          <div className="grid grid-cols-3 gap-2.5">
            {points.map((point) => {
              const Icon = brainPointIcon(point.label)
              return (
                <div
                  key={point.label}
                  className="flex min-h-[3.25rem] items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-2 py-3 text-xs font-bold text-slate-800 shadow-2xs sm:text-sm"
                >
                  <Icon className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span className="truncate">{point.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {tip ? (
        <div className="mt-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 sm:p-5">
          <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-amber-900">
            <span>💡</span>
            <span>부모님을 위한 1분 놀이 대화 팁</span>
          </div>
          <p className="break-keep text-sm font-medium leading-relaxed text-slate-800 sm:text-base">{tip}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => openModal(printable)}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-base font-bold text-white shadow-md transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg active:scale-[0.99] sm:text-lg"
      >
        <Printer className="h-5 w-5" />
        <span>지금 무료로 바로 인쇄하기 (PDF)</span>
      </button>

      <div className="mt-2.5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/90 px-3.5 py-2.5 text-xs font-semibold text-slate-500 sm:text-sm">
        <div className="flex items-center gap-1.5">
          <span>📄</span>
          <span>표준 용지 맞춤</span>
        </div>
        <span className="text-slate-200">|</span>
        <div className="flex items-center gap-1.5">
          <span>🖨️</span>
          <span>잉크 절약 굵은선</span>
        </div>
        <span className="text-slate-200">|</span>
        <div className="flex items-center gap-1.5">
          <span>⚡</span>
          <span>300 DPI 초고화질</span>
        </div>
      </div>
    </aside>
  )
}
