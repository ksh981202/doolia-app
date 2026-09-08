import { Lightbulb, Package, Palette, Printer, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoryPath } from '@/shared/config/catalog'
import { situationPath } from '@/shared/config/playSituations'
import { PLAY_SOLUTIONS, playRecipePath, type PlaySolution } from '@/shared/config/playSolutions'
import { cn } from '@/shared/lib/cn'

type CategoryTab = 'kids' | 'brain' | 'family'

const RECOMMEND_ITEMS = PLAY_SOLUTIONS.slice(0, 8)

const AGE_HUBS = [
  {
    id: '2-3',
    emoji: '🐣',
    title: '만 2~3세 (영아)',
    subtitle: '첫 시작 · 감각 자극 · 스킨십 눕방',
    tags: ['#첫색칠공부', '#기초선따기', '#쉬운오리기', '#감정모양'],
    cta: '만 2~3세 도안 모아보기',
    to: '/category?age=2-3',
  },
  {
    id: '4-5',
    emoji: '🧒',
    title: '만 4~5세 (유아)',
    subtitle: '상자 변신 · 역할극 · 손가락 힘',
    tags: ['#쉬운미로', '#숨은그림찾기', '#숫자쓰기', '#루틴차트'],
    cta: '만 4~5세 도안 모아보기',
    to: '/category?age=4-5',
  },
  {
    id: '6-7',
    emoji: '🧑',
    title: '만 6~7세+ (취학전)',
    subtitle: '자율 미션 · 1장 보드게임 · 사고력',
    tags: ['#복잡한미로', '#점잇기', '#알파벳쓰기', '#보드게임'],
    cta: '만 6~7세+ 도안 모아보기',
    to: '/category?age=6-7',
  },
] as const

const LIBRARY_TABS: {
  id: CategoryTab
  label: string
  activeClass: string
  hover: string
  cols: string
  items: { icon: string; title: string; count: string; slug: string }[]
}[] = [
  {
    id: 'kids',
    label: '🎨 기초 학습 & 창의 (Kids)',
    activeClass: 'bg-white text-emerald-800 shadow-sm',
    hover: 'hover:bg-emerald-50/50',
    cols: 'sm:grid-cols-4',
    items: [
      { icon: '🎨', title: '색칠공부', count: '200+ 개 도안', slug: 'coloring-pages' },
      { icon: '✏️', title: '선 긋기 연습', count: '48 개 도안', slug: 'tracing' },
      { icon: '🔤', title: '알파벳 & 숫자', count: '150+ 개 도안', slug: 'letters' },
      { icon: '✂️', title: '종이 오리기', count: '16 개 도안', slug: 'cutout' },
    ],
  },
  {
    id: 'brain',
    label: '🧩 두뇌 발달 & 사고력 (Brain)',
    activeClass: 'bg-white text-sky-700 shadow-sm',
    hover: 'hover:bg-sky-50/50',
    cols: 'sm:grid-cols-5',
    items: [
      { icon: '🔍', title: '숨은그림찾기', count: '36 개 도안', slug: 'ispy' },
      { icon: '👀', title: '다른그림찾기', count: '28 개 도안', slug: 'odd-one' },
      { icon: '🌀', title: '미로찾기', count: '95 개 도안', slug: 'maze' },
      { icon: '🔢', title: '점잇기', count: '65 개 도안', slug: 'dots' },
      { icon: '🌓', title: '그림자 맞추기', count: '24 개 도안', slug: 'shadow' },
    ],
  },
  {
    id: 'family',
    label: '💛 부모함께 & 생활습관 (Family)',
    activeClass: 'bg-white text-amber-700 shadow-sm',
    hover: 'hover:bg-amber-50/50',
    cols: 'sm:grid-cols-5',
    items: [
      { icon: '📋', title: '루틴 체크차트', count: '18 개 도안', slug: 'routine' },
      { icon: '😊', title: '감정 매칭카드', count: '20 개 도안', slug: 'emotion' },
      { icon: '🦊', title: '손가락인형', count: '16 개 도안', slug: 'puppets' },
      { icon: '🎲', title: '한장 보드게임', count: '12 개 도안', slug: 'board-game' },
      { icon: '🎉', title: '시즌 & 기념일', count: '130 개 도안', slug: 'season' },
    ],
  },
]

