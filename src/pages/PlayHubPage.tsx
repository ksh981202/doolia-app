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

const WHY_ITEMS = [
  { id: 'hd', icon: '🖨️' },
  { id: 'ink', icon: '✏️' },
  { id: 'variety', icon: '🎨' },
  { id: 'safe', icon: '🛡️' },
] as const

const HOT_THEMES = [
  {
    id: 'dino',
    to: '/category/coloring-pages?theme=dinosaur',
    icon: '🦖',
    className: 'bg-gradient-to-br from-amber-50 to-orange-50/60 border-orange-100/80',
  },
  {
    id: 'princess',
    to: '/category/coloring-pages?theme=princess',
    icon: '👑',
    className: 'bg-gradient-to-br from-pink-50 to-rose-50/60 border-pink-100/80',
  },
  {
    id: 'imagination',
    to: '/category/coloring-pages?theme=imagination',
    icon: '✨',
    className: 'bg-gradient-to-br from-emerald-50 to-teal-50/60 border-emerald-100/80',
  },
  {
    id: 'animals',
    to: '/category/coloring-pages?theme=animals',
    icon: '🐶',
    className: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-100/80 hover:border-amber-300/80',
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
        <div className="relative mb-10 overflow-visible rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white px-6 py-6 shadow-2xs sm:px-10 sm:py-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-4 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-600/10 px-3.5 py-1.5 text-[12px] font-bold text-emerald-900 shadow-2xs backdrop-blur-xs">
                <span className="text-emerald-700">✨</span>
                <span>{t('home.badge')}</span>
              </div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-4xl lg:text-5xl">
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
                <span className="mr-1 text-[13.5px] font-black text-slate-500">{t('home.popularLabel')}</span>
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
                      alt={pickLocalized(left, 'title', i18n.language) || left.title}
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
                      alt={pickLocalized(right, 'title', i18n.language) || right.title}
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
                    className="relative z-10 block h-[15.75rem] w-[11.5rem] overflow-hidden rounded-2xl border-2 border-emerald-400/70 bg-white p-2 shadow-xl transition-transform duration-300 hover:scale-[1.02] sm:h-[17.5rem] sm:w-48"
                  >
                    <HeroSplitPreview printable={front} />
                  </Link>
                ) : (
                  <div className="relative z-10 h-[15.75rem] w-[11.5rem] animate-pulse overflow-hidden rounded-2xl border-2 border-emerald-400/70 bg-white p-2 shadow-xl sm:h-[17.5rem] sm:w-48" />
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
                <h3 className="mb-1 text-base font-bold text-slate-800 sm:text-lg">{t(`home.hot.${item.id}.title`)}</h3>
                <p className="text-xs text-slate-500 sm:text-sm">{t(`home.hot.${item.id}.desc`)}</p>
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
        <div className="mx-auto mb-10 max-w-xl space-y-2 text-center">
          <span className="block text-xs font-bold uppercase tracking-widest text-emerald-600">
            WHY DOOLIA
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
            {t('home.whyTitle')}
          </h2>
          <p className="text-sm font-medium leading-relaxed text-slate-500">
            {t('home.whySubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {WHY_ITEMS.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-emerald-100/80 bg-emerald-50/50 p-7 transition-all hover:shadow-md sm:p-8"
            >
              <div className="mb-4 inline-block text-3xl sm:text-4xl">{item.icon}</div>
              <h3 className="mb-2.5 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">{t(`home.why.${item.id}.title`)}</h3>
              <p className="text-sm font-normal leading-relaxed text-slate-600 sm:text-[14.5px]">{t(`home.why.${item.id}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default PlayHubPage
