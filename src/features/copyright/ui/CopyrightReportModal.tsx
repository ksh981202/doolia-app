import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  submitCopyrightReport,
  validateCopyrightReport,
  type ReportType,
} from '@/services/copyrightReportService'
import { useCopyrightReportStore } from '@/shared/store/useCopyrightReportStore'

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

export function CopyrightReportModal() {
  const { t } = useTranslation()
  const { isOpen, context, closeReport } = useCopyrightReportStore()
  const [email, setEmail] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [goodFaithAgreed, setGoodFaithAgreed] = useState(false)
  const [reportType, setReportType] = useState<ReportType>('copyright')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setEmail('')
    setReporterName('')
    setGoodFaithAgreed(false)
    setReportType('copyright')
    setContent('')
    setError('')
    setSent(false)
    setBusy(false)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeReport()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeReport])

  if (!isOpen || !context) return null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!goodFaithAgreed || busy) return
    const input = {
      printableId: context.printableId,
      printableSlug: context.printableSlug,
      printableTitle: context.printableTitle,
      pageUrl: context.pageUrl,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-4">
      <button type="button" className="absolute inset-0" aria-label={t('report.close', '닫기')} onClick={closeReport} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="copyright-report-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-y-auto rounded-3xl border border-slate-100 bg-white shadow-2xl md:flex-row md:overflow-hidden"
      >
        <button
          type="button"
          onClick={closeReport}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
          aria-label={t('report.close', '닫기')}
        >
          ✕
        </button>

        <aside className="flex shrink-0 flex-col justify-between overflow-y-auto border-b border-emerald-100/90 bg-emerald-50/70 p-5 sm:p-6 md:min-h-0 md:w-[45%] md:shrink md:border-r md:border-b-0">
          <div className="space-y-3.5">
            <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xs">
              <img
                src={ETHICS_BANNER_SRC}
                alt={t('report.ethicsBannerAlt', 'DOOLIA Children Creative Art')}
                className="h-full w-full object-cover"
                onError={(event) => {
                  if (event.currentTarget.src.includes('affiliate_01_crayons')) return
                  event.currentTarget.src = ETHICS_BANNER_FALLBACK
                }}
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-900/60 via-transparent to-transparent p-3">
                <span className="text-[12px] font-bold tracking-tight text-white drop-shadow-xs">
                  {t('report.ethicsBanner', 'The Art of Pure Imagination')}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                {t('report.ethicsKicker', 'DOOLIA ETHICS & RESPECT')}
              </span>
              <h3
                id="copyright-report-title"
                className="mt-0.5 text-[17px] font-bold leading-snug tracking-tight whitespace-pre-line text-slate-900 sm:text-[18px]"
              >
                {t('report.ethicsTitle', '아이들의 상상력을 응원하며,\n창작자의 권리를 깊이 존중합니다.')}
              </h3>
            </div>

            <div className="space-y-2">
              {ETHICS_CARDS.map((card) => (
                <div
                  key={card.titleKey}
                  className="flex items-start gap-3 rounded-2xl border border-emerald-100/80 bg-white/95 p-3.5 shadow-2xs"
                >
                  <span className="mt-0.5 shrink-0 text-[17px] leading-none">{card.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13.5px] font-bold leading-snug tracking-tight text-slate-800 sm:text-[14px]">
                      {t(card.titleKey, card.titleFallback)}
                    </h4>
                    <p className="mt-0.5 text-[12px] leading-normal tracking-tight text-slate-600 sm:text-[12.5px]">
                      {t(card.bodyKey, card.bodyFallback)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 border-t border-emerald-200/60 pt-3 text-[11.5px] font-semibold text-emerald-800">
            <span>🌿</span>
            <span>{t('report.ethicsFooter', 'DOOLIA는 건강하고 깨끗한 창작 환경을 약속합니다.')}</span>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto p-5 sm:p-7 md:w-[55%]">
          {sent ? (
            <div className="my-auto space-y-3 py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
                ✓
              </div>
              <h3 className="text-[19px] font-bold text-slate-800">
                {t('report.thanks', '문의 및 신고가 정상 접수되었습니다')}
              </h3>
              <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-slate-500">
                {t(
                  'report.thanksHint',
                  '작성해 주신 내용을 담당자가 확인 후, 남겨주신 이메일({{email}})로 신속히 답변 및 조치 결과를 안내해 드리겠습니다.',
                  { email },
                )}
              </p>
              <button
                type="button"
                onClick={closeReport}
                className="mt-4 rounded-xl bg-slate-800 px-6 py-2.5 text-[13.5px] font-bold text-white transition-all hover:bg-slate-900"
              >
                {t('report.close', '닫기')}
              </button>
            </div>
          ) : (
            <form onSubmit={(event) => void submit(event)} className="space-y-3.5">
              <div className="pr-10">
                <span className="block text-[11px] font-bold tracking-wider text-emerald-700 uppercase">DOOLIA CARE</span>
                <h2 className="text-[18px] font-bold tracking-tight text-slate-900 sm:text-[19px]">
                  {t('report.title', '저작권 · 도안 문의 및 신고')}
                </h2>
                <p className="mt-0.5 text-[12px] text-slate-400">
                  {t('report.subtitle', '접수하신 내용은 관리자가 직접 확인 후 가장 빠르게 도와드립니다.')}
                </p>
              </div>

              {context.printableTitle ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5">
                  <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {t('report.target', '대상 도안')}
                  </span>
                  <span className="truncate text-[13px] font-bold text-slate-800">
                    {context.printableTitle}
                    {context.printableSlug ? (
                      <span className="font-medium text-slate-400"> ({context.printableSlug})</span>
                    ) : null}
                  </span>
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-[12.5px] font-bold text-slate-700">
                  {t('report.name', '신고자 / 기업명')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={(event) => setReporterName(event.target.value)}
                  placeholder={t('report.namePlaceholder', '성함 또는 저작권자(단체)명을 입력하세요')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 py-2 text-[13px] transition-colors outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[12.5px] font-bold text-slate-700">
                  {t('report.email', '회신 이메일')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 py-2 text-[13px] transition-colors outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[12.5px] font-bold text-slate-700">
                  {t('report.type', '문의 유형')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value as ReportType)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] transition-colors outline-none focus:border-emerald-500"
                >
                  {TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`report.types.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[12.5px] font-bold text-slate-700">
                  {t('report.content', '문의 내용')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={t(
                    'report.contentPlaceholder',
                    '소명 사유나 원본 저작물 정보, 필요하신 조치 내용을 자세히 적어주세요.',
                  )}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 py-2 text-[13px] transition-colors outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
                <input
                  id="confirm-statement"
                  type="checkbox"
                  required
                  checked={goodFaithAgreed}
                  onChange={(event) => setGoodFaithAgreed(event.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded text-emerald-600"
                />
                <label htmlFor="confirm-statement" className="cursor-pointer text-[11.5px] leading-tight text-slate-600 select-none">
                  {t(
                    'report.goodFaith',
                    '본인은 정당한 권리자이거나 권리자를 대리하며, 작성한 내용이 사실임을 확인합니다.',
                  )}
                </label>
              </div>

              {error ? <p className="text-[13px] font-bold text-rose-600">{error}</p> : null}

              <button
                type="submit"
                disabled={busy || !goodFaithAgreed}
                className="w-full rounded-xl bg-emerald-600 py-3 text-[14.5px] font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {busy ? t('report.sending', '접수 처리 중...') : t('report.submit', '문의 및 신고 접수하기')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
