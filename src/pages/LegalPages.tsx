import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

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
