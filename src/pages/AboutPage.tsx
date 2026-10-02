import { useTranslation } from 'react-i18next'

const CONTACT_EMAIL = 'k981202@naver.com'

export function AboutPage() {
  const { i18n } = useTranslation()
  const isKo = (i18n.language || i18n.resolvedLanguage || '').startsWith('ko')

  return (
    <div className="bg-white text-slate-800">
      <section className="mx-auto max-w-4xl px-2 pb-16 pt-12 text-center sm:pb-24 sm:pt-20">
        <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-emerald-600 sm:text-sm">
          {isKo ? '둘리아 소개' : 'ABOUT DOOLIA'}
        </span>
        <h1 className="text-4xl font-light leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          The Art of <br />
          <span className="font-serif font-normal italic text-emerald-700">Pure Imagination</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base font-normal leading-relaxed text-slate-500 sm:mt-8 sm:text-lg">
          {isKo ? (
            <>
              순수한 상상이 시작되는 곳.
              <br className="hidden sm:inline" />
              아이의 작은 손끝에서 피어나는 무한한 세계를 조용히 응원합니다.
            </>
          ) : (
            <>
              Where pure imagination begins.
              <br className="hidden sm:inline" />
              Nurturing the boundless worlds unfolding at your child&apos;s fingertips.
            </>
          )}
        </p>
      </section>

      <div className="mx-auto w-full max-w-5xl border-t border-slate-100" />

      <section className="mx-auto max-w-5xl space-y-24 px-2 py-20 sm:space-y-36 sm:px-4 sm:py-28">
        <div className="grid items-center gap-10 md:grid-cols-2 sm:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm">
            <img
              src="/images/about/about-story1.webp"
              alt="Creative Art"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative">
            <span className="absolute -top-12 -left-4 -z-10 select-none text-7xl font-black text-slate-100 sm:text-8xl">
              01
            </span>
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">CREATIVE PLAY & ART</div>
            <h2 className="mb-4 text-2xl font-light tracking-tight text-slate-900 sm:text-3xl">Freedom beyond Lines</h2>
            <p className="break-keep text-[15px] font-light leading-relaxed text-slate-600 sm:text-[16px]">
              {isKo
                ? '둘리아의 도안은 단순한 밑그림이 아닙니다. 정답이 정해지지 않은 열린 세계 속에서 아이가 스스로 색을 선택하고 자신만의 이야기를 완성해 나가는 창의적 자유를 지향합니다.'
                : 'DOOLIA printables are more than simple outlines. In an open-ended world with no right or wrong answers, we empower children to freely choose colors and shape their own creative narratives.'}
            </p>
          </div>
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2 sm:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm md:order-2">
            <img
              src="/images/about/about-story3.webp"
              alt="Parent and Child"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative md:order-1">
            <span className="absolute -top-12 -left-4 -z-10 select-none text-7xl font-black text-slate-100 sm:text-8xl">
              02
            </span>
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">EMOTIONAL CONNECTION</div>
            <h2 className="mb-4 text-2xl font-light tracking-tight text-slate-900 sm:text-3xl">Dialogue in Colors</h2>
            <p className="break-keep text-[15px] font-light leading-relaxed text-slate-600 sm:text-[16px]">
              {isKo
                ? '색칠놀이는 몰입의 시간이자 가장 따뜻한 대화의 시간입니다. 도안 속 1분 상상 대화 질문을 통해 부모와 아이가 눈을 맞추고 교감하는 특별한 순간을 선물합니다.'
                : 'Coloring is both a peaceful focus and a heartwarming conversation. Through our curated conversational prompts, we offer precious moments for parents and children to connect and share stories.'}
            </p>
          </div>
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2 sm:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm">
            <img
              src="/images/about/about-story2.webp"
              alt="Quality Printables"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative">
            <span className="absolute -top-12 -left-4 -z-10 select-none text-7xl font-black text-slate-100 sm:text-8xl">
              03
            </span>
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">THOUGHTFUL DESIGN</div>
            <h2 className="mb-4 text-2xl font-light tracking-tight text-slate-900 sm:text-3xl">Crafted for Little Hands</h2>
            <p className="break-keep text-[15px] font-light leading-relaxed text-slate-600 sm:text-[16px]">
              {isKo
                ? '발달 단계별 선 굵기 최적화, 300 DPI 초고화질 A4/Letter 인쇄 최적화, 롤러 잘림 없는 15% 안전 여백까지. 오직 아이들의 편안한 창작 몰입만을 위해 정교하게 설계합니다.'
                : 'Age-tailored line thickness, crystal-clear 300 DPI high resolution, and 15% safe printing margins. Every single page is meticulously crafted for the comfort of little artists.'}
            </p>
          </div>
        </div>
      </section>

      <section className="relative left-1/2 w-screen -translate-x-1/2 border-t border-slate-100 bg-slate-50 px-4 py-20 text-center">
        <h3 className="text-lg font-light tracking-wide text-slate-900 sm:text-xl">Contact DOOLIA</h3>
        <p className="mt-2 text-sm font-light text-slate-500">
          {isKo
            ? '둘리아와 함께하는 창의적인 여정에 대한 문의는 언제든 편하게 남겨주세요.'
            : 'We would love to hear from parents, educators, and creators worldwide.'}
        </p>
        <div className="mt-4">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-sm font-medium text-emerald-600 underline underline-offset-4 transition-colors hover:text-emerald-700"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
