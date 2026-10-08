import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  submitGeneralInquiry,
  validateGeneralInquiry,
  type InquiryType,
} from '@/services/generalInquiryService'

const HERO_IMAGE = '/images/about/about-story1.webp'
const HERO_FALLBACK = '/affiliate/affiliate_01_crayons.webp'

const FIELD_CLASS =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800 placeholder:text-slate-400 text-sm'

const CHIP_ORDER: Array<Exclude<InquiryType, 'other'>> = ['suggestion', 'partnership', 'bug']

export function ContactPage() {
  const { t } = useTranslation()
  const [selectedType, setSelectedType] = useState<Exclude<InquiryType, 'other'>>('suggestion')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const data = new FormData(event.currentTarget)
    const input = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      type: selectedType,
      content: String(data.get('content') ?? ''),
    }
    const invalid = validateGeneralInquiry(input)
    if (invalid) {
      setError(t(invalid))
      return
    }
    setBusy(true)
    setError('')
    try {
      await submitGeneralInquiry(input)
      setSent(true)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'contact.error_submit'
      setError(t(message.startsWith('contact.') ? message : 'contact.error_submit'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-8 sm:py-12">
      <section className="mb-8 rounded-3xl border border-emerald-100/60 bg-gradient-to-b from-emerald-50/70 via-white to-white p-5 text-center sm:p-8">
        <img
          src={HERO_IMAGE}
          alt={t('contact.title')}
          className="mb-5 h-44 w-full rounded-2xl object-cover shadow-inner sm:h-52"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = HERO_FALLBACK
          }}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-700 shadow-xs">
          {t('contact.badge')}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          {t('contact.title')}
        </h1>
        <p className="mx-auto mt-2 max-w-lg break-keep text-sm text-slate-600 sm:text-base">
          {t('contact.subtitle')}
        </p>

        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-2"
          role="radiogroup"
          aria-label={t('contact.label_type')}
        >
          {CHIP_ORDER.map((type) => {
            const selected = selectedType === type
            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSelectedType(type)}
                className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm transition-all ${
                  selected
                    ? 'bg-emerald-600 font-bold text-white shadow-sm ring-2 ring-emerald-600/30'
                    : 'bg-slate-100 font-medium text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t(`contact.type_${type}`)}
              </button>
            )
          })}
        </div>
      </section>

      <form
        noValidate
        onSubmit={submit}
        className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
      >
        <input type="hidden" name="type" value={selectedType} />

        {sent ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-5 py-8 text-center">
            <p className="text-2xl" aria-hidden="true">
              💌
            </p>
            <p className="mt-3 text-lg font-extrabold text-emerald-900">{t('contact.success_title')}</p>
            <p className="mt-2 break-keep text-sm leading-relaxed text-emerald-800">{t('contact.success_desc')}</p>
            <Link
              to="/"
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              {t('contact.btn_back_home')}
            </Link>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="contact-name" className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-700">
                {t('contact.label_name')}
              </label>
              <input
                id="contact-name"
                name="name"
                required
                autoComplete="name"
                placeholder={t('contact.placeholder_name')}
                className={FIELD_CLASS}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="contact-email" className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-700">
                {t('contact.label_email')}
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t('contact.placeholder_email')}
                className={FIELD_CLASS}
              />
            </div>

            <div className="mt-4">
              <p className="mb-1.5 text-sm font-bold text-slate-700">{t('contact.label_type')}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
                {t(`contact.type_${selectedType}`)}
              </span>
            </div>

            <div className="mt-4">
              <label htmlFor="contact-message" className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-700">
                {t('contact.label_content')}
              </label>
              <textarea
                id="contact-message"
                name="content"
                rows={6}
                placeholder={t(`contact.placeholder_${selectedType}`)}
                className={`${FIELD_CLASS} min-h-[140px] resize-y`}
              />
            </div>

            {error ? (
              <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-center text-sm font-bold text-rose-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 disabled:translate-y-0 disabled:opacity-60"
            >
              {busy ? t('contact.btn_submitting') : t('contact.btn_submit')}
            </button>
          </>
        )}
      </form>
    </div>
  )
}

export default ContactPage
