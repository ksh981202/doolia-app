import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PrintableCard } from '@/components/PrintableCard'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { selectHomePrintables } from '@/services/printableService'
import { printablePath } from '@/shared/config/catalog'
import { pickLocalized } from '@/shared/lib/detailCopy'
import type { Printable } from '@/types/printable'

const POPULAR_TAGS = [
  { id: 'dino', q: '공룡' },
  { id: 'unicorn', q: '유니콘' },
  { id: 'car', q: '자동차' },
  { id: 'imagination', q: '상상나라' },
  { id: 'animals', q: '귀여운 동물' },
] as const

const WHY_DOOLIA = [
  {
    key: 'hd',
    icon: '🖨️',
    cardBg: 'bg-emerald-50/70 border-emerald-100/90',
    titleColor: 'text-emerald-950',
    descColor: 'text-emerald-800/70',
  },
  {
    key: 'ink',
    icon: '✏️',
    cardBg: 'bg-amber-50/70 border-amber-100/90',
    titleColor: 'text-amber-950',
    descColor: 'text-amber-800/70',
  },
  {
    key: 'variety',
    icon: '🎨',
    cardBg: 'bg-purple-50/70 border-purple-100/90',
    titleColor: 'text-purple-950',
    descColor: 'text-purple-800/70',
  },
  {
    key: 'free',
    icon: '🛡️',
    cardBg: 'bg-blue-50/70 border-blue-100/90',
    titleColor: 'text-blue-950',
    descColor: 'text-blue-800/70',
  },
] as const

