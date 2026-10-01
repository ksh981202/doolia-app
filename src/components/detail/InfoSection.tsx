import { Eye, Heart, Printer } from 'lucide-react'
import { CATEGORY_LABEL } from '@/shared/config/categories'
import { brainDevelopmentPoints, detailAgeLabel, detailTitle, keywordChips, printableIntro } from '@/shared/lib/detailCopy'
import { getImaginationQuestion } from '@/shared/utils/getImaginationQuestion'
import { useBookmarkStore } from '@/shared/store/useBookmarkStore'
import { useDownloadStore } from '@/shared/store/useDownloadStore'
import type { Printable } from '@/types/printable'

function pointEmoji(label: string) {
  if (/정서|안정|마음/.test(label)) return '🧚'
  if (/관찰|집중|시각/.test(label)) return '👁'
  if (/모양|인지|도형/.test(label)) return '🧩'
  if (/창의|상상|사고/.test(label)) return '💡'
  if (/소근육|손가락|운필/.test(label)) return '👀'
  if (/색채|색칠|표현/.test(label)) return '🎨'
  return '✨'
}

export function InfoSection({ printable }: { printable: Printable }) {
  const openModal = useDownloadStore((state) => state.openModal)
  const bookmarked = useBookmarkStore((state) => state.ids.includes(printable.id))
  const title = detailTitle(printable)
  const age = detailAgeLabel(printable)
  const category = CATEGORY_LABEL[printable.category] || '색칠공부'
  const note = printableIntro(printable)
  const question = getImaginationQuestion(printable)
  const points = brainDevelopmentPoints(printable)
  const chips = keywordChips(printable)
  const likesCount = bookmarked ? 4 : 3
  const viewsCount = printable.views || 17

  return (
    <aside>
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-xl border border-amber-200/60 bg-amber-50 px-3 py-1.5 text-[13px] font-bold text-amber-800">
            {age}
          </span>
          <span className="inline-flex items-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[13px] font-bold text-emerald-700">
            {category}
          </span>
        </div>
        <h1 className="my-2.5 break-keep text-[28px] font-extrabold tracking-tight text-slate-900 sm:text-[32px]">
          {title}
        </h1>
        <div className="mb-3 flex items-center gap-3.5 text-[13px] font-medium text-slate-500">
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
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-lg bg-slate-100/90 px-3 py-1.5 text-[13px] font-medium text-slate-600"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {note ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
            <p className="mb-2 flex items-center gap-2 text-[16px] font-bold text-emerald-700">
              <span aria-hidden>🧚</span>
              <span>DOOLIA'S NOTE</span>
            </p>
            <p className="break-keep text-[15px] font-medium leading-relaxed text-slate-700 sm:text-[15.5px]">“{note}”</p>
          </div>
        ) : null}

        {points.length ? (
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 sm:p-5">
            <p className="mb-3 flex items-center gap-2 text-[16px] font-bold text-slate-800">
              <span aria-hidden>🎨</span>
              <span>이 도안의 발달 & 학습 효과</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {points.map((point) => (
                <span
                  key={point.label}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-[14px] font-bold text-slate-700 shadow-sm sm:text-[14.5px]"
                >
                  <span aria-hidden>{pointEmoji(point.label)}</span>
                  <span>{point.label}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 sm:p-5">
          <p className="mb-2 flex items-center gap-2 text-[16px] font-bold text-amber-900">
              <span aria-hidden>💬</span>
              <span>아이에게 이렇게 물어보세요!</span>
          </p>
          <p className="break-keep text-[15px] font-bold leading-relaxed text-slate-900 sm:text-[15.5px]">“{question}”</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openModal(printable)}
        className="mt-5 flex h-16 w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-[18px] font-extrabold tracking-wide text-white shadow-md transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg active:scale-[0.99] sm:text-[19px]"
      >
        <Printer className="mr-2 h-5 w-5" />
        지금 무료로 바로 인쇄하기 (PDF)
      </button>

      <div className="mt-2.5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/90 px-3.5 py-2.5 text-[13px] font-medium text-slate-600">
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
