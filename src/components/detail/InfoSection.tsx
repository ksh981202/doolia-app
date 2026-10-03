import { Eye, Heart, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  brainDevelopmentPoints,
  detailAgeLabel,
  detailTitle,
  printableIntro,
  printableQuestion,
} from '@/shared/lib/detailCopy'
import { cn } from '@/shared/lib/cn'
import { usePrintableSocial } from '@/shared/store/usePrintableEngagement'
import { useDownloadStore } from '@/shared/store/useDownloadStore'
import type { Printable } from '@/types/printable'

function pointEmoji(label: string) {
  if (/정서|안정|마음|calm|calma|ruhe|평온|bình/i.test(label)) return '🧚'
  if (/관찰|집중|시각|observ|focus|visual|집중|quan sát|tập trung/i.test(label)) return '👁'
  if (/모양|인지|도형|shape|form/i.test(label)) return '🧩'
  if (/창의|상상|사고|creat/i.test(label)) return '💡'
  if (/소근육|손가락|운필|motor|finger|fein/i.test(label)) return '👀'
  if (/색채|색칠|표현|color|colour|farb/i.test(label)) return '🎨'
  return '✨'
}

const TEXT_WRAP = 'min-w-0 break-words [overflow-wrap:anywhere]'

export function InfoSection({ printable }: { printable: Printable }) {
  const { t, i18n } = useTranslation()
  const openModal = useDownloadStore((state) => state.openModal)
  const { isLiked, likesCount, viewsCount } = usePrintableSocial(printable)
  const locale = i18n.language || i18n.resolvedLanguage || 'ko'
  const title = detailTitle(printable, locale)
  const age = detailAgeLabel(printable, locale)
  const category = t(`categories.${printable.category}`, '키즈 색칠도안')
  const note = printableIntro(printable, locale)
  const question = printableQuestion(printable, locale)
  const points = brainDevelopmentPoints(printable, locale)

  return (
    <aside className="min-w-0 w-full">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-xl border border-amber-200/60 bg-amber-50 px-3 py-1.5 text-[13px] font-bold text-amber-800">
            {age}
          </span>
          <span className="inline-flex items-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[13px] font-bold text-emerald-700">
            {category}
          </span>
        </div>
        <h1 className="my-2.5 break-all text-[22px] font-extrabold leading-snug tracking-tight text-slate-900 sm:text-[26px] md:text-[28px]">
          {title}
        </h1>
        <div className="mb-5 flex items-center gap-3.5 text-[13px] font-medium text-slate-500 sm:mb-6">
          <div className="flex items-center gap-1.5">
            <Heart className={cn('h-4 w-4 text-rose-500', isLiked && 'fill-rose-500')} />
            <span>
              {likesCount} {t('detail.likes')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-slate-400" />
            <span>
              {viewsCount.toLocaleString(locale)} {t('detail.views')}
            </span>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-3">
        {note ? (
          <div className="min-w-0 w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
            <p className="mb-2 flex items-center gap-2 text-[16px] font-bold text-emerald-700">
              <span aria-hidden>🧚</span>
              <span>DOOLIA'S NOTE</span>
            </p>
            <p className={cn('text-[15px] font-medium leading-relaxed text-slate-700 sm:text-[15.5px]', TEXT_WRAP)}>
              “{note}”
            </p>
          </div>
        ) : null}

        {points.length ? (
          <div className="min-w-0 w-full rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 sm:p-5">
            <p className="mb-3 flex min-w-0 items-center gap-2 text-[16px] font-bold text-slate-800">
              <span aria-hidden>🎨</span>
              <span className={TEXT_WRAP}>{t('detail.benefitsHeader')}</span>
            </p>
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
              {points.map((point) => (
                <div
                  key={point.label}
                  className="flex min-h-[42px] min-w-0 items-center justify-center gap-1 rounded-xl border border-slate-200/80 bg-white px-2 py-1.5 text-center shadow-xs sm:gap-1.5 sm:rounded-2xl sm:px-3 sm:py-2"
                >
                  <span aria-hidden className="shrink-0 text-sm sm:text-base">
                    {pointEmoji(point.label)}
                  </span>
                  <span
                    lang={locale}
                    className={cn(
                      TEXT_WRAP,
                      'text-center font-semibold leading-tight hyphens-auto text-slate-700',
                      point.label.length >= 10 ? 'text-[11.5px] sm:text-[13px]' : 'text-[12px] sm:text-[13.5px]',
                    )}
                  >
                    {point.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {question ? (
          <div className="min-w-0 w-full rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 sm:p-5">
            <p className="mb-2 flex min-w-0 items-center gap-2 text-[16px] font-bold text-amber-900">
              <span aria-hidden>💬</span>
              <span className={TEXT_WRAP}>{t('detail.askChild')}</span>
            </p>
            <p className={cn('text-[15px] font-bold leading-relaxed text-slate-900 sm:text-[15.5px]', TEXT_WRAP)}>
              “{question}”
            </p>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => openModal(printable)}
        className="mt-5 flex min-h-16 w-full min-w-0 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-[16px] font-extrabold leading-snug tracking-wide text-white shadow-md transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg active:scale-[0.99] sm:px-6 sm:text-[17px]"
      >
        <Printer className="mr-2 h-5 w-5 shrink-0" />
        <span className={TEXT_WRAP}>{t('detail.printCta')}</span>
      </button>

      <div className="mt-3 grid min-w-0 grid-cols-2 gap-3">
        <div className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2.5 text-slate-700">
          <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="truncate text-[13px] font-semibold tracking-tight sm:text-[13.5px]">
            {t('detail.specFit', '표준 용지 맞춤')}
          </span>
        </div>
        <div className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2.5 text-slate-700">
          <svg className="h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="truncate text-[13px] font-semibold tracking-tight sm:text-[13.5px]">
            {t('detail.specQuality', '선명한 고화질 인쇄')}
          </span>
        </div>
      </div>
    </aside>
  )
}