const HOT_THEMES = [
  {
    key: 'dino',
    to: '/category/coloring-pages?theme=dinosaur',
    icon: '🦖',
    cardBg: 'bg-amber-50/60 border-amber-100/90 hover:border-amber-300',
  },
  {
    key: 'princess',
    to: '/category/coloring-pages?theme=princess',
    icon: '👑',
    cardBg: 'bg-pink-50/60 border-pink-100/90 hover:border-pink-300',
  },
  {
    key: 'imagination',
    to: '/category/coloring-pages?theme=imagination',
    icon: '✨',
    cardBg: 'bg-emerald-50/60 border-emerald-100/90 hover:border-emerald-300',
  },
  {
    key: 'animals',
    to: '/category/coloring-pages?theme=animals',
    icon: '🐶',
    cardBg: 'bg-orange-50/60 border-orange-100/90 hover:border-orange-300',
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
  const { i18n } = useTranslation()
  const colorSrc = colorImage(printable)
  const lineSrc = lineImage(printable)
  const grayscaleFallback = lineSrc === colorSrc
  const alt = pickLocalized(printable, 'title', i18n.language) || printable.title

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-50">
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
  const { t, i18n } = useTranslation()
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
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white px-6 py-6 shadow-2xs sm:px-10 sm:py-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-4 lg:col-span-7">
              <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-600/10 px-3 py-1.5 text-center text-[12px] font-bold text-emerald-900 shadow-2xs backdrop-blur-xs">
                <span className="text-emerald-700">✨</span>
                <span className="min-w-0 break-words">{t('home.badge')}</span>
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-800 sm:text-4xl lg:text-5xl">
                {t('home.titleLead')} <br className="hidden sm:inline" />
                <span className="text-emerald-600">{t('home.titleAccent')}</span>
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
                    placeholder={t('header.searchPlaceholder', '도안 이름, 놀이 아이디어를 검색하세요')}
                    aria-label={t('header.searchPlaceholder', '도안 이름, 놀이 아이디어를 검색하세요')}
                    className="w-full rounded-2xl border border-slate-200/90 bg-white py-3 pr-20 pl-11 text-[13.5px] font-medium text-slate-800 shadow-2xs placeholder:text-slate-400 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-95"
                  >
                    {t('home.searchBtn')}
                  </button>
                </div>
              </form>
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="mr-1 text-[13.5px] font-semibold text-slate-500">{t('home.popularLabel')}</span>
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => goToSearch(tag.q)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-[13.5px] font-bold text-slate-700 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 active:scale-95"
                  >
                    {t(`home.tags.${tag.id}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-2 flex items-center justify-center overflow-hidden py-2 sm:my-6 lg:col-span-5">
              <div className="relative flex h-[300px] w-[19.5rem] scale-90 items-center justify-center sm:h-72 sm:w-[19rem] sm:scale-100">
                {left ? (
                  <Link
                    to={printablePath(left.slug || left.id)}
                    state={{ printable: left }}
                    className="absolute top-4 -left-2 h-[260px] w-[185px] -translate-x-12 -rotate-12 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg transition-transform duration-300 hover:-rotate-12 sm:h-52 sm:w-40 sm:translate-x-0 sm:-rotate-[8deg]"
                  >
                    <img
                      src={printableImage(left)}
                      alt={pickLocalized(left, 'title', i18n.language) || left.title}
                      className="h-full w-full rounded-xl bg-slate-50 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="absolute top-4 -left-2 h-[260px] w-[185px] -translate-x-12 -rotate-12 animate-pulse rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg sm:h-52 sm:w-40 sm:translate-x-0 sm:-rotate-[8deg]" />
                )}
                {right ? (
                  <Link
                    to={printablePath(right.slug || right.id)}
                    state={{ printable: right }}
                    className="absolute top-4 -right-2 h-[260px] w-[185px] translate-x-12 rotate-12 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg transition-transform duration-300 hover:rotate-12 sm:h-52 sm:w-40 sm:translate-x-0 sm:rotate-[8deg]"
                  >
                    <img
                      src={printableImage(right)}
                      alt={pickLocalized(right, 'title', i18n.language) || right.title}
                      className="h-full w-full rounded-xl bg-slate-50 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="absolute top-4 -right-2 h-[260px] w-[185px] translate-x-12 rotate-12 animate-pulse rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg sm:h-52 sm:w-40 sm:translate-x-0 sm:rotate-[8deg]" />
                )}
                {front ? (
                  <Link
                    to={printablePath(front.slug || front.id)}
                    state={{ printable: front }}
                    className="relative z-10 block h-[300px] w-[215px] overflow-hidden rounded-2xl border-2 border-emerald-400/70 bg-white p-2 shadow-xl transition-transform duration-300 hover:scale-[1.02] sm:h-[17.5rem] sm:w-48"
                  >
                    <HeroSplitPreview printable={front} />
                  </Link>
                ) : (
                  <div className="relative z-10 h-[300px] w-[215px] animate-pulse overflow-hidden rounded-2xl border-2 border-emerald-400/70 bg-white p-2 shadow-xl sm:h-[17.5rem] sm:w-48" />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3.5 sm:mt-8 sm:gap-4 lg:grid-cols-4">
            {HOT_THEMES.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`group flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:px-4.5 sm:py-4 ${item.cardBg}`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-white text-2xl shadow-xs transition-transform duration-300 group-hover:scale-110">
                  <span>{item.icon}</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-start text-left">
                  <h3 className="line-clamp-1 text-[17px] font-bold leading-snug tracking-tight text-slate-800">
                    {t(`home.hot.${item.key}.title`)}
                  </h3>
                  <p className="mt-0.5 w-full truncate text-left text-[13.5px] font-medium leading-normal text-slate-500 sm:text-[14.5px]">
                    {t(`home.hot.${item.key}.desc`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="popular-gallery" className="scroll-mt-24 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            {t('home.popularHeading')}
          </h2>
          <Link
            to="/category/coloring-pages"
            className="flex items-center gap-1 text-[13.5px] font-bold text-slate-500 transition-colors hover:text-emerald-700"
          >
            <span>{t('home.viewAll')}</span>
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
        <div className="mx-auto max-w-3xl space-y-2 text-center">
          <span className="block text-xs font-bold uppercase tracking-widest text-emerald-600">
            WHY DOOLIA
          </span>
          <h2 className="mx-auto max-w-3xl break-keep text-2xl font-bold leading-snug tracking-tight text-slate-900 [overflow-wrap:anywhere] sm:text-3xl md:text-4xl">
            {t('home.whyTitle')}
          </h2>
          <p className="mx-auto max-w-2xl break-keep text-sm font-medium leading-relaxed text-slate-500">
            {t('home.whySubtitle')}
          </p>
        </div>
        <div className="mx-auto mt-10 grid w-full max-w-6xl grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {WHY_DOOLIA.map((item) => (
            <div
              key={item.key}
              className={`group flex flex-row items-center justify-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs ${item.cardBg}`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-white text-2xl shadow-xs transition-transform duration-300 group-hover:scale-110">
                <span>{item.icon}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start text-left">
                <h3
                  className={`w-full truncate text-left text-[13px] font-bold leading-snug tracking-tight sm:text-[14.5px] ${item.titleColor}`}
                >
                  {t(`home.why.${item.key}.title`)}
                </h3>
                <p
                  className={`mt-0.5 w-full truncate text-left text-[13.5px] font-medium leading-normal sm:text-[14.5px] ${item.descColor}`}
                >
                  {t(`home.why.${item.key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default PlayHubPage
