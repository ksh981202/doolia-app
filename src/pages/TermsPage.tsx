import { useTranslation } from 'react-i18next'

export function TermsPage() {
  const { i18n } = useTranslation()
  const isKo = (i18n.language || i18n.resolvedLanguage || '').startsWith('ko')

  return (
    <div className="px-0 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-10 md:p-14">
        {isKo ? <TermsKorean /> : <TermsEnglish />}
      </div>
    </div>
  )
}

function TermsKorean() {
  return (
    <article className="prose prose-slate max-w-none leading-relaxed text-slate-700">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          DOOLIA LEGAL
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">서비스 이용약관</h1>
        <p className="mt-2 text-sm text-slate-400">시행일자: 2026년 10월 2일</p>
      </div>

      <section className="space-y-8 text-[15px]">
        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제1조 (목적)</h2>
          <p className="text-slate-600">
            본 약관은 둘리아(이하 &quot;회사&quot;)가 운영하는 둘리아 웹사이트(doolia.com) 및 관련 제반
            서비스(이하 &quot;서비스&quot;)를 이용함에 있어, 회사와 이용자 간의 권리·의무 및 책임사항, 서비스
            이용 조건과 절차 등 기본적인 사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제2조 (용어의 정의)</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
            <li>
              <strong>&quot;서비스&quot;</strong>란 접속 기기(PC, 스마트폰, 태블릿 등)와 무관하게 이용자가
              이용할 수 있는 둘리아의 색칠도안 뷰어, 고화질(A4) PDF 인쇄 및 다운로드, 카테고리 검색, 육아 및
              발달 코칭 정보 제공 등 제반 서비스를 의미합니다.
            </li>
            <li>
              <strong>&quot;이용자&quot;</strong>란 별도의 회원가입 절차 없이 서비스에 접속하여 본 약관에
              동의하고 회사가 제공하는 무료 콘텐츠 및 서비스를 이용하는 고객(비회원)을 말합니다.
            </li>
            <li>
              <strong>&quot;콘텐츠&quot;</strong>란 회사가 서비스 내에서 제공하는 색칠도안(흑백 선화 및 컬러
              가이드), PDF 파일, 이미지, 텍스트, 아동 상상 질문, 두뇌 발달 포인트 등 일체의 저작물을
              의미합니다.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제3조 (약관의 효력 및 변경)</h2>
          <ol className="list-decimal space-y-1.5 pl-5 text-slate-600">
            <li>회사는 본 약관의 내용을 이용자가 쉽게 확인할 수 있도록 서비스 하단(Footer)에 항상 게시합니다.</li>
            <li>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
            <li>약관이 개정될 경우 회사는 적용일자 및 개정 사유를 명시하여 적용일 7일 전부터 서비스 내에 공지합니다.</li>
          </ol>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-bold text-emerald-950">제4조 (서비스의 제공 및 무료 인쇄 라이선스)</h2>
          <p className="mb-3 text-slate-700">
            회사는 모든 이용자에게 색칠도안 검색, 온라인 미리보기, 고화질 PDF 무료 인쇄 및 다운로드 서비스를
            제공합니다.
          </p>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-emerald-900">✅ 허용되는 이용 범위 (Personal & Educational Use)</h3>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                이용자는 가정 내 색칠놀이 및 홈스쿨링, 그리고 유치원·어린이집·초등학교·돌봄교실·병원·도서관 등
                비영리 교육 및 보육 기관의 수업 목적으로 자유롭게 무료 인쇄·이용할 수 있습니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-800">⛔ 금지되는 행위 (Commercial Use Prohibited)</h3>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                도안을 유료로 판매하거나 출판물(도서, 교재, 굿즈 등)로 상업 제작하는 행위, 타 웹사이트나 SNS에
                무단 재배포하는 행위, 크롤러/봇을 이용한 무단 대량 수집 행위는 엄격히 금지됩니다.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제5조 (저작권 및 지식재산권의 귀속)</h2>
          <ol className="list-decimal space-y-1.5 pl-5 text-slate-600">
            <li>
              회사가 서비스 내에 게시한 모든 도안, 이미지, 텍스트, 디자인, 로고, UI/UX에 관한 저작권과
              지식재산권은 회사에 전속합니다.
            </li>
            <li>서비스 내 모든 도안은 순수 창작물로서 저작권법 및 관련 국제조약에 의해 안전하게 보호됩니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제6조 (광고 게재 및 제휴)</h2>
          <p className="text-slate-600">
            회사는 서비스의 100% 무료 운영을 지원하기 위해 서비스 화면 내에 제3자의 온라인 광고(Google AdSense
            등) 및 관련 제휴 링크를 게재할 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제7조 (면책 조항)</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
            <li>
              서비스에서 제공하는 발달 가이드는 창의 놀이를 돕는 보조 정보이며, 전문적인 의학적·교육적 결과를
              절대적으로 보증하지 않습니다.
            </li>
            <li>회사는 천재지변, 서버 점검 등 불가항력적 사유로 인한 일시적 서비스 중단에 대해 책임을 지지 않습니다.</li>
            <li>
              서비스의 소셜 데이터(&apos;좋아요&apos; 등)는 브라우저 로컬 스토리지에 저장되며, 기기 변경이나
              캐시 삭제로 인한 유실은 책임지지 않습니다.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">제8조 (준거법 및 재판관할)</h2>
          <p className="text-slate-600">
            본 약관의 해석 및 분쟁에 관하여는 국제사법 및 법률의 저촉 원칙과 관계없이{' '}
            <strong>대한민국 법률(Laws of the Republic of Korea)</strong>을 준거법으로 적용하며, 발생한 법적
            분쟁은 회사의 본점 소재지를 관할하는 대한민국 법원을 전속 관할법원으로 합니다.
          </p>
        </div>
      </section>

      <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
        부칙: 본 약관은 2026년 10월 2일부터 시행됩니다.
      </div>
    </article>
  )
}

