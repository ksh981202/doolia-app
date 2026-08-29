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

export function AboutPage() {
  return (
    <LegalPage title="둘리아(DOOLIA) 소개">
      <p>
        DOOLIA는 아이와 부모의 성장을 돕는 A4 놀이 교육 가이드 미디어입니다. 고화질 무료 프린트 도안과
        짧은 육아·놀이 팁을 함께 제공해, 가정과 교실에서 바로 쓸 수 있는 하루 10분 놀이를 만듭니다.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">비전</h2>
      <p>
        우리는 ‘더 많은 콘텐츠’보다 ‘지금 우리 아이에게 맞는 한 장’을 고르는 경험을 중요하게 생각합니다.
        연령, 주제, 놀이 유형을 기준으로 도안을 찾고, 색칠·미로·선따기·루틴 차트를 통해 소근육, 집중력,
        감정 조절, 생활 습관을 자연스럽게 연결합니다.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">무엇을 하나요</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>가정·교실용 A4 무료 프린트 도안 (색칠, 두뇌 놀이, 루틴/습관)</li>
        <li>부모를 위한 육아·놀이 팁 칼럼과 실행 요약</li>
        <li>광고 없는 고화질 PDF를 한 번에 받는 프리미엄 묶음(선택)</li>
      </ul>
      <p>
        문의는 <a className="font-bold text-emerald-700" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> 로
        보내 주세요.
      </p>
    </LegalPage>
  )
}

export function PrivacyPage() {
  return (
    <LegalPage title="개인정보처리방침">
      <p>시행일: 2026년 8월 1일. 본 방침은 DOOLIA Printables(이하 “회사”)가 운영하는 웹사이트에 적용됩니다.</p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">1. 수집하는 정보</h2>
      <p>
        회사는 회원가입 없이 핵심 도안을 제공할 수 있도록, 서비스 제공에 필요한 최소한의 정보만 처리합니다.
        문의 시 이용자가 자발적으로 제공하는 이름, 이메일, 문의 내용이 포함될 수 있습니다. 다운로드 통계는
        개인을 식별하지 않는 익명 집계로 사용됩니다.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">2. 쿠키 및 유사 기술</h2>
      <p>
        사이트는 언어 설정, 북마크, 이용 편의 기능을 위해 브라우저 저장소 또는 쿠키를 사용할 수 있습니다.
        브라우저 설정에서 쿠키를 거부할 수 있으나, 일부 기능이 제한될 수 있습니다.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">3. 구글 애드센스 및 광고 쿠키</h2>
      <p>
        회사는 서비스 운영을 위해 Google AdSense 등 제3자 광고 서비스를 사용할 수 있습니다. Google을 포함한
        제3자는 쿠키를 사용해 이용자의 사이트 방문 정보와 다른 인터넷 사이트 방문 정보를 기반으로 광고를
        게재할 수 있습니다. 이용자는{' '}
        <a className="font-bold text-emerald-700 underline" href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">
          Google 광고 설정
        </a>
        에서 맞춤 광고를 옵트아웃할 수 있으며, 쿠키 사용에 관한 상세 내용은{' '}
        <a className="font-bold text-emerald-700 underline" href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
          Google 광고 기술 정책
        </a>
        을 참고하세요.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">4. 아동의 개인정보</h2>
      <p>
        본 사이트는 부모와 교사를 주 이용자로 하며, 아동에게 직접 개인정보를 요구하지 않습니다. 만 14세
        미만 아동의 개인정보가 수집된 사실을 알게 되면 지체 없이 삭제합니다.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">5. 보관 및 파기</h2>
      <p>
        문의 이메일은 답변 목적 범위에서 합리적인 기간 동안 보관한 뒤 파기합니다. 법령에 따라 보존이 필요한
        경우 해당 기간 동안 보관합니다.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">6. 문의</h2>
      <p>
        개인정보 관련 문의: <a className="font-bold text-emerald-700" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </LegalPage>
  )
}

export function TermsPage() {
  return (
    <LegalPage title="이용약관">
      <p>본 약관은 DOOLIA Printables 웹사이트 및 콘텐츠 이용에 적용됩니다.</p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">1. 콘텐츠 이용</h2>
      <p>
        무료 도안과 육아·놀이 팁은 가정 및 교실의 비상업적 인쇄·열람 용도로 제공됩니다. 상업적 재판매,
        무단 재배포, 워터마크 제거, 콘텐츠를 마치 자신의 창작물인 것처럼 게시하는 행위는 허용되지 않습니다.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">2. 지적재산권</h2>
      <p>
        사이트에 게시된 도안, 문구, 칼럼, 상표, 디자인의 권리는 회사 또는 정당한 권리자에게 있습니다.
        이용자는 개인적·교육적 목적의 인쇄를 넘어 2차적 저작물을 만들어 배포할 수 없습니다.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">3. 프리미엄 상품</h2>
      <p>
        프리미엄 묶음집 결제는 Stripe / PayPal 등 결제 수단 연동 후 별도 안내가 적용됩니다. 디지털 콘텐츠
        특성상 다운로드가 시작된 이후의 환불은 관련 법령이 허용하는 범위로 제한될 수 있습니다.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">4. 면책</h2>
      <p>
        육아·놀이 팁은 일반적인 교육 정보이며 의료·발달 진단 또는 개별 상담을 대체하지 않습니다. 사이트
        이용 중 발생한 간접 손해에 대해 회사는 법령이 허용하는 한도에서 책임을 제한합니다.
      </p>
      <h2 className="pt-2 font-display text-xl font-semibold text-ink">5. 문의</h2>
      <p>
        약관 문의: <a className="font-bold text-emerald-700" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </LegalPage>
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
