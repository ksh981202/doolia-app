import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const CONTACT_EMAIL = 'k981202@naver.com'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="bg-white text-slate-800">
      <section className="mx-auto max-w-4xl px-2 pb-16 pt-12 text-center sm:pb-24 sm:pt-20">
        <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-emerald-600 sm:text-sm">
          {t('about.badge', { defaultValue: '둘리아 소개' })}
        </span>
        <h1 className="text-4xl font-light leading-tight tracking-tight break-words text-slate-900 sm:text-5xl md:text-6xl">
          {t('about.hero_title_1', { defaultValue: 'The Art of' })}{' '}
          <br />
          <span className="font-serif font-normal italic text-emerald-700">
            {t('about.hero_title_2', { defaultValue: 'Pure Imagination' })}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl whitespace-pre-line break-words text-base font-normal leading-relaxed text-slate-500 sm:mt-8 sm:text-lg">
          {t('about.hero_desc', {
            defaultValue:
              '순수한 상상이 시작되는 곳.\n아이의 작은 손끝에서 피어나는 무한한 세계를 조용히 응원합니다.',
          })}
        </p>
      </section>

      <div className="mx-auto w-full max-w-5xl border-t border-slate-100" />

      <section className="mx-auto max-w-5xl space-y-24 px-2 py-20 sm:space-y-36 sm:px-4 sm:py-28">
        <div className="grid items-center gap-10 sm:gap-16 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm">
            <img
              src="/images/about/about-story1.webp"
              alt={t('about.section1_title', { defaultValue: 'Freedom beyond Lines' })}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative min-w-0">
            <span className="absolute -top-12 -left-4 -z-10 select-none text-7xl font-black text-slate-100 sm:text-8xl">
              01
            </span>
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
              {t('about.section1_kicker', { defaultValue: 'CREATIVE PLAY & ART' })}
            </div>
            <h2 className="mb-4 text-2xl font-light tracking-tight break-words text-slate-900 sm:text-3xl">
              {t('about.section1_title', { defaultValue: 'Freedom beyond Lines' })}
            </h2>
            <p className="break-words text-[15px] font-light leading-relaxed text-slate-600 sm:text-[16px]">
              {t('about.section1_desc', {
                defaultValue:
                  '둘리아의 도안은 단순한 밑그림이 아닙니다. 정답이 정해지지 않은 열린 세계 속에서 아이가 스스로 색을 선택하고 자신만의 이야기를 완성해 나가는 창의적 자유를 지향합니다.',
              })}
            </p>
          </div>
        </div>

        <div className="grid items-center gap-10 sm:gap-16 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm md:order-2">
            <img
              src="/images/about/about-story3.webp"
              alt={t('about.section2_title', { defaultValue: 'Dialogue in Colors' })}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative min-w-0 md:order-1">
            <span className="absolute -top-12 -left-4 -z-10 select-none text-7xl font-black text-slate-100 sm:text-8xl">
              02
            </span>
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
              {t('about.section2_kicker', { defaultValue: 'EMOTIONAL CONNECTION' })}
            </div>
            <h2 className="mb-4 text-2xl font-light tracking-tight break-words text-slate-900 sm:text-3xl">
              {t('about.section2_title', { defaultValue: 'Dialogue in Colors' })}
            </h2>
            <p className="break-words text-[15px] font-light leading-relaxed text-slate-600 sm:text-[16px]">
              {t('about.section2_desc', {
                defaultValue:
                  '색칠놀이는 몰입의 시간이자 가장 따뜻한 대화의 시간입니다. 도안 속 1분 상상 질문을 통해 부모와 아이가 눈을 맞추고 교감하는 특별한 순간을 선물합니다.',
              })}
            </p>
          </div>
        </div>

        <div className="grid items-center gap-10 sm:gap-16 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm">
            <img
              src="/images/about/about-story2.webp"
              alt={t('about.section3_title', { defaultValue: 'Crafted for Little Hands' })}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative min-w-0">
            <span className="absolute -top-12 -left-4 -z-10 select-none text-7xl font-black text-slate-100 sm:text-8xl">
              03
            </span>
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
              {t('about.section3_kicker', { defaultValue: 'THOUGHTFUL DESIGN' })}
            </div>
            <h2 className="mb-4 text-2xl font-light tracking-tight break-words text-slate-900 sm:text-3xl">
              {t('about.section3_title', { defaultValue: 'Crafted for Little Hands' })}
            </h2>
            <p className="break-words text-[15px] font-light leading-relaxed text-slate-600 sm:text-[16px]">
              {t('about.section3_desc', {
                defaultValue:
                  '발달 단계별 선 굵기 최적화, 300 DPI 초고화질 A4/Letter 인쇄 최적화, 롤러 잘림 없는 15% 안전 여백까지. 오직 아이들의 편안한 창작 몰입만을 위해 정교하게 설계합니다.',
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden border-t border-slate-100 bg-slate-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-lg rounded-3xl border border-emerald-100/80 bg-gradient-to-b from-emerald-50/70 to-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[26px] shadow-sm ring-1 ring-slate-100 sm:h-16 sm:w-16 sm:text-[28px]">
            💌
          </div>
          <h3 className="text-xl font-bold tracking-tight break-words text-slate-900 sm:text-2xl">
            {t('about.contact_title', { defaultValue: 'Contact DOOLIA' })}
          </h3>
          <p className="mx-auto mt-3 max-w-md break-words text-[14.5px] leading-relaxed text-slate-500 sm:mt-4 sm:text-[15.5px]">
            {t('about.contact_desc', {
              defaultValue:
                '도안 제안, 제휴 마케팅, 서비스 문의 등 둘리아와 함께하는 창의적인 여정에 대한 의견을 언제든 남겨주세요.',
            })}
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-[15px] font-bold break-words text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99] sm:mt-7 sm:w-auto sm:px-8 sm:text-[16px]"
          >
            {t('about.contact_btn', { defaultValue: '✉️ 1:1 온라인 문의 남기기' })}
          </Link>
          <p className="mt-4 break-words text-xs text-slate-400 sm:text-[13px]">
            {t('about.contact_email_label', { defaultValue: '직접 이메일 발송:' })}{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-slate-500 underline-offset-2 transition-colors hover:text-emerald-700 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
