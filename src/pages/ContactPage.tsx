import { type FormEvent, useState } from 'react'
import {
  submitGeneralInquiry,
  validateGeneralInquiry,
  type InquiryType,
} from '@/services/generalInquiryService'

const HERO_IMAGE = '/images/about/about-story1.webp'
const HERO_FALLBACK = '/affiliate/affiliate_01_crayons.webp'

const FIELD_CLASS =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800 placeholder:text-slate-400 text-sm'

const INQUIRY_TYPES: Record<
  Exclude<InquiryType, 'other'>,
  { emoji: string; label: string; placeholder: string }
> = {
  suggestion: {
    emoji: '🎨',
    label: '도안 제안',
    placeholder: '아이들이 좋아하는 캐릭터, 동물, 탈것 등 원하시는 도안 아이디어를 자유롭게 적어주세요!',
  },
  partnership: {
    emoji: '🤝',
    label: '제휴 문의',
    placeholder:
      '기업/기관명, 제휴 목적, 협업 제안 내용을 상세히 남겨주시면 담당자가 신속히 검토 후 회신드립니다.',
  },
  bug: {
    emoji: '🛠️',
    label: '오류 신고',
    placeholder: '오류가 발생한 페이지 주소나 현상을 알려주시면 빠르게 확인하여 수정하겠습니다.',
  },
}

const CHIP_ORDER: Array<Exclude<InquiryType, 'other'>> = ['suggestion', 'partnership', 'bug']

export function ContactPage() {
  const [selectedType, setSelectedType] = useState<Exclude<InquiryType, 'other'>>('suggestion')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const current = INQUIRY_TYPES[selectedType]

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
      setError(invalid)
      return
    }
    setBusy(true)
    setError('')
    try {
      await submitGeneralInquiry(input)
      setSent(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '접수에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-8 sm:py-12">
      <section className="mb-8 rounded-3xl border border-emerald-100/60 bg-gradient-to-b from-emerald-50/70 via-white to-white p-5 text-center sm:p-8">
        <img
          src={HERO_IMAGE}
          alt="아이가 그림을 그리는 따뜻한 순간"
          className="mb-5 h-44 w-full rounded-2xl object-cover shadow-inner sm:h-52"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = HERO_FALLBACK
          }}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-700 shadow-xs">
          💌 둘리아 소통 창구
        </span>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          둘리아에게 들려주고 싶은 이야기가 있나요?
        </h1>
        <p className="mx-auto mt-2 max-w-lg break-keep text-sm text-slate-600 sm:text-base">
          도안 제안, 제휴 및 협업, 이용 중 불편한 점 등 어떤 이야기든 따뜻하게 귀 기울이겠습니다.
        </p>

        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-2"
          role="radiogroup"
          aria-label="문의 유형"
        >
          {CHIP_ORDER.map((type) => {
            const item = INQUIRY_TYPES[type]
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
                <span aria-hidden="true">{item.emoji}</span>
                {item.label}
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
            <p className="mt-3 text-lg font-extrabold text-emerald-900">이야기를 잘 받았어요</p>
            <p className="mt-2 break-keep text-sm leading-relaxed text-emerald-800">
              소중한 마음을 소중히 읽고, 영업일 기준 2일 이내에 메일로 답해 드릴게요.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="contact-name" className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-700">
                이름
              </label>
              <input
                id="contact-name"
                name="name"
                required
                autoComplete="name"
                placeholder="예: 김둘리"
                className={FIELD_CLASS}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="contact-email" className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-700">
                이메일
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={FIELD_CLASS}
              />
            </div>

            <div className="mt-4">
              <p className="mb-1.5 text-sm font-bold text-slate-700">문의 유형</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
                <span aria-hidden="true">{current.emoji}</span>
                {current.label}
              </span>
            </div>

            <div className="mt-4">
              <label htmlFor="contact-message" className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-700">
                문의 내용
              </label>
              <textarea
                id="contact-message"
                name="content"
                rows={6}
                placeholder={current.placeholder}
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
              {busy ? '보내는 중...' : '💌 이야기 보내기'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}

export default ContactPage
