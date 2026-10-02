import { type FormEvent, type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'

const CONTACT_EMAIL = 'contact@doolia.app'

export function LegalPage({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link to="/" className="text-sm font-bold text-brand">
        ← 홈으로
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted sm:text-base">{children}</div>
    </article>
  )
}

const FAQS = [
  {
    q: '도안은 정말 무료인가요?',
    a: '핵심 도안은 회원가입 없이 무료로 인쇄할 수 있습니다. 선택형 프리미엄 묶음은 광고 없이 대량 PDF를 받을 때 이용합니다.',
  },
  {
    q: '상업적으로 써도 되나요?',
    a: '가정과 교실의 비상업적 인쇄만 허용됩니다. 판매용 교재, 유료 클래스 교재 대량 배포는 별도 협의가 필요합니다.',
  },
  {
    q: '광고가 보이는 이유는 무엇인가요?',
    a: '무료 도안 운영을 위해 Google AdSense 등 광고가 표시될 수 있습니다. 자세한 내용은 개인정보처리방침을 참고하세요.',
  },
  {
    q: '오류나 도안 제안은 어디로 보내나요?',
    a: `${CONTACT_EMAIL} 로 보내 주시면 영업일 기준 2일 이내에 답변드립니다.`,
  },
]

export function ContactPage() {
  const [sent, setSent] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    const subject = encodeURIComponent(`[DOOLIA 문의] ${name || '방문자'}`)
    const body = encodeURIComponent(`이름: ${name}\n이메일: ${email}\n\n${message}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <LegalPage title="문의하기">
      <p>
        제휴, 도안 제안, 오류 신고, 개인정보 문의는{' '}
        <a className="font-bold text-emerald-700" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        로 보내 주세요. 아래 양식을 작성하면 기본 메일 앱이 열립니다.
      </p>

      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-emerald-100 bg-white p-5">
        <label className="block text-sm font-bold text-ink">
          이름
          <input
            name="name"
            required
            className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium text-ink outline-none focus:border-emerald-400"
          />
        </label>
        <label className="block text-sm font-bold text-ink">
          이메일
          <input
            name="email"
            type="email"
            required
            className="mt-1 h-11 w-full rounded-xl border border-line px-3 font-medium text-ink outline-none focus:border-emerald-400"
          />
        </label>
        <label className="block text-sm font-bold text-ink">
          문의 내용
          <textarea
            name="message"
            required
            rows={5}
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 font-medium text-ink outline-none focus:border-emerald-400"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white hover:bg-emerald-700"
        >
          이메일로 보내기
        </button>
        {sent ? <p className="text-sm font-bold text-emerald-700">메일 앱이 열리지 않으면 {CONTACT_EMAIL} 로 직접 보내 주세요.</p> : null}
      </form>

      <h2 className="pt-4 font-display text-xl font-semibold text-ink">자주 묻는 질문</h2>
      <div className="space-y-3">
        {FAQS.map((item) => (
          <div key={item.q} className="rounded-2xl border border-line bg-white p-4">
            <p className="font-extrabold text-ink">{item.q}</p>
            <p className="mt-1">{item.a}</p>
          </div>
        ))}
      </div>
    </LegalPage>
  )
}

export function PremiumPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link to="/" className="text-sm font-bold text-brand">
        ← 홈으로
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold">MEGA 묶음집 $4.99</h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        500종 이상의 프리미엄 도안을 광고 없이 한 번에 받을 수 있는 상품입니다. Stripe / PayPal 결제
        연동을 준비 중이며, 버튼은 결제 플로우 연결을 위한 자리입니다.
      </p>
      <button
        type="button"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-6 text-sm font-extrabold text-white"
      >
        Stripe / PayPal로 결제하기
      </button>
    </article>
  )
}
