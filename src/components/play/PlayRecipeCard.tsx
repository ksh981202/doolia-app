import { Link } from 'react-router-dom'
import { playRecipePath, type PlaySolution } from '@/shared/config/playSolutions'
import { getSituation } from '@/shared/config/playSituations'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80'

type PlayRecipeCardProps = {
  item: PlaySolution
}

export function PlayRecipeCard({ item }: PlayRecipeCardProps) {
  const age = item.age || '3~6세'
  const situation = getSituation(item.situation)
  const situationTitle = situation?.title || '집에서 놀기'
  const situationEmoji = situation?.emoji || '🏠'

  return (
    <Link
      to={playRecipePath(item.situation, item.id)}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all hover:border-emerald-400/60 hover:shadow-md"
    >
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={item.imageUrl || FALLBACK_IMAGE}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE
            }}
          />
        </div>

        <div className="space-y-3 p-4">
          <h3 className="flex min-h-[42px] items-center justify-center text-center text-[15.5px] font-bold leading-snug break-keep text-slate-900 transition-colors group-hover:text-emerald-700">
            {item.title}
          </h3>

          <div className="grid w-full grid-cols-2 gap-2 pt-1">
            <div className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-amber-200/70 bg-amber-50/80 px-2 py-2 text-[12.5px] font-bold text-amber-900 shadow-2xs">
              <span aria-hidden>👶</span>
              <span className="truncate">{age}</span>
            </div>
            <div className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-2 py-2 text-[12.5px] font-bold text-emerald-900 shadow-2xs">
              <span aria-hidden>{situationEmoji}</span>
              <span className="truncate">{situationTitle}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-center text-[13.5px] font-bold text-white shadow-xs transition-all group-hover:bg-emerald-700 group-hover:shadow-sm">
          <span>놀이법 확인하기</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  )
}
