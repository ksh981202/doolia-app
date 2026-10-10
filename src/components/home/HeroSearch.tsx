import { Search } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { QuickFinder } from '@/components/home/QuickFinder'
import { categorySearchPath } from '@/shared/config/catalog'
import { cn } from '@/shared/lib/cn'

const HERO_TAGS = [
  { id: 'dino', q: '공룡' },
  { id: 'unicorn', q: '유니콘' },
  { id: 'car', q: '자동차' },
  { id: 'imagination', q: '상상나라' },
  { id: 'animals', q: '귀여운 동물' },
] as const

export function HeroSearch() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const goToSearch = (keyword: string) => {
    const next = keyword.trim()
    if (!next) return
    navigate(categorySearchPath(next))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    goToSearch(query)
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
            placeholder={t('header.searchPlaceholder', '도안 이름, 놀이 아이디어를 검색하세요')}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/80 sm:text-base"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-full bg-brand-dark px-5 text-sm font-extrabold text-white hover:bg-brand-deep"
          >
            {t('home.searchBtn', '검색')}
          </button>
        </form>

        <QuickFinder />

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {HERO_TAGS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => goToSearch(tag.q)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-bold',
                query === tag.q
                  ? 'bg-brand-dark text-white'
                  : 'bg-white text-brand-deep ring-1 ring-brand-dark/20 hover:bg-brand-soft',
              )}
            >
              {t(`home.tags.${tag.id}`, { defaultValue: tag.q })}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