function TermsEnglish() {
  return (
    <article className="prose prose-slate max-w-none leading-relaxed text-slate-700">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          DOOLIA LEGAL
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-400">Effective Date: October 2, 2026 (Official Legal Version)</p>
      </div>

      <section className="space-y-8 text-[15px]">
        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">Article 1 (Purpose)</h2>
          <p className="text-slate-600">
            These Terms of Service (&quot;Terms&quot;) govern the access and use of the DOOLIA website
            (doolia.com) and related services (&quot;Services&quot;) operated by DOOLIA (&quot;Company&quot;),
            setting forth the rights, duties, and responsibilities between the Company and users.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">Article 2 (Definitions)</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
            <li>
              <strong>&quot;Services&quot;</strong> refers to all online coloring viewers, high-resolution
              A4/Letter PDF printing and downloading services, theme navigation, and child development guides
              provided across desktop and mobile devices.
            </li>
            <li>
              <strong>&quot;User&quot;</strong> refers to any visitor who accesses the website and uses the
              free content provided by the Company without registration.
            </li>
            <li>
              <strong>&quot;Content&quot;</strong> refers to all coloring pages (black-and-white line art and
              color guides), PDF files, illustrations, texts, imaginative questions, and developmental points
              provided through the Services.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-bold text-emerald-950">Article 3 (License and Permitted Use)</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-emerald-900">✅ Permitted Personal & Educational Use</h3>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Users are granted a free, non-exclusive license to print, copy, and use the printable coloring
                pages solely for non-commercial personal home use, homeschooling, and non-profit
                educational/childcare activities (e.g., kindergartens, elementary schools, libraries,
                hospitals).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-800">⛔ Prohibited Commercial Exploitation</h3>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Users shall not sell, license, publish, or include DOOLIA content in any commercial products
                (printed books, eBooks, digital bundles, merchandise) or redistribute them on other websites,
                blogs, or file-sharing networks without prior written permission.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">Article 4 (Intellectual Property Rights)</h2>
          <p className="text-slate-600">
            All copyrights, trademarks, service marks, and database rights in and to the Services and Content
            (including illustrations, graphics, texts, branding, and UI designs) are and remain the exclusive
            property of the Company and are protected by applicable intellectual property laws and
            international treaties.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">Article 5 (Third-Party Advertising)</h2>
          <p className="text-slate-600">
            The Company may display third-party advertisements (such as Google AdSense) and affiliate links to
            support the free operation of the Services. Interactions or transactions with third-party
            advertisers are solely between the User and the advertiser.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">Article 6 (Disclaimer of Warranties)</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
            <li>
              The Services and Content are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;
              basis without warranties of any kind.
            </li>
            <li>
              Child development tips and parent conversational prompts are provided for creative and
              inspirational purposes only and do not constitute professional medical, psychological, or
              educational advice.
            </li>
            <li>
              The Company assumes no liability for service interruptions caused by force majeure events or
              local device storage data loss.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">Article 7 (Governing Law and Jurisdiction)</h2>
          <p className="text-slate-600">
            These Terms and any dispute arising out of or related to them shall be governed by and construed
            in accordance with the <strong>laws of the Republic of Korea</strong>, without giving effect to
            any principles of conflicts of law. Any legal proceeding shall be instituted exclusively in the
            competent court located in the jurisdiction of the Company&apos;s headquarters in the Republic of
            Korea.
          </p>
        </div>
      </section>

      <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
        Supplementary: These Terms of Service are effective as of October 2, 2026.
      </div>
    </article>
  )
}

export default TermsPage
