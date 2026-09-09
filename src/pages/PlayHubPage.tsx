import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PrintableCard } from '@/components/PrintableCard'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { selectHomePrintables } from '@/services/printableService'
import { categoryPath, printablePath } from '@/shared/config/catalog'
import { situationPath } from '@/shared/config/playSituations'
import { PLAY_SOLUTIONS, playRecipePath, type PlaySolution } from '@/shared/config/playSolutions'
import type { Printable } from '@/types/printable'

const RECOMMEND_ITEMS = PLAY_SOLUTIONS.slice(0, 4)

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

function printableImage(printable: Printable) {
  return (
    printable.image_color_url ||
    printable.image_bw_url ||
    printable.line_art_url ||
    printable.color_image_url ||
    ''
  )
}

export function PlayHubPage() {
  const navigate = useNavigate()
  const { data, isLoading } = usePrintablesQuery()
  const popular = useMemo(() => selectHomePrintables([...(data ?? [])], 8), [data])
  const showcase = useMemo(() => {
    const ranked = [...(data ?? [])].sort(
      (a, b) => b.downloads - a.downloads || +new Date(b.created_at) - +new Date(a.created_at),
    )
    const coloring = ranked.find((item) => item.category === 'coloring-pages')
    const maze = ranked.find((item) => item.category === 'maze')
    const picked: Printable[] = []
    for (const item of [coloring, maze, ...ranked]) {
      if (!item || picked.some((entry) => entry.id === item.id)) continue
      picked.push(item)
      if (picked.length === 3) break
    }
    return picked
  }, [data])

  const openRecipe = (card: PlaySolution) => {
    navigate(playRecipePath(card.situation, card.id))
  }

  const [front, left, right] = [showcase[0], showcase[1], showcase[2]]

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <section className="pt-8">
        <div className="relative mb-10 overflow-visible rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white p-6 shadow-xs sm:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3.5 py-1.5 text-xs font-black text-emerald-800">
                <span>✨ DOOLIA PRINTABLES</span>
                <span>·</span>
                <span>100% 무료 A4 도안</span>
              </div>
              <h1 className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
                도안 1장으로 채우는
                <br />
                <span className="text-emerald-700">우리 아이와의 행복한 놀이 시간</span>
              </h1>
              <p className="text-sm font-medium text-slate-600 sm:text-base">
                비싼 교구 없이 집 안 재료와 도안 1장으로 즉시 시작하세요.
                <br />
                회원가입 없이 1초 만에 초고화질 A4로 바로 인쇄할 수 있습니다.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={categoryPath('coloring-pages')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700"
                >
                  <span>🖍️ 무료 색칠 도안 보기</span>
                  <span>→</span>
                </Link>
                <Link
                  to={situationPath('home')}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50"
                >
                  📦 맞춤 놀이 도구함
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center py-4 lg:col-span-5">
              <div className="relative flex h-56 w-64 items-center justify-center sm:h-64 sm:w-72">
                {left ? (
                  <Link
                    to={printablePath(left.slug || left.id)}
                    state={{ printable: left }}
                    className="absolute top-2 -left-2 h-52 w-40 -rotate-6 rounded-2xl border border-slate-200 bg-white p-2 shadow-md transition-transform hover:-rotate-12"
                  >
                    <img
                      src={printableImage(left)}
                      alt={left.title_ko || left.title}
                      className="h-full w-full rounded-xl bg-slate-50 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="absolute top-2 -left-2 h-52 w-40 -rotate-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-2 shadow-md" />
                )}
                {right ? (
                  <Link
                    to={printablePath(right.slug || right.id)}
                    state={{ printable: right }}
                    className="absolute top-2 -right-2 h-52 w-40 rotate-6 rounded-2xl border border-slate-200 bg-white p-2 shadow-md transition-transform hover:rotate-12"
                  >
                    <img
                      src={printableImage(right)}
                      alt={right.title_ko || right.title}
                      className="h-full w-full rounded-xl bg-slate-50 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="absolute top-2 -right-2 h-52 w-40 rotate-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-2 shadow-md" />
                )}
                {front ? (
                  <Link
                    to={printablePath(front.slug || front.id)}
                    state={{ printable: front }}
                    className="relative z-10 h-56 w-44 rounded-2xl border-2 border-emerald-500/40 bg-white p-2.5 shadow-xl"
                  >
                    <span className="absolute top-3 right-3 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">
                      인기 BEST
                    </span>
                    <img
                      src={printableImage(front)}
                      alt={front.title_ko || front.title}
                      className="h-full w-full rounded-xl bg-slate-50 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="relative z-10 h-56 w-44 animate-pulse rounded-2xl border-2 border-emerald-500/40 bg-white p-2.5 shadow-xl" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="popular-gallery" className="scroll-mt-24 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            지금 가장 인기 있는 도안
          </h2>
          <Link
            to="/category"
            className="flex items-center gap-1 text-[13.5px] font-bold text-slate-500 transition-colors hover:text-emerald-700"
          >
            <span>전체보기</span>
            <span>&gt;</span>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {popular.map((printable) => (
              <PrintableCard key={printable.id} printable={printable} variant="catalog" />
            ))}
          </div>
        )}
      </section>

      <section id="play-toolbox" className="scroll-mt-24 bg-white py-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            아이와 함께하는 행복한 놀이
          </h2>
          <Link
            to={situationPath('home')}
            className="flex items-center gap-1 text-[13.5px] font-bold text-slate-500 transition-colors hover:text-emerald-700"
          >
            <span>전체보기</span>
            <span>&gt;</span>
          </Link>
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

      <section className="pb-16">
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
    </div>
  )
}

export default PlayHubPage
