import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PrintableCard } from '@/components/PrintableCard'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { selectHomePrintables } from '@/services/printableService'
import { categorySearchPath, printablePath } from '@/shared/config/catalog'
import { pickLocalized } from '@/shared/lib/detailCopy'
import { getCdnImageUrl, getDisplayImageUrl } from '@/shared/utils/printableAssets'
import type { Printable } from '@/types/printable'

const TAG_LOCALIZED_LABELS: Record<string, Record<string, string>> = {
  dino: {
    ko: '공룡', en: 'Dinosaurs', es: 'Dinosaurios', ja: '恐竜', zh: '恐龙',
    de: 'Dinosaurier', fr: 'Dinosaures', pt: 'Dinossauros', it: 'Dinosauri', vi: 'Khủng long'
  },
  robot: {
    ko: '로봇', en: 'Robots', es: 'Robots', ja: 'ロボット', zh: '机器人',
    de: 'Roboter', fr: 'Robots', pt: 'Robôs', it: 'Robot', vi: 'Robot'
  },
  car: {
    ko: '자동차', en: 'Cars', es: 'Coches', ja: '車', zh: '汽车',
    de: 'Autos', fr: 'Voitures', pt: 'Carros', it: 'Auto', vi: 'Ô tô'
  },
  sports: {
    ko: '스포츠', en: 'Sports', es: 'Deportes', ja: 'スポーツ', zh: '运动',
    de: 'Sport', fr: 'Sports', pt: 'Esportes', it: 'Sport', vi: 'Thể thao'
  },
  ocean: {
    ko: '바다', en: 'Ocean', es: 'Océano', ja: '海', zh: '海洋',
    de: 'Ozean', fr: 'Océan', pt: 'Oceano', it: 'Oceano', vi: 'Đại dương'
  },
}

const RECOMMENDED_HEADING: Record<string, string> = {
  ko: '오늘의 추천 도안',
  en: "Today's Picks",
  es: 'Recomendados de hoy',
  ja: '今日のおすすめ塗り絵',
  zh: '今日推荐涂色页',
  pt: 'Desenhos recomendados de hoje',
  de: 'Empfehlungen des Tages',
  fr: 'Recommandations du jour',
  it: 'Consigliati di oggi',
  vi: 'Gợi ý tô màu hôm nay',
}


const POPULAR_TAGS = [
  { id: 'dino', q: '공룡' },
  { id: 'robot', q: '로봇' },
  { id: 'car', q: '자동차' },
  { id: 'sports', q: '스포츠' },
  { id: 'ocean', q: '바다' },
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

function HeroColorImage({
  printable,
  width,
  className,
}: {
  printable: Printable
  width: number
  className: string
}) {
  const { i18n } = useTranslation()
  const originalSrc = colorImage(printable)
  const cdnSrc = getCdnImageUrl(originalSrc)
  return (
    <img
      src={getDisplayImageUrl(originalSrc, width)}
      alt={pickLocalized(printable, 'title', i18n.language) || printable.title}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        if (event.currentTarget.src !== cdnSrc) {
          event.currentTarget.src = cdnSrc
        }
      }}
    />
  )
}

