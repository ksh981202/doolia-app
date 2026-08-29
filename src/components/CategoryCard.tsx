import { Link } from 'react-router-dom'
import { categoryPath } from '@/shared/config/catalog'

export type CategoryCardTopic = {
  id: string
  label: string
  emoji: string
  count: string
  effect: string
}

export function CategoryCard({ topic }: { topic: CategoryCardTopic }) {
  return (
    <Link
      to={categoryPath(topic.id)}
      className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md sm:gap-3.5 sm:p-4"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-2xl sm:h-[52px] sm:w-[52px]">
        {topic.emoji}
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-slate-200/60 bg-slate-100/80 px-2 py-0.5 text-[11px] font-extrabold text-slate-700 sm:px-2.5 sm:text-xs">
          <span className="font-black text-emerald-600">{topic.count}</span>
          개 도안
        </span>
        <h4 className="break-keep text-sm font-extrabold text-gray-900 transition-colors group-hover:text-emerald-600 sm:text-base">
          {topic.label}
        </h4>
        <p className="truncate text-xs font-semibold text-emerald-600">{topic.effect}</p>
      </div>
    </Link>
  )
}
