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
import { useBookmarkStore } from '@/shared/store/useBookmarkStore'
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

function isCjkLocale(locale: string) {
  return /^(ko|ja|zh)/i.test(locale)
}

export function InfoSection({ printable }: { printable: Printable }) {
  const { t, i18n } = useTranslation()
  const openModal = useDownloadStore((state) => state.openModal)
  const bookmarked = useBookmarkStore((state) => state.ids.includes(printable.id))
  const locale = i18n.language || i18n.resolvedLanguage || 'ko'
  const title = detailTitle(printable, locale)
  const age = detailAgeLabel(printable, locale)
  const category = t(`categories.${printable.category}`, '키즈 색칠도안')
  const note = printableIntro(printable, locale)
  const question = printableQuestion(printable, locale)
  const points = brainDevelopmentPoints(printable, locale)
  const likesCount = bookmarked ? 4 : 3
  const viewsCount = printable.views || 17
  const titleBreak = isCjkLocale(locale) ? 'break-keep' : 'break-words'

  return (
    <aside>
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
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
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

      <div className="space-y-3">
        {note ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
            <p className="mb-2 flex items-center gap-2 text-[16px] font-bold text-emerald-700">
              <span aria-hidden>🧚</span>
              <span>DOOLIA'S NOTE</span>
            </p>
            <p className={cn('text-[15px] font-medium leading-relaxed text-slate-700 sm:text-[15.5px]', titleBreak)}>
              “{note}”
            </p>
          </div>
        ) : null}

        {points.length ? (
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 sm:p-5">
            <p className="mb-3 flex items-center gap-2 text-[16px] font-bold text-slate-800">
              <span aria-hidden>🎨</span>
              <span>{t('detail.benefitsHeader')}</span>
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
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
                      'min-w-0 text-center font-semibold leading-tight break-words hyphens-auto text-slate-700',
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
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 sm:p-5">
            <p className="mb-2 flex items-center gap-2 text-[16px] font-bold text-amber-900">
              <span aria-hidden>💬</span>
              <span>{t('detail.askChild')}</span>
            </p>
            <p className={cn('text-[15px] font-bold leading-relaxed text-slate-900 sm:text-[15.5px]', titleBreak)}>
              “{question}”
            </p>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => openModal(printable)}
        className="mt-5 flex min-h-16 w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-[16px] font-extrabold leading-snug tracking-wide text-white shadow-md transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg active:scale-[0.99] sm:px-6 sm:text-[17px]"
      >
        <Printer className="mr-2 h-5 w-5 shrink-0" />
        {t('detail.printCta')}
      </button>

      <div className="mt-2.5 flex items-center justify-between gap-1 rounded-xl border border-slate-100 bg-slate-50/90 px-3.5 py-2.5 text-[12px] font-medium text-slate-600 sm:text-[13px]">
        <div className="flex min-w-0 items-center gap-1.5">
          <span>📄</span>
          <span className="leading-snug">{t('detail.specFit')}</span>
        </div>
        <span className="text-slate-200">|</span>
        <div className="flex min-w-0 items-center gap-1.5">
          <span>🖨️</span>
          <span className="leading-snug">{t('detail.specInk')}</span>
        </div>
        <span className="text-slate-200">|</span>
        <div className="flex min-w-0 items-center gap-1.5">
          <span>⚡</span>
          <span className="leading-snug">{t('detail.specHd')}</span>
        </div>
      </div>
    </aside>
  )
}
