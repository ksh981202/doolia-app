import { type FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { usePrintableQuery, usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import {
  submitCopyrightReport,
  validateCopyrightReport,
  type ReportType,
} from '@/services/copyrightReportService'
import { printablePath } from '@/shared/config/catalog'
import { detailTitle } from '@/shared/lib/detailCopy'
import { getDisplayImageUrl } from '@/shared/utils/printableAssets'

const TYPES: ReportType[] = ['copyright', 'modification', 'other']
const ETHICS_BANNER_SRC = '/images/about/about-story1.webp'
const ETHICS_BANNER_FALLBACK = '/affiliate/affiliate_01_crayons.webp'
const ETHICS_CARDS = [
  {
    emoji: '🎨',
    titleKey: 'report.ethicsOriginTitle',
    titleFallback: '순수한 AI 창작 도안',
    bodyKey: 'report.ethicsOriginBody',
    bodyFallback: '아이들의 열린 사고를 위해 100% 독창적인 순수 창작 도안을 안전하게 설계합니다.',
  },
  {
    emoji: '🛡️',
    titleKey: 'report.ethicsRespectTitle',
    titleFallback: '저작권 존중 및 사전 사과',
    bodyKey: 'report.ethicsRespectBody',
    bodyFallback: '철저히 검수하나 유사성이나 권리 침해 소지가 있다면 정중히 사과드립니다.',
  },
  {
    emoji: '⚡',
    titleKey: 'report.ethicsActionTitle',
    titleFallback: '신속한 비공개 조치 약속',
    bodyKey: 'report.ethicsActionBody',
    bodyFallback: '신고 접수 즉시 담당자가 확인하여 도안 비공개/삭제를 가장 빠르게 처리합니다.',
  },
] as const

const FIELD_CLASS =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'

export function CopyrightReportPage() {
  const { t, i18n } = useTranslation()
  const [params] = useSearchParams()
  const slugOrId = (params.get('slug') || params.get('printableId') || '').trim()
  const queried = usePrintableQuery(slugOrId || undefined)
  const catalog = usePrintablesQuery()

  const printable = useMemo(() => {
    if (!slugOrId) return undefined
    return (
      queried.data ||
      catalog.data?.find((item) => item.slug === slugOrId || item.id === slugOrId)
    )
  }, [slugOrId, queried.data, catalog.data])

  const locale = i18n.language || i18n.resolvedLanguage || 'ko'
  const targetTitle = printable ? detailTitle(printable, locale) : ''
  const targetThumb = printable
    ? getDisplayImageUrl(
        printable.image_color_url ||
          printable.image_bw_url ||
          printable.line_art_url ||
          printable.color_image_url ||
          '',
        240,
      )
    : ''

  const [email, setEmail] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [goodFaithAgreed, setGoodFaithAgreed] = useState(false)
  const [reportType, setReportType] = useState<ReportType>('copyright')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const pageUrl =
      printable
        ? `${window.location.origin}${printablePath(printable.slug || printable.id)}`
        : window.location.href
    const input = {
      printableId: printable?.id || '',
      printableSlug: printable?.slug || slugOrId,
      printableTitle: targetTitle,
      pageUrl,
      reporterName,
      reporterEmail: email,
      goodFaithAgreed,
      reportType,
      content,
    }
    const invalid = validateCopyrightReport(input)
    if (invalid) {
      setError(invalid)
      return
    }
    setBusy(true)
    setError('')
    try {
      await submitCopyrightReport(input)
      setSent(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('report.fail', '접수에 실패했습니다. 잠시 후 다시 시도해 주세요.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="py-8">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 sm:gap-8 lg:grid-cols-12">
        <aside className="flex h-full flex-col justify-between rounded-3xl border border-emerald-100/80 bg-emerald-50/40 p-6 sm:p-7 lg:col-span-5">
          <div>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xs">
              <img
                src={ETHICS_BANNER_SRC}
                alt={t('report.ethicsBannerAlt', 'DOOLIA Children Creative Art')}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null
                  event.currentTarget.src = ETHICS_BANNER_FALLBACK
                }}
              />
            </div>
            <p className="mt-4 text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
              {t('report.ethicsKicker', 'DOOLIA ETHICS & RESPECT')}
            </p>
            <h1 className="mt-4 mb-5 text-lg leading-snug font-extrabold whitespace-pre-line text-slate-900 sm:text-xl">
              {t('report.ethicsTitle', '아이들의 상상력을 응원하며,\n창작자의 권리를 깊이 존중합니다.')}
            </h1>
            <div>
              {ETHICS_CARDS.map((card) => (
                <div
                  key={card.titleKey}
                  className="mb-3 rounded-2xl border border-emerald-100/60 bg-white p-4 shadow-xs last:mb-0 sm:p-4.5"
                >
                  <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-800 sm:text-[16px]">
                    <span className="shrink-0 leading-none" aria-hidden="true">
                      {card.emoji}
                    </span>
                    {t(card.titleKey, card.titleFallback)}
                  </h2>
                  <p className="mt-1 pl-6 text-[13px] leading-relaxed text-slate-600 sm:text-[13.5px]">
                    {t(card.bodyKey, card.bodyFallback)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="pt-3 text-xs font-semibold text-emerald-800 sm:text-sm">
            <span aria-hidden="true">🍃 </span>
            {t('report.ethicsFooter', 'DOOLIA는 건강하고 깨끗한 창작 환경을 약속합니다.')}
          </p>
        </aside>

        <section className="flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
          {sent ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
                ✓
              </div>
              <h2 className="mt-4 text-xl font-extrabold text-slate-800">접수가 완료되었습니다.</h2>
              <p className="mx-auto mt-2 max-w-sm break-keep text-sm leading-relaxed text-slate-600">
                관리자가 신속히 검토 후 조치하겠습니다.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex min-h-[44px] items-center rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                홈으로 돌아가기
              </Link>
            </div>
          ) : (
            <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-1 flex-col justify-between gap-4">
              <div className="space-y-4">
              <div>
                <span className="block text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                  DOOLIA CARE
                </span>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-800 sm:text-2xl">
                  {t('report.title', '저작권 · 도안 문의 및 신고')}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('report.subtitle', '접수하신 내용은 관리자가 직접 확인 후 가장 빠르게 도와드립니다.')}
                </p>
              </div>

              {printable ? (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
                  <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {targetThumb ? (
                      <img src={targetThumb} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold tracking-wide text-emerald-700">
                      {t('report.target', '대상 도안')}
                    </p>
                    <p className="truncate text-sm font-bold text-slate-800">{targetTitle}</p>
                    {printable.slug ? (
                      <p className="text-[12px] font-medium text-slate-400">{printable.slug}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div>
                <label htmlFor="report-name" className="mb-1.5 block text-sm font-bold text-slate-700">
                  {t('report.name', '신고자 / 기업명')}
                </label>
                <input
                  id="report-name"
                  type="text"
                  value={reporterName}
                  onChange={(event) => setReporterName(event.target.value)}
                  placeholder={t('report.namePlaceholder', '성함 또는 저작권자(단체)명을 입력하세요')}
                  className={FIELD_CLASS}
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="report-email" className="mb-1.5 block text-sm font-bold text-slate-700">
                  {t('report.email', '회신 이메일')}
                </label>
                <input
                  id="report-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className={FIELD_CLASS}
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="report-type" className="mb-1.5 block text-sm font-bold text-slate-700">
                  {t('report.type', '문의 유형')}
                </label>
                <select
                  id="report-type"
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value as ReportType)}
                  className={`${FIELD_CLASS} bg-white`}
                >
                  {TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`report.types.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="report-content" className="mb-1.5 block text-sm font-bold text-slate-700">
                  {t('report.content', '문의 내용')}
                </label>
                <textarea
                  id="report-content"
                  rows={8}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={t(
                    'report.contentPlaceholder',
                    '소명 사유나 원본 저작물 정보, 필요하신 조치 내용을 자세히 적어주세요.',
                  )}
                  className={`${FIELD_CLASS} min-h-[180px] resize-y`}
                />
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                <input
                  id="confirm-statement"
                  type="checkbox"
                  checked={goodFaithAgreed}
                  onChange={(event) => setGoodFaithAgreed(event.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded text-emerald-600"
                />
                <label htmlFor="confirm-statement" className="cursor-pointer text-[12.5px] leading-relaxed text-slate-600 select-none">
                  {t(
                    'report.goodFaith',
                    '본인은 정당한 권리자이거나 권리자를 대리하며, 작성한 내용이 사실임을 확인합니다.',
                  )}
                </label>
              </div>

              {error ? (
                <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-center text-sm font-bold text-rose-700">
                  {error}
                </p>
              ) : null}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-emerald-600 py-3.5 text-base font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy ? t('report.sending', '접수 처리 중...') : '🛡️ 문의 및 신고 접수하기'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

export default CopyrightReportPage
