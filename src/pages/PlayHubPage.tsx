import { Menu, Settings, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { matchesQuery } from '@/services/printableService'
import { categoryPath } from '@/shared/config/catalog'
import { SITUATION_ITEMS, isSituationId, type SituationId } from '@/shared/config/playSituations'
import { PLAY_SOLUTIONS, type PlaySolution } from '@/shared/config/playSolutions'
import { cn } from '@/shared/lib/cn'
import { useDownloadStore } from '@/shared/store/useDownloadStore'
import type { Printable } from '@/types/printable'

type SituationFilter = 'all' | SituationId
type CategoryTab = 'kids' | 'brain' | 'family'

const FILTER_TABS: { id: SituationFilter; label: string }[] = [
  { id: 'all', label: '★ 전체보기' },
  ...SITUATION_ITEMS.map((item) => ({
    id: item.id,
    label: `${item.emoji} ${item.title}`,
  })),
]

const AGE_HUBS = [
  {
    id: '2-3',
    emoji: '🐣',
    title: '만 2~3세 (영아)',
    subtitle: '첫 시작 · 감각 자극 · 스킨십 눕방',
    tags: ['#첫색칠공부', '#기초선따기', '#쉬운오리기', '#감정모양'],
    cta: '만 2~3세 도안 모아보기',
    card: 'border-emerald-100',
    icon: 'bg-emerald-100',
    to: '/category?age=2-3',
  },
  {
    id: '4-5',
    emoji: '🧒',
    title: '만 4~5세 (유아)',
    subtitle: '상자 변신 · 역할극 · 손가락 힘',
    tags: ['#쉬운미로', '#숨은그림찾기', '#숫자쓰기', '#루틴차트'],
    cta: '만 4~5세 도안 모아보기',
    card: 'border-sky-100',
    icon: 'bg-sky-100',
    to: '/category?age=4-5',
  },
  {
    id: '6-7',
    emoji: '🧑',
    title: '만 6~7세+ (취학전)',
    subtitle: '자율 미션 · 1장 보드게임 · 사고력',
    tags: ['#복잡한미로', '#점잇기', '#알파벳쓰기', '#보드게임'],
    cta: '만 6~7세+ 도안 모아보기',
    card: 'border-purple-100',
    icon: 'bg-purple-100',
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

const TRUST_PROMISES = [
  {
    icon: '📦',
    title: '0원 집 안 재료',
    desc: '택배 상자, 휴지심, 테이프 등 집안 소품만 활용합니다.',
  },
  {
    icon: '💬',
    title: '1초 실전 대본',
    desc: '고민 없이 그대로 읽기만 하면 아이가 빵 터지는 대사 탑재.',
  },
  {
    icon: '🧹',
    title: '뒷정리 3초 (Zero Mess)',
    desc: '물기·가루 없는 완전 건식 놀이로 분리수거통에 버리면 끝.',
  },
  {
    icon: '⚡',
    title: '회원가입 0초',
    desc: '로그인, 결제창 없이 A4 300DPI 도안을 즉시 무료 인쇄합니다.',
  },
] as const

function pickPrintable(items: Printable[], query: string) {
  return items.find((item) => matchesQuery(item, query)) ?? items[0] ?? null
}

function isLocalAdminHost() {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function PlayHubPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data } = usePrintablesQuery()
  const openModal = useDownloadStore((state) => state.openModal)
  const situationFromUrl = params.get('situation')
  const [selectedSituation, setSelectedSituation] = useState<SituationFilter>(
    isSituationId(situationFromUrl) ? situationFromUrl : 'all',
  )
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryTab>('kids')
  const [selected, setSelected] = useState<PlaySolution | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isSituationId(situationFromUrl)) return
    setSelectedSituation(situationFromUrl)
    const timer = window.setTimeout(() => scrollToSection('play-toolbox'), 80)
    return () => window.clearTimeout(timer)
  }, [situationFromUrl])

  const printables = data ?? []
  const filteredSolutions = useMemo(() => {
    const primary =
      selectedSituation === 'all'
        ? PLAY_SOLUTIONS
        : PLAY_SOLUTIONS.filter((item) => item.situation === selectedSituation)
    if (primary.length >= 8) return primary.slice(0, 8)
    const filled = [...primary]
    const seen = new Set(filled.map((item) => item.id))
    for (const item of PLAY_SOLUTIONS) {
      if (filled.length >= 8) break
      if (seen.has(item.id)) continue
      filled.push(item)
      seen.add(item.id)
    }
    return filled.slice(0, 8)
  }, [selectedSituation])

  const selectedPrintable = selected ? pickPrintable(printables, selected.printQuery) : null
  const activeLibrary = LIBRARY_TABS.find((tab) => tab.id === activeCategoryTab) ?? LIBRARY_TABS[0]

  const goNav = (target: 'top' | 'play-toolbox' | 'printable-library' | 'premium-bundle') => {
    setMenuOpen(false)
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    scrollToSection(target)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            type="button"
            onClick={() => {
              navigate('/')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white shadow-sm">
              🖨️
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              DOOLIA <span className="ml-0.5 text-xs font-bold uppercase text-emerald-700">Printables</span>
            </span>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <button
              type="button"
              onClick={() => goNav('top')}
              className="text-sm font-bold text-slate-700 transition-colors hover:text-emerald-700"
            >
              🏠 홈
            </button>
            <button
              type="button"
              onClick={() => goNav('play-toolbox')}
              className="flex items-center gap-1.5 text-sm font-bold text-emerald-800 transition-colors hover:text-emerald-950"
            >
              <span>📦 놀이 도구함</span>
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800">HIT</span>
            </button>
            <button
              type="button"
              onClick={() => goNav('printable-library')}
              className="text-sm font-bold text-slate-700 transition-colors hover:text-emerald-700"
            >
              🎨 무료 도안
            </button>
            <button
              type="button"
              onClick={() => goNav('premium-bundle')}
              className="text-sm font-bold text-amber-600 transition-colors hover:text-amber-700"
            >
              🎁 프리미엄 묶음
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {isLocalAdminHost() ? (
              <button
                type="button"
                title="관리자 대시보드 (Local Only)"
                aria-label="관리자 대시보드 (Local Only)"
                onClick={() => navigate('/admin')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <Settings size={18} />
              </button>
            ) : null}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-700 md:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="mx-auto mt-3 flex max-w-6xl flex-col gap-1 border-t border-slate-100 pt-3 md:hidden">
            <button type="button" onClick={() => goNav('top')} className="rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700">
              🏠 홈
            </button>
            <button type="button" onClick={() => goNav('play-toolbox')} className="rounded-xl px-3 py-2 text-left text-sm font-bold text-emerald-800">
              📦 놀이 도구함
            </button>
            <button type="button" onClick={() => goNav('printable-library')} className="rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700">
              🎨 무료 도안
            </button>
            <button type="button" onClick={() => goNav('premium-bundle')} className="rounded-xl px-3 py-2 text-left text-sm font-bold text-amber-600">
              🎁 프리미엄 묶음
            </button>
          </div>
        ) : null}
      </header>

      <div className="bg-emerald-900 px-4 py-2 text-center text-xs font-medium tracking-wide text-emerald-100 sm:text-sm">
        ⭐ 100% 영구 무료 · 회원가입 없음 · 집 안 0원 재료 · 초고화질 A4 즉시 인쇄
      </div>

      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white px-4 pb-10 pt-12 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
            <span>✨ DOOLIA PLAY TOOLBOX</span>
            <span className="text-emerald-400">|</span>
            <span>부모를 위한 15분 놀이 처방전</span>
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl sm:leading-snug lg:text-[40px]">
            아이와 뭘 할지 고민될 때,
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              바로 꺼내 쓰는 무료 놀이 도구함
            </span>
          </h1>
          <p className="mx-auto mt-3.5 max-w-xl text-sm font-medium text-slate-600 sm:text-base">
            비싼 교구 없이 도안 1장과 집 안 재료로 15분 만에 해결됩니다.
          </p>
        </div>
      </section>

      <section id="play-toolbox" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">오늘의 추천 놀이 처방전</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
              {Math.min(filteredSolutions.length, 8)}개
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTER_TABS.map((tab) => {
              const isActive = selectedSituation === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSituation(tab.id)}
                  className={cn(
                    'whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 sm:text-sm',
                    isActive
                      ? 'scale-105 bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50',
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredSolutions.slice(0, 8).map((card) => (
            <article
              key={card.id}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              onClick={() => setSelected(card)}
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
                    <span className="flex items-center justify-center gap-1 rounded-lg border border-amber-200/60 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                      <span>👶</span>
                      <span>{card.age}</span>
                    </span>
                    <span className="flex items-center justify-center gap-1 rounded-lg border border-teal-200/60 bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">
                      <span>⏱️</span>
                      <span>{card.time}</span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelected(card)
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:bg-emerald-800 sm:text-sm"
                >
                  <span>🖨️</span>
                  <span>무료 도안 보기</span>
                  <span className="text-emerald-200 transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl border border-emerald-800/50 bg-gradient-to-br from-emerald-900 to-emerald-950 p-8 text-white shadow-lg sm:p-10">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Our Promise to Parents</span>
            <h3 className="mt-1 text-2xl font-extrabold sm:text-3xl">지친 부모님을 위한 둘리아의 4가지 약속</h3>
            <p className="mt-2 text-sm text-emerald-100/80">아이와 노는 시간이 스트레스가 되지 않도록 모든 허들을 없앴습니다.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {TRUST_PROMISES.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h4 className="mb-1 text-base font-bold text-white">{item.title}</h4>
                <p className="text-xs leading-relaxed text-emerald-100/70">{item.desc}</p>
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
              className={cn(
                'rounded-3xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8',
                hub.card,
              )}
            >
              <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl', hub.icon)}>
                {hub.emoji}
              </div>
              <h3 className="mb-1 text-xl font-bold text-slate-900">{hub.title}</h3>
              <p className="mb-6 text-xs text-slate-500">{hub.subtitle}</p>
              <div className="mb-8 flex flex-wrap gap-2">
                {hub.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                to={hub.to}
                className="flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700"
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
          <p className="mt-1 text-sm text-slate-500">원하는 학습 영역별 고화질 도안을 자유롭게 인쇄하세요.</p>
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
          <div className={cn('grid grid-cols-2 gap-4', activeLibrary.cols)}>
            {activeLibrary.items.map((item) => (
              <Link
                key={item.slug}
                to={categoryPath(item.slug)}
                className={cn(
                  'rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center transition-colors',
                  activeLibrary.hover,
                )}
              >
                <div className="mb-2 text-3xl">{item.icon}</div>
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="mt-1 text-xs text-slate-400">{item.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="premium-bundle" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-8 pb-16">
        <div className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-emerald-900/50 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-8 text-white shadow-xl sm:p-12 md:flex-row">
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

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
              <img src={selected.imageUrl} alt={selected.title} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700"
              >
                닫기
              </button>
            </div>
            <div className="space-y-5 p-6 sm:p-8">
              <div>
                <p className={cn('inline-flex rounded-md border px-2.5 py-0.5 text-xs font-extrabold', selected.badgeColor)}>
                  {selected.situationLabel}
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">{selected.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{selected.desc}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">⏱️ {selected.time}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">👶 {selected.age}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-extrabold text-emerald-700">📦 0원 준비물</p>
                <p className="mt-1">{selected.suppliesDetail}</p>
              </div>
              <ol className="space-y-3">
                {selected.steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-relaxed text-slate-700">{step}</p>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => {
                  if (selectedPrintable) openModal(selectedPrintable)
                }}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
              >
                {selectedPrintable ? '이 놀이 도안 인쇄하기 →' : '준비된 도안이 곧 추가돼요'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default PlayHubPage
