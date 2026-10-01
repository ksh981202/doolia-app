import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PrintableCard } from '@/components/PrintableCard'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { selectHomePrintables } from '@/services/printableService'
import { printablePath } from '@/shared/config/catalog'
import type { Printable } from '@/types/printable'

const POPULAR_TAGS = ['공룡', '유니콘', '자동차', '상상나라', '귀여운 동물'] as const

const WHY_DOOLIA = [
  {
    icon: '🖨️',
    title: '100% 무료 초고화질',
    desc: '회원가입 없이 원하는 도안을 언제든 A4 표준 규격으로 즉시 인쇄하세요.',
  },
  {
    icon: '✏️',
    title: '선명하고 깔끔한 라인',
    desc: '아이들이 삐져나가지 않고 쉽게 칠할 수 있도록 선명하고 굵은 외곽선 도안을 제공합니다.',
  },
  {
    icon: '🎨',
    title: '상상력 자극 12대 테마',
    desc: '공룡, 자동차부터 상상나라까지 아이의 호기심과 발달 단계에 맞춘 큐레이션을 제공합니다.',
  },
  {
    icon: '👶',
    title: '연령별 맞춤 난이도',
    desc: '2~3세 첫 색칠부터 6~7세+ 집중력 발달까지 아이의 소근육 성장에 딱 맞는 도안을 제공합니다.',
  },
] as const