const WHY_DOOLIA = [
  {
    icon: '📦',
    title: '집 안 재료 그대로',
    desc: '택배 상자, 종이컵 등 주변의 친숙한 재료를 활용합니다.',
  },
  {
    icon: '💬',
    title: '쉬운 놀이 꿀팁 & 대화',
    desc: '어떻게 놀아줄지 막막할 때 바로 꺼내보는 대화 가이드.',
  },
  {
    icon: '✨',
    title: '간편하고 깔끔한 놀이',
    desc: '치우기 힘든 물기나 가루 없이 간결하게 즐기고 정리합니다.',
  },
  {
    icon: '⚡',
    title: '회원 가입 없는 즉시 인쇄',
    desc: '회원가입이나 복잡한 절차 없이 원하는 도안을 바로 출력합니다.',
  },
] as const

const HERO_STATS = [
  {
    icon: Printer,
    value: '500+',
    label: '무료 프린트 도안',
    hint: 'A4 초고화질 · 즉시 인쇄',
    iconClass: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: Sparkles,
    value: '5대',
    label: '상황별 맞춤 놀이',
    hint: '집콕 · 10분 · 외출 · 잠자리 · 기념일',
    iconClass: 'bg-teal-50 text-teal-700',
  },
  {
    icon: Package,
    value: '0원',
    label: '집 안 재료로 시작',
    hint: '회원가입 없이 바로 이용',
    iconClass: 'bg-amber-50 text-amber-700',
  },
] as const

