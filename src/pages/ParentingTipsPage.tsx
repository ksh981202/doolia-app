import { ChevronRight, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ParentingTipCard } from '@/components/parenting/ParentingTipCard'
import {
  PARENTING_TIP_CATEGORIES,
  PARENTING_TIPS,
  type ParentingTipCategoryId,
} from '@/data/parentingTipsData'
import { cn } from '@/shared/lib/cn'

export function ParentingTipsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ParentingTipCategoryId>('all')

  useEffect(() => {
    const previous = document.title
    document.title = '육아·놀이 팁 | DOOLIA'
    return () => {
      document.title = previous
    }
  }, [])

  const items = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return PARENTING_TIPS.filter((tip) => {
      const byCategory = category === 'all' || tip.category === category
      if (!byCategory) return false
      if (!keyword) return true
      const blob = [
        tip.title,
        tip.excerpt,
        ...tip.blocks.map((block) => ('text' in block ? block.text : block.items.join(' '))),
      ].join(' ')
      return blob.toLowerCase().includes(keyword)
    })
  }, [category, query])

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <nav className="flex flex-wrap items-center gap-1 text-sm font-bold text-muted" aria-label="breadcrumb">
        <Link to="/" className="hover:text-brand">
          홈
        </Link>
        <ChevronRight size={14} className="shrink-0" />
        <span className="break-keep text-ink">육아·놀이 팁</span>
      </nav>

      <header className="mt-5 max-w-3xl">
        <h1 className="break-keep font-display text-2xl font-semibold text-ink sm:text-3xl lg:text-4xl">📖 육아·놀이 팁</h1>
        <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
          아이의 감정 조절, 소근육 발달, 올바른 생활 습관을 돕는 유용한 놀이 정보 가이드입니다.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5">
          <label className="flex items-center gap-2 rounded-full border border-line bg-page px-4 py-2">
            <Search size={18} className="shrink-0 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="키워드로 육아 팁 검색"
              className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="주제 필터">
            {PARENTING_TIP_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={category === item.id}
                onClick={() => setCategory(item.id)}
                className={cn(
                  'inline-flex min-h-[40px] items-center rounded-full px-3.5 py-2 text-sm transition sm:px-4',
                  category === item.id
                    ? 'bg-emerald-600 font-bold text-white'
                    : 'bg-white font-semibold text-ink/70 ring-1 ring-line hover:text-ink',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center text-sm font-semibold text-muted">
            해당 조건의 육아 팁이 아직 없습니다. 다른 주제를 선택해 보세요.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((tip) => (
              <ParentingTipCard key={tip.slug} tip={tip} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ParentingTipsPage