const HOT_THEMES = [
  {
    to: '/category/coloring-pages?theme=dinosaur',
    icon: '🦖',
    title: '공룡 & 탈것',
    desc: '티라노부터 소방차까지 인기 폭발',
    className: 'bg-gradient-to-br from-amber-50 to-orange-50/60 border-orange-100/80',
  },
  {
    to: '/category/coloring-pages?theme=princess',
    icon: '👑',
    title: '공주 & 유니콘',
    desc: '반짝반짝 드레스와 마법의 성',
    className: 'bg-gradient-to-br from-pink-50 to-rose-50/60 border-pink-100/80',
  },
  {
    to: '/category/coloring-pages?theme=imagination',
    icon: '✨',
    title: '엉뚱발랄 상상나라',
    desc: '창의력 쑥쑥 과자행성과 마법',
    className: 'bg-gradient-to-br from-emerald-50 to-teal-50/60 border-emerald-100/80',
  },
  {
    to: '/category/coloring-pages?age=2-3',
    icon: '👶',
    title: '2~3세 첫 색칠',
    desc: '소근육 발달을 돕는 굵은선 도안',
    className: 'bg-gradient-to-br from-blue-50 to-indigo-50/60 border-blue-100/80',
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

function colorImage(printable: Printable) {
  return printable.image_color_url || printable.color_image_url || printableImage(printable)
}

function lineImage(printable: Printable) {
  return printable.image_bw_url || printable.line_art_url || colorImage(printable)
}

function HeroSplitPreview({ printable }: { printable: Printable }) {
  const colorSrc = colorImage(printable)
  const lineSrc = lineImage(printable)
  const grayscaleFallback = lineSrc === colorSrc
  const alt = printable.title_ko || printable.title

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-slate-50">
      <img src={colorSrc} alt={alt} className="h-full w-full object-contain" />
      <img
        src={lineSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        style={{
          clipPath: 'polygon(58% 0%, 100% 0%, 100% 100%, 42% 100%)',
          filter: grayscaleFallback ? 'grayscale(100%) contrast(150%)' : undefined,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, transparent 48.6%, rgba(255,255,255,0.95) 49.4%, rgba(16,185,129,0.55) 50%, rgba(255,255,255,0.95) 50.6%, transparent 51.4%)',
        }}
      />
    </div>
  )
}

export function PlayHubPage() {
  const navigate = useNavigate()
  const [searchKeyword, setSearchKeyword] = useState('')
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

  const goToSearch = (keyword: string) => {
    const next = keyword.trim()
    if (!next) return
    navigate(`/category/coloring-pages?q=${encodeURIComponent(next)}`)
  }

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault()
    goToSearch(searchKeyword)
  }

  const [front, left, right] = [showcase[0], showcase[1], showcase[2]]

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <section className="pt-6">
        <div className="relative mb-10 overflow-visible rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white px-6 py-6 shadow-2xs sm:px-10 sm:py-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-4 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-600/10 px-3.5 py-1.5 text-[12px] font-bold text-emerald-900 shadow-2xs backdrop-blur-xs">
                <span className="text-emerald-700">✨</span>
                <span>100% 무료 인쇄 · 회원가입 없음 · 초고화질 A4 지원</span>
              </div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-4xl lg:text-5xl">
                아이의 상상력을 무한히 펼치는 <br className="hidden sm:inline" />
                <span className="text-emerald-600">프리미엄 무료 색칠도안</span>
              </h1>
              <form onSubmit={handleSearchSubmit} className="relative max-w-lg">
                <div className="relative flex items-center">
                  <Search
                    size={20}
                    className="pointer-events-none absolute left-4 text-slate-400"
                    strokeWidth={2.5}
                  />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder="어떤 도안을 찾으시나요? (예: 공룡, 유니콘, 자동차)"
                    aria-label="도안 검색"
                    className="w-full rounded-2xl border border-slate-200/90 bg-white py-3 pr-20 pl-11 text-[13.5px] font-medium text-slate-800 shadow-2xs placeholder:text-slate-400 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-95"
                  >
                    검색
                  </button>
                </div>
              </form>
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="mr-1 text-[13.5px] font-black text-slate-500">인기 검색어:</span>
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => goToSearch(tag)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-[13.5px] font-bold text-slate-700 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center py-2 lg:col-span-5">
              <div className="relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-[19rem]">
                {left ? (
                  <Link
                    to={printablePath(left.slug || left.id)}
                    state={{ printable: left }}
                    className="absolute top-4 -left-2 h-48 w-36 -rotate-[8deg] rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg transition-transform duration-300 hover:-rotate-12 sm:h-52 sm:w-40"
                  >
                    <img
                      src={printableImage(left)}
                      alt={left.title_ko || left.title}
                      className="h-full w-full rounded-xl bg-slate-50 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="absolute top-4 -left-2 h-48 w-36 -rotate-[8deg] animate-pulse rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg sm:h-52 sm:w-40" />
                )}
                {right ? (
                  <Link
                    to={printablePath(right.slug || right.id)}
                    state={{ printable: right }}
                    className="absolute top-4 -right-2 h-48 w-36 rotate-[8deg] rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg transition-transform duration-300 hover:rotate-12 sm:h-52 sm:w-40"
                  >
                    <img
                      src={printableImage(right)}
                      alt={right.title_ko || right.title}
                      className="h-full w-full rounded-xl bg-slate-50 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="absolute top-4 -right-2 h-48 w-36 rotate-[8deg] animate-pulse rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg sm:h-52 sm:w-40" />
                )}
                {front ? (
                  <Link
                    to={printablePath(front.slug || front.id)}
                    state={{ printable: front }}
                    className="relative z-10 flex h-[15.75rem] w-[11.5rem] flex-col rounded-2xl border-2 border-emerald-400/70 bg-white p-2.5 shadow-xl transition-transform duration-300 hover:scale-[1.02] sm:h-[17.5rem] sm:w-48"
                  >
                    <span className="mb-1.5 inline-flex w-fit items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black leading-none text-white shadow-2xs sm:text-[10.5px]">
                      ✨ A4 무료 인쇄 도안
                    </span>
                    <HeroSplitPreview printable={front} />
                    <p className="mt-1.5 text-center text-[10px] font-semibold tracking-tight text-slate-500">
                      컬러 완성 예시 & 흑백 라인 도안
                    </p>
                  </Link>
                ) : (
                  <div className="relative z-10 h-[15.75rem] w-[11.5rem] animate-pulse rounded-2xl border-2 border-emerald-400/70 bg-white p-2.5 shadow-xl sm:h-[17.5rem] sm:w-48" />
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {HOT_THEMES.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`group rounded-3xl border p-5 text-left transition-all hover:shadow-lg ${item.className}`}
              >
                <div className="mb-3 text-3xl transition-transform group-hover:scale-110">{item.icon}</div>
                <h3 className="mb-1 text-base font-bold text-slate-800 sm:text-lg">{item.title}</h3>
                <p className="text-xs text-slate-500 sm:text-sm">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="popular-gallery" className="scroll-mt-24 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            지금 가장 인기 있는 도안
          </h2>
          <Link
            to="/category/coloring-pages"
            className="flex items-center gap-1 text-[13.5px] font-bold text-slate-500 transition-colors hover:text-emerald-700"
          >
            <span>전체보기</span>
            <span>→</span>
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

      <section className="my-12 mb-16 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
        <div className="mx-auto mb-10 max-w-xl space-y-2 text-center">
          <span className="block text-xs font-bold uppercase tracking-widest text-emerald-600">
            WHY DOOLIA
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
            아이의 창의력을 깨우는 둘리아의 특별함
          </h2>
          <p className="text-sm font-medium leading-relaxed text-slate-500">
            복잡한 과정 없이 언제 어디서나 바로 인쇄해서 즐기는 고화질 색칠 놀이 도안
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {WHY_DOOLIA.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-emerald-100/80 bg-emerald-50/50 p-7 transition-all hover:shadow-md sm:p-8"
            >
              <div className="mb-4 inline-block text-3xl sm:text-4xl">{item.icon}</div>
              <h3 className="mb-2.5 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">{item.title}</h3>
              <p className="text-sm font-normal leading-relaxed text-slate-600 sm:text-[14.5px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default PlayHubPage
