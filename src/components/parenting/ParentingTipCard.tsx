import { Link } from 'react-router-dom'
import {
  categoryLabel,
  formatTipDate,
  parentingTipPath,
  type ParentingTip,
} from '@/data/parentingTipsData'
import { cn } from '@/shared/lib/cn'

const BADGE: Record<ParentingTip['category'], string> = {
  motor: 'bg-emerald-50 text-emerald-700',
  cognition: 'bg-blue-50 text-blue-700',
  emotion: 'bg-violet-50 text-violet-700',
  homeschool: 'bg-amber-50 text-amber-800',
}

export function ParentingTipCard({ tip }: { tip: ParentingTip }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
      <Link to={parentingTipPath(tip.slug)} className="flex h-full flex-col">
        <div className="relative">
          <img
            src={tip.thumbnail}
            alt={tip.thumbnailAlt}
            className="aspect-[16/10] w-full object-cover"
            loading="lazy"
          />
          <span
            className={cn(
              'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-extrabold',
              BADGE[tip.category],
            )}
          >
            {categoryLabel(tip.category)}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-ink sm:text-lg">{tip.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{tip.excerpt}</p>
          <p className="mt-3 text-xs font-bold text-slate-500">
            {formatTipDate(tip.publishedAt)} · {tip.readMinutes}분 읽기
          </p>
          <span className="mt-auto pt-4 text-sm font-extrabold text-emerald-600">자세히 보기 →</span>
        </div>
      </Link>
    </article>
  )
}
