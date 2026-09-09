import { Link, Navigate, useParams } from 'react-router-dom'
import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { PLAY_SOLUTIONS, playRecipePath } from '@/shared/config/playSolutions'
import { getSituation, isSituationId } from '@/shared/config/playSituations'

export function SituationPage() {
  const { situationId } = useParams()
  const browseAll = situationId === 'all'
  const situation = isSituationId(situationId) ? getSituation(situationId) : undefined
  const recipes = browseAll
    ? PLAY_SOLUTIONS
    : isSituationId(situationId)
      ? PLAY_SOLUTIONS.filter((item) => item.situation === situationId)
      : []

  if (!browseAll && !situation) {
    return <Navigate to="/category" replace />
  }

  const title = browseAll ? '맞춤 놀이 도구함' : (situation?.title ?? '')
  const crumbs = browseAll
    ? [
        { label: '홈', to: '/' },
        { label: '맞춤 놀이 도구함' },
      ]
    : [
        { label: '홈', to: '/' },
        { label: '맞춤 놀이 도구함', to: '/situation/all' },
        { label: title },
      ]

  return (
    <div>
      <SubpageHeader crumbs={crumbs} title={title} emoji={browseAll ? '📦' : situation?.emoji} />

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {recipes.map((card) => (
          <Link
            key={card.id}
            to={playRecipePath(card.situation, card.id)}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <img
                src={card.imageUrl}
                alt={card.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>

            <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
              <div>
                <h2 className="min-h-[44px] text-base font-bold leading-snug text-slate-900 line-clamp-2 transition-colors group-hover:text-emerald-700">
                  {card.title}
                </h2>
                <div className="mb-4 mt-3 grid grid-cols-2 gap-2">
                  <span className="flex items-center justify-center gap-1 rounded-lg border border-amber-200/80 bg-amber-50 px-2.5 py-1.5 text-sm font-medium text-amber-900">
                    <span>👶</span>
                    <span>{card.age}</span>
                  </span>
                  <span className="flex items-center justify-center gap-1 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-900">
                    <span className="truncate">{card.situationLabel || '🏠 집에서 놀기'}</span>
                  </span>
                </div>
              </div>
              <span className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-all group-hover:bg-emerald-700">
                <span>👉</span>
                <span>바로 확인하기</span>
                <span className="text-emerald-200">→</span>
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}

export default SituationPage
