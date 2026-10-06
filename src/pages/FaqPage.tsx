import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const FAQ_ITEMS = [
  { titleKey: 'faq.q1_title' as const, descKey: 'faq.q1_desc' as const },
  { titleKey: 'faq.q2_title' as const, descKey: 'faq.q2_desc' as const },
  { titleKey: 'faq.q3_title' as const, descKey: 'faq.q3_desc' as const },
]

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-emerald-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FaqPage() {
  const { t, i18n } = useTranslation()
  const baseId = useId()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    const previous = document.title
    document.title = `${t('faq.title')} | DOOLIA`
    return () => {
      document.title = previous
    }
  }, [t, i18n.language])

  return (
    <div className="mx-auto max-w-3xl py-8 sm:py-12">
      <section className="mb-8 rounded-3xl border border-emerald-100/60 bg-gradient-to-b from-emerald-50/70 via-white to-white p-5 text-center sm:p-8">
        <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-3 py-1 text-[12px] font-extrabold text-emerald-800 sm:text-[13px]">
          💡 {t('faq.badge')}
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{t('faq.title')}</h1>
        <p className="mx-auto mt-2 max-w-lg break-keep text-sm leading-relaxed text-slate-600 sm:text-base">
          {t('faq.subtitle')}
        </p>
      </section>

      <div className="space-y-3">
        {[...FAQ_ITEMS, { titleKey: 'faq.q4_title' as const, descKey: null }].map((item, index) => {
          const open = openIndex === index
          const panelId = `${baseId}-panel-${index}`
          const buttonId = `${baseId}-button-${index}`
          const title = t(item.titleKey)
          return (
            <div key={item.titleKey} className="overflow-hidden rounded-2xl border border-emerald-100/80 bg-white shadow-xs">
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex min-h-[44px] w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
              >
                <span className="min-w-0 text-[15px] font-bold leading-snug text-slate-800 sm:text-[16px]">{title}</span>
                <Chevron open={open} />
              </button>
              {open ? (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="border-t border-emerald-50 px-4 pb-4 pt-3 sm:px-5"
                >
                  <p className="break-keep text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
                    {item.descKey ? (
                      t(item.descKey)
                    ) : (
                      <>
                        {t('faq.q4_desc_prefix')}
                        <Link
                          to="/contact"
                          className="font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                        >
                          {t('faq.q4_desc_link')}
                        </Link>
                        {t('faq.q4_desc_suffix')}
                      </>
                    )}
                  </p>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <section className="mt-8 rounded-3xl border border-emerald-100/80 bg-emerald-50/60 p-5 text-center sm:p-7">
        <p className="break-keep text-[15px] font-bold text-slate-800 sm:text-base">{t('faq.need_help')}</p>
        <Link
          to="/contact"
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700"
        >
          {t('faq.btn_contact')}
        </Link>
      </section>
    </div>
  )
}

export default FaqPage