export function PlayHubPage() {
  const navigate = useNavigate()
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryTab>('kids')
  const activeLibrary = LIBRARY_TABS.find((tab) => tab.id === activeCategoryTab) ?? LIBRARY_TABS[0]

  const openRecipe = (card: PlaySolution) => {
    navigate(playRecipePath(card.situation, card.id))
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <div className="border-b border-emerald-100/80 bg-emerald-50/90 px-4 py-2 text-center text-xs font-medium tracking-wide text-emerald-800 sm:text-sm">
        <span className="mr-1 text-amber-500">⭐</span>
        100% 영구 무료 · 회원가입 없음 · 집 안 0원 재료 · 초고화질 A4 즉시 인쇄
      </div>

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="relative mb-12 overflow-visible rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-amber-50/40 p-6 shadow-sm sm:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs sm:text-sm">
                <span>✨ DOOLIA PLAY TOOLBOX</span>
                <span className="text-emerald-400">|</span>
                <span>오늘 바로 시작하는 맞춤 놀이</span>
              </div>
              <h1 className="mb-3 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
                도안 1장 출력하고,
                <br />
                <span className="text-emerald-600">집 안 재료로 즉시 놀아요!</span>
              </h1>
              <p className="mb-6 text-sm font-medium text-slate-600 sm:text-base">
                비싼 교구 없이도 아이와 매일 웃을 수 있도록,
                <br />
                쉽고 재미있는 5대 상황별 놀이법과 500+종 프린트 도안을 제공합니다.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to={situationPath('home')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg sm:text-base"
                >
                  <Lightbulb className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  맞춤 놀이 도구함 열기 →
                </Link>
                <Link
                  to={categoryPath('coloring-pages')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300/90 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-xs transition-all hover:bg-slate-50 hover:shadow-md sm:text-base"
                >
                  <Palette className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  인기 도안 인쇄하기
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="flex h-full flex-col justify-center gap-3 py-2">
                {HERO_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3.5 rounded-2xl border border-emerald-100/80 bg-white/90 px-4 py-3.5 shadow-sm"
                  >
                    <span className={cn('shrink-0 rounded-xl p-2.5', stat.iconClass)}>
                      <stat.icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold text-slate-900">
                        {stat.value} {stat.label}
                      </p>
                      <p className="mt-0.5 text-[12px] font-medium text-slate-600 sm:text-[13px]">{stat.hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="play-toolbox" className="mx-auto max-w-6xl scroll-mt-24 bg-white px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">아이와 함께하는 행복한 놀이</h2>
            <span className="rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              8개
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate(situationPath('home'))}
            className="group flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition-colors hover:bg-emerald-50/50 hover:text-emerald-600 sm:text-sm"
          >
            <span>전체보기</span>
            <span className="font-semibold text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600">
              &gt;
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {RECOMMEND_ITEMS.map((card) => (
            <article
              key={card.id}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              onClick={() => openRecipe(card)}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <div>
                  <h3 className="min-h-[48px] text-base font-bold leading-snug text-slate-900 line-clamp-2 transition-colors group-hover:text-emerald-700 sm:text-lg">
                    {card.title}
                  </h3>
                  <div className="mb-4 mt-3.5 grid grid-cols-2 gap-2">
                    <span className="flex items-center justify-center gap-1 rounded-lg border border-amber-200/80 bg-amber-50 px-2.5 py-1.5 text-sm font-medium text-amber-900">
                      <span>👶</span>
                      <span>{card.age}</span>
                    </span>
                    <span className="flex items-center justify-center gap-1 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-900">
                      <span className="truncate">{card.situationLabel}</span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openRecipe(card)
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:bg-emerald-800"
                >
                  <span>👉</span>
                  <span>바로 확인하기</span>
                  <span className="text-emerald-200 transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="relative my-12 overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-amber-50/40 p-6 shadow-sm sm:p-10">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest text-emerald-600">
              WHY DOOLIA
            </span>
            <h2 className="text-2xl font-black leading-snug tracking-tight text-slate-900 sm:text-3xl">
              부모의 마음을 편하게 해주는 둘리아의 특별함
            </h2>
            <p className="mt-3 text-sm font-normal text-slate-600 sm:text-base">
              아이와의 놀이가 부담이나 스트레스가 되지 않도록 꼭 필요한 것만 담았습니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {WHY_DOOLIA.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-emerald-100/80 bg-white/90 p-5 shadow-sm"
              >
                <div className="mb-3.5 text-3xl">{item.icon}</div>
                <h3 className="mb-2 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="min-h-[2.875rem] text-sm font-normal leading-relaxed text-slate-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">👶 아이 연령별 맞춤 탐색</h2>
          <p className="mt-1 text-sm text-slate-500">우리 아이 발달 단계에 딱 맞는 단계별 도안을 골라보세요.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {AGE_HUBS.map((hub) => (
            <article
              key={hub.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xs transition-all duration-300 hover:border-emerald-200/80 hover:shadow-lg"
            >
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100/60 bg-emerald-50/80 text-2xl transition-transform group-hover:scale-110">
                  {hub.emoji}
                </div>
                <h3 className="mb-1 text-xl font-bold text-slate-900">{hub.title}</h3>
                <p className="mb-6 text-sm font-medium text-slate-600">{hub.subtitle}</p>
                <div className="mb-8 flex flex-wrap gap-2">
                  {hub.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={hub.to}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-xs transition-all hover:bg-emerald-700"
              >
                {hub.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="printable-library" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">📚 둘리아 무료 도안 라이브러리</h2>
          <p className="mt-1 text-sm font-medium text-slate-600">원하는 학습 영역별 고화질 도안을 자유롭게 인쇄하세요.</p>
          <div className="mt-6 inline-flex flex-wrap justify-center rounded-2xl bg-slate-200/70 p-1.5">
            {LIBRARY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryTab(tab.id)}
                className={cn(
                  'rounded-xl px-5 py-2.5 text-sm font-bold transition-all',
                  activeCategoryTab === tab.id ? tab.activeClass : 'text-slate-600 hover:text-slate-900',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {activeLibrary.items.map((item) => (
              <Link
                key={item.slug}
                to={categoryPath(item.slug)}
                className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-all duration-200 hover:border-emerald-100 hover:shadow-md sm:p-6"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-3xl transition-colors group-hover:bg-emerald-50">
                  {item.icon}
                </div>
                <h4 className="text-[15px] font-bold text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-base">{item.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="premium-bundle" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-8 pb-16">
        <div className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white shadow-xl sm:p-12 md:flex-row">
          <div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
              DOOLIA PREMIUM BUNDLE
            </span>
            <h3 className="mb-2 mt-3 text-2xl font-extrabold sm:text-4xl">
              500종 이상의 프리미엄 도안을
              <br />
              단 $4.99에 모두 받으세요!
            </h3>
            <p className="max-w-xl text-sm text-slate-300">
              광고 없이 초고화질 무손실 PDF로 한 번에 내려받는 올인원 패키지입니다. 인쇄 무제한 라이선스가 포함됩니다.
            </p>
          </div>
          <Link
            to="/premium"
            className="whitespace-nowrap rounded-2xl bg-emerald-500 px-8 py-4 text-base font-black text-slate-950 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/20"
          >
            MEGA 패키지 살펴보기 →
          </Link>
        </div>
      </section>
    </div>
  )
}

export default PlayHubPage
