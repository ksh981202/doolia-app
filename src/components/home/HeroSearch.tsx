import { Search } from 'lucide-react'
import type { FormEvent } from 'react'
import { QuickFinder } from '@/components/home/QuickFinder'
import { POPULAR_KEYWORDS } from '@/shared/config/categories'
import { cn } from '@/shared/lib/cn'
import { scrollToPopularGallery, useGalleryStore } from '@/shared/store/useGalleryStore'

export function HeroSearch() {
  const query = useGalleryStore((state) => state.query)
  const setQuery = useGalleryStore((state) => state.setQuery)
  const applyKeyword = useGalleryStore((state) => state.applyKeyword)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setQuery(query.trim())
    scrollToPopularGallery()
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ecfdf5_0%,#f7fffb_62%,#ffffff_100%)]">
      <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-brand/15 blur-2xl" />
      <div className="pointer-events-none absolute -right-10 top-24 h-56 w-56 rounded-full bg-emerald-200/40 blur-2xl" />
      <div className="mx-auto max-w-5xl px-4 pb-12 pt-14 text-center sm:px-6 sm:pb-14 sm:pt-20">
        <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-dark ring-1 ring-brand-dark/15">
          PRINT & PLAY
        </span>
        <h1 className="mt-4 font-display text-[28px] font-semibold leading-snug text-ink sm:text-4xl lg:text-[42px]">
          우리 아이 맞춤형 A4 두뇌·습관 솔루션
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          집중력, 감정 표현, 아침 루틴까지! 아이에게 필요한 활동지를 300DPI PDF로 즉시 인쇄하세요.
        </p>

        <form
          onSubmit={submit}
          className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-line bg-white p-2 shadow-[0_18px_40px_rgba(5,150,105,0.12)]"
        >
          <Search className="ml-3 shrink-0 text-muted" size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="집중력, 감정, 아침 루틴을 검색해 보세요"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/80 sm:text-base"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-full bg-brand-dark px-5 text-sm font-extrabold text-white hover:bg-brand-deep"
          >
            검색
          </button>
        </form>

        <QuickFinder />

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {POPULAR_KEYWORDS.map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => {
                applyKeyword(keyword)
                scrollToPopularGallery()
              }}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-bold',
                query === keyword
                  ? 'bg-brand-dark text-white'
                  : 'bg-white text-brand-deep ring-1 ring-brand-dark/20 hover:bg-brand-soft',
              )}
            >
              #{keyword}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
