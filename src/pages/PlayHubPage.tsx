import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PrintableCard } from '@/components/PrintableCard'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { selectHomePrintables } from '@/services/printableService'
import { printablePath } from '@/shared/config/catalog'
import type { Printable } from '@/types/printable'

const POPULAR_TAGS = [
  { label: '🦕 공룡', keyword: '공룡' },
  { label: '🦄 유니콘', keyword: '유니콘' },
  { label: '🚗 자동차', keyword: '자동차' },
  { label: '🔤 알파벳', keyword: '알파벳' },
  { label: '🐶 동물', keyword: '동물' },
] as const

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
    icon: '🌿',
    title: '온가족 힐링 컬러링',
    desc: '아이뿐 아니라 부모와 조부모님도 함께 즐길 수 있는 섬세한 시니어 도안까지 함께합니다.',
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
                <span>100% 무료 인쇄 · 회원가입 없음 · A4 & US Letter 지원</span>
              </div>
              <h1 className="text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-[34px]">
                아이와 함께 웃으며 만드는
                <br />
                <span className="font-extrabold text-emerald-700">매일매일 행복한 놀이 시간</span>
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
                    placeholder="어떤 도안을 찾으시나요? (예: 공룡, 유니콘, 알파벳)"
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
                    key={tag.keyword}
                    type="button"
                    onClick={() => goToSearch(tag.keyword)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-[13.5px] font-bold text-slate-700 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 active:scale-95"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center py-2 lg:col-span-5">
              <div className="relative flex h-52 w-60 items-center justify-center sm:h-56 sm:w-[17rem]">
                {left ? (
                  <Link
                    to={printablePath(left.slug || left.id)}
                    state={{ printable: left }}
                    className="absolute top-2 -left-3 h-48 w-36 -rotate-[8deg] rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg transition-transform duration-300 hover:-rotate-12 sm:h-52 sm:w-40"
                  >
                    <img
                      src={printableImage(left)}
                      alt={left.title_ko || left.title}
                      className="h-full w-full rounded-xl bg-slate-50 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="absolute top-2 -left-3 h-48 w-36 -rotate-[8deg] animate-pulse rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg sm:h-52 sm:w-40" />
                )}
                {right ? (
                  <Link
                    to={printablePath(right.slug || right.id)}
                    state={{ printable: right }}
                    className="absolute top-2 -right-3 h-48 w-36 rotate-[8deg] rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg transition-transform duration-300 hover:rotate-12 sm:h-52 sm:w-40"
                  >
                    <img
                      src={printableImage(right)}
                      alt={right.title_ko || right.title}
                      className="h-full w-full rounded-xl bg-slate-50 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="absolute top-2 -right-3 h-48 w-36 rotate-[8deg] animate-pulse rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg sm:h-52 sm:w-40" />
                )}
                {front ? (
                  <Link
                    to={printablePath(front.slug || front.id)}
                    state={{ printable: front }}
                    className="relative z-10 h-52 w-40 rounded-2xl border-2 border-emerald-400/70 bg-white p-2.5 shadow-xl transition-transform duration-300 hover:scale-[1.02] sm:h-56 sm:w-44"
                  >
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[10.5px] font-black text-white shadow-2xs">
                      BEST
                    </span>
                    <img
                      src={printableImage(front)}
                      alt={front.title_ko || front.title}
                      className="h-full w-full rounded-xl bg-slate-50 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="relative z-10 h-52 w-40 animate-pulse rounded-2xl border-2 border-emerald-400/70 bg-white p-2.5 shadow-xl sm:h-56 sm:w-44" />
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
              className="rounded-2xl border border-emerald-100/60 bg-emerald-50/50 p-6"
            >
              <div className="mb-3 text-2xl">{item.icon}</div>
              <h3 className="mb-1 text-base font-bold tracking-tight text-slate-800">{item.title}</h3>
              <p className="text-xs font-medium leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default PlayHubPage
