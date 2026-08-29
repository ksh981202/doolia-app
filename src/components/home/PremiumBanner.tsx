import { Link } from 'react-router-dom'

export function PremiumBanner() {
  return (
    <section className="bg-white py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(120deg,#6d28d9_0%,#4f46e5_48%,#2563eb_100%)] px-6 py-10 text-white sm:px-10 sm:py-12">
          <p className="text-sm font-extrabold tracking-wide text-indigo-100">DOOLIA PREMIUM BUNDLE</p>
          <h2 className="mt-3 max-w-2xl font-display text-2xl font-semibold leading-snug sm:text-4xl">
            500종 이상의 프리미엄 도안을 단 $4.99에 모두 받으세요!
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
            광고 없이 고화질 PDF를 한 번에 내려받는 MEGA 묶음집입니다. Stripe / PayPal 결제를 곧
            연결합니다.
          </p>
          <Link
            to="/premium"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-extrabold text-indigo-700 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-xl"
          >
            MEGA 묶음집 구매하기
          </Link>
        </div>
      </div>
    </section>
  )
}
