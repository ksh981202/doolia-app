import { useTranslation } from 'react-i18next'

const PRIVACY_EMAIL = 'k981202@naver.com'

export function PrivacyPage() {
  const { i18n } = useTranslation()
  const isKo = (i18n.language || i18n.resolvedLanguage || '').startsWith('ko')

  return (
    <div className="px-0 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-10 md:p-14">
        {isKo ? <PrivacyKorean /> : <PrivacyEnglish />}
      </div>
    </div>
  )
}

function PrivacyKorean() {
  return (
    <article className="prose prose-slate max-w-none leading-relaxed text-slate-700">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          DOOLIA PRIVACY
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">개인정보처리방침</h1>
        <p className="mt-2 text-sm text-slate-400">시행일자: 2026년 10월 2일</p>
      </div>

      <section className="space-y-8 text-[15px]">
        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제1조 (개인정보의 처리 목적)</h2>
          <p className="text-slate-600">
            둘리아(이하 &quot;회사&quot;)는 회원가입 없이 누구나 자유롭게 이용할 수 있는 개방형 색칠도안
            플랫폼을 제공합니다. 회사는 서비스 개선 및 시스템 보안을 위한 최소한의 익명화된 기술 정보만을
            자동으로 수집하며, 이용자를 직접 특정할 수 있는 민감한 개인정보(이름, 이메일, 전화번호 등)는
            일절 수집하지 않습니다.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-bold text-emerald-950">제2조 (아동 개인정보 보호 - COPPA / GDPR 준수)</h2>
          <p className="text-sm text-slate-700">
            회사는 유아 및 어린이를 위한 교육 콘텐츠를 제공함에 있어 글로벌 아동 온라인 사생활 보호법(COPPA)
            및 유럽 일반 데이터 보호 규정(GDPR)을 철저히 준수합니다. 회사는 만 13세 미만(유럽의 경우 만 16세
            미만) 아동의 어떠한 개인 식별 정보도 의도적으로 수집, 요구하거나 제3자에게 공유하지 않습니다.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제3조 (수집하는 정보 및 저장 방식)</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-600">
            <li>
              <strong>수집하지 않는 항목:</strong> 회원가입이 없으므로 이름, 이메일, 비밀번호, 주소, 연락처
              등 일체의 개인 식별 정보를 수집하지 않습니다.
            </li>
            <li>
              <strong>로컬 스토리지 저장 (서버 수집 X):</strong> 이용자가 누른 &apos;좋아요&apos; 및
              &apos;컬렉션&apos; 정보는 회사 서버로 전송되지 않고 이용자 본인의 단말기(브라우저 로컬
              저장소)에만 안전하게 보관됩니다.
            </li>
            <li>
              <strong>자동 수집 항목:</strong> 서비스 보안 및 접속 통계 분석을 위해 서비스 이용 기록, 접속
              로그, 익명 접속 IP, 기기 및 브라우저 정보가 자동으로 생성되어 수집될 수 있습니다.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제4조 (개인정보의 처리위탁 및 국외이전)</h2>
          <p className="mb-3 text-slate-600">
            회사는 글로벌 콘텐츠 전송 및 시스템 인프라의 안정성을 위해 아래의 전문 클라우드 서비스에 데이터를
            위탁하고 있으며, 해당 인프라는 글로벌 서버에 안전하게 보관됩니다.
          </p>
          <div className="grid gap-3 text-xs sm:grid-cols-2 sm:text-sm">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Cloudflare, Inc.</h3>
              <p className="mt-1 text-slate-500">업무: 이미지 호스팅(R2) 및 글로벌 CDN 전송 보안</p>
              <p className="mt-0.5 text-slate-400">이전 국가: 글로벌 엣지 네트워크</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Supabase, Inc.</h3>
              <p className="mt-1 text-slate-500">업무: 시스템 데이터베이스 및 클라우드 인프라 운영</p>
              <p className="mt-0.5 text-slate-400">이전 국가: 미국, 싱가포르 등 글로벌 리전</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제5조 (쿠키 및 광고 게재 안내)</h2>
          <p className="text-slate-600">
            회사는 무료 서비스 운영을 위해 제3자 광고 사업자(Google AdSense 등)의 광고를 게재할 수 있습니다.
            이 과정에서 광고 사업자는 사용자의 웹사이트 방문 기록에 기반한 맞춤형 광고를 제공하기 위해
            쿠키(Cookie)를 활용할 수 있으며, 사용자는 언제든지 브라우저 설정을 통해 쿠키 저장을 거부할 수
            있습니다.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제6조 (개인정보 보호책임자 및 문의처)</h2>
          <p className="text-slate-600">
            서비스 이용 중 발생하는 개인정보 보호 관련 문의 및 건의사항은 아래의 책임자에게 문의해 주시면
            신속하게 답변해 드리겠습니다.
          </p>
          <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-sm">
            <p className="font-bold text-slate-800">개인정보 보호책임자 (CPO)</p>
            <p className="mt-1 text-slate-600">직책: DOOLIA 개인정보 보호팀</p>
            <p className="text-slate-600">
              이메일:{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="font-medium text-emerald-600 underline">
                {PRIVACY_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </section>

      <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
        부칙: 본 개인정보처리방침은 2026년 10월 2일부터 시행됩니다.
      </div>
    </article>
  )
}

function PrivacyEnglish() {
  return (
    <article className="prose prose-slate max-w-none leading-relaxed text-slate-700">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          DOOLIA PRIVACY
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-400">Effective Date: October 2, 2026 (Official Legal Version)</p>
      </div>

      <section className="space-y-8 text-[15px]">
        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">1. Overview & Purpose</h2>
          <p className="text-slate-600">
            DOOLIA (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;) operates an open, registration-free
            printable coloring platform (doolia.com). We respect your privacy and only collect minimal,
            anonymized technical telemetry required for system security, caching, and performance
            optimization. We do not collect personally identifiable information (PII) such as names,
            passwords, or personal email addresses.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-bold text-emerald-950">
            2. Children&apos;s Privacy Compliance (COPPA & GDPR-K)
          </h2>
          <p className="text-sm text-slate-700">
            Protecting the privacy of children is of paramount importance. In strict compliance with the
            U.S. Children&apos;s Online Privacy Protection Act (COPPA) and the EU General Data Protection
            Regulation (GDPR-K), we do not knowingly solicit, collect, or store personal data from children
            under the age of 13 (or under 16 in certain EU jurisdictions).
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">3. Data Collection and Local Storage</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-600">
            <li>
              <strong>No PII Collection:</strong> No account creation is required to use our services;
              therefore, no personal profiles or identities are stored on our servers.
            </li>
            <li>
              <strong>Local Browser Storage:</strong> User preferences such as &apos;Liked&apos; designs are
              stored solely within your device&apos;s local browser storage (LocalStorage) and are never
              transmitted to our remote servers.
            </li>
            <li>
              <strong>Automated Technical Logs:</strong> Anonymized server logs, browser types, device
              categories, and approximate diagnostic IP addresses may be processed temporarily for traffic
              distribution and cybersecurity defenses.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">4. Third-Party Infrastructure & Data Processors</h2>
          <p className="mb-3 text-slate-600">
            To ensure reliable, ultra-fast global delivery of our printable coloring files, we utilize
            world-class infrastructure providers:
          </p>
          <div className="grid gap-3 text-xs sm:grid-cols-2 sm:text-sm">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Cloudflare, Inc.</h3>
              <p className="mt-1 text-slate-500">Role: Global CDN delivery and image storage (R2)</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Supabase, Inc.</h3>
              <p className="mt-1 text-slate-500">Role: Content catalog database & cloud hosting</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">5. Cookies & Third-Party Advertising</h2>
          <p className="text-slate-600">
            We may partner with third-party advertising vendors (such as Google AdSense) to display ads
            supporting our free service. These vendors may use standard browser cookies to serve relevant ads
            based on previous web visits. You can manage or disable cookie preferences at any time through
            your browser settings.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">6. Privacy Inquiries & Contact</h2>
          <p className="text-slate-600">
            If you have any questions or feedback regarding our Privacy Policy or data protection practices,
            please contact our Data Protection Officer:
          </p>
          <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-sm">
            <p className="font-bold text-slate-800">DOOLIA Privacy Team</p>
            <p className="mt-1 text-slate-600">
              Email:{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="font-medium text-emerald-600 underline">
                {PRIVACY_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </section>

      <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
        Supplementary: This Privacy Policy is effective as of October 2, 2026.
      </div>
    </article>
  )
}

export default PrivacyPage