function HeroSplitPreview({ printable }: { printable: Printable }) {
  const { i18n } = useTranslation()
  const colorOriginalSrc = colorImage(printable)
  const lineOriginalSrc = lineImage(printable)
  const colorSrc = getDisplayImageUrl(colorOriginalSrc, 640)
  const lineSrc = getDisplayImageUrl(lineOriginalSrc, 640)
  const colorCdnSrc = getCdnImageUrl(colorOriginalSrc)
  const lineCdnSrc = getCdnImageUrl(lineOriginalSrc)
  const grayscaleFallback = lineOriginalSrc === colorOriginalSrc
  const alt = pickLocalized(printable, 'title', i18n.language) || printable.title

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-50">
      <img
        src={colorSrc}
        alt={alt}
        className="h-full w-full object-contain"
        decoding="async"
        {...{ fetchPriority: 'high', fetchpriority: 'high' }}
        onError={(event) => {
          if (event.currentTarget.src !== colorCdnSrc) {
            event.currentTarget.src = colorCdnSrc
          }
        }}
      />
      <img
        src={lineSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        decoding="async"
        {...{ fetchPriority: 'high', fetchpriority: 'high' }}
        style={{
          clipPath: 'polygon(58% 0%, 100% 0%, 100% 100%, 42% 100%)',
          filter: grayscaleFallback ? 'grayscale(100%) contrast(150%)' : undefined,
        }}
        onError={(event) => {
          if (event.currentTarget.src !== lineCdnSrc) {
            event.currentTarget.src = lineCdnSrc
          }
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
  const currentLang = (i18n.language || i18n.resolvedLanguage || 'ko').slice(0, 2).toLowerCase()

  const navigate = useNavigate()
  const [searchKeyword, setSearchKeyword] = useState('')
  const { data, isLoading } = usePrintablesQuery()
  const popular = useMemo(() => {
    const list = [...(data ?? [])]
    if (list.length <= 8) return selectHomePrintables(list, 8)

    // 3시간 단위 블록 (0 ~ 7) 및 날짜 시드 계산
    const now = new Date()
    const timeBlock = Math.floor(now.getHours() / 3)
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const seed = (dayOfYear * 8) + timeBlock

    // 시드 기반 일관된 셔플 오프셋으로 8장 추천 선별
    const shuffled = [...list].sort((a, b) => {
      const hashA = ((a.slug || a.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + seed) % 1000
      const hashB = ((b.slug || b.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + seed) % 1000
      return hashA - hashB
    })

    return selectHomePrintables(shuffled, 8)
  }, [data])
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
    navigate(categorySearchPath(next))
  }

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault()
    goToSearch(searchKeyword)
  }

  const [front, left, right] = [showcase[0], showcase[1], showcase[2]]

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <section className="pt-2 sm:pt-4">
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white px-6 py-6 sm:py-7 md:px-10 lg:px-12 lg:py-8 shadow-2xs">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <h1 className="mb-5 md:mb-6 text-3xl font-bold leading-tight tracking-tight text-slate-800 sm:text-4xl lg:text-5xl">
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
              <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[13.5px] font-semibold text-slate-500">{t('home.popularLabel')}</span>
                {POPULAR_TAGS.map((tag) => {
                  const lang = (i18n.language || 'ko').slice(0, 2).toLowerCase()
                  const localizedTag = TAG_LOCALIZED_LABELS[tag.id]?.[lang] || TAG_LOCALIZED_LABELS[tag.id]?.en || tag.q
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => goToSearch(tag.q)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-[13.5px] font-bold text-slate-700 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 active:scale-95"
                    >
                      {t(`home.tags.${tag.id}`, localizedTag)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="relative flex items-center justify-center overflow-hidden lg:col-span-5">
              <div className="relative flex h-[300px] w-[19.5rem] scale-90 items-center justify-center sm:h-72 sm:w-[19rem] sm:scale-100">
                {left ? (
                  <Link
                    to={printablePath(left.slug || left.id)}
                    state={{ printable: left }}
                    className="absolute top-4 -left-2 h-[260px] w-[185px] -translate-x-12 -rotate-12 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg transition-transform duration-300 hover:-rotate-12 sm:h-52 sm:w-40 sm:translate-x-0 sm:-rotate-[8deg]"
                  >
                    <HeroColorImage
                      printable={left}
                      width={400}
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
                    <HeroColorImage
                      printable={right}
                      width={400}
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

          <div className="mt-5 grid w-full grid-cols-2 gap-2.5 sm:mt-6 sm:gap-3.5 lg:mt-7 lg:grid-cols-4 lg:gap-4">
            {HOT_THEMES.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`group flex items-center gap-2.5 rounded-2xl border p-2.5 shadow-xs transition-all duration-200 hover:scale-[1.02] sm:gap-3.5 sm:p-3.5 lg:p-4 ${item.cardBg}`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white text-[18px] shadow-xs sm:h-11 sm:w-11 sm:text-[22px] lg:h-12 lg:w-12 lg:text-[24px]">
                  <span>{item.icon}</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <h3 className="truncate text-[13px] font-bold leading-snug tracking-tight text-slate-800 sm:text-[15px] lg:text-[16.5px]">
                    {t(`home.hot.${item.key}.title`)}
                  </h3>
                  <p className="mt-0.5 truncate text-[11px] font-medium leading-normal tracking-tight text-slate-500 sm:text-[12.5px] lg:text-[13.5px]">
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
            {t('home.recommendedHeading', {
              defaultValue: RECOMMENDED_HEADING[currentLang] ?? RECOMMENDED_HEADING.ko,
            })}
          </h2>
          <Link
            to="/category"
            className="flex items-center gap-1 text-[13.5px] font-bold text-slate-500 transition-colors hover:text-emerald-700"
          >
            <span>{t('common.viewAll', { defaultValue: t('home.viewAll', { defaultValue: '전체보기' }) })}</span>
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
            {popular.map((printable, index) => (
              <PrintableCard key={printable.id} printable={printable} variant="catalog" index={index} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 mb-0 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
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
