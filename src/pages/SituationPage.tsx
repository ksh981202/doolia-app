import { ChevronRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PLAY_SOLUTIONS, playRecipePath } from '@/shared/config/playSolutions'
import { getSituation, isSituationId } from '@/shared/config/playSituations'

export function SituationPage() {
  const { situationId } = useParams()
  const situation = isSituationId(situationId) ? getSituation(situationId) : undefined
  const recipes = isSituationId(situationId)
    ? PLAY_SOLUTIONS.filter((item) => item.situation === situationId)
    : []

  if (!situation) {
    return <Navigate to="/category" replace />
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <nav className="flex flex-wrap items-center gap-1 text-sm font-bold text-muted" aria-label="breadcrumb">
        <Link to="/" className="hover:text-brand">
          홈
        </Link>
        <ChevronRight size={14} className="shrink-0" />
        <span>놀이 도구함</span>
        <ChevronRight size={14} className="shrink-0" />
        <span className="break-keep text-ink">
          {situation.emoji} {situation.title}
        </span>
      </nav>

      <header className="mt-5 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
          <span>📦 5대 상황별 놀이 도구함</span>
          <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">HIT</span>
        </p>
        <h1 className="break-keep font-display text-2xl font-semibold text-ink sm:text-3xl lg:text-4xl">
          {situation.emoji} {situation.title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{situation.headline}</p>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {recipes.map((card) => (
          <Link
            key={card.id}
            to={playRecipePath(card.situation, card.id)}
            className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                src={card.imageUrl}
                alt={card.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>

            <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
              <h2 className="text-base font-extrabold leading-snug text-slate-900 group-hover:text-emerald-800 sm:text-lg">
                {card.title}
              </h2>
              <div className="mb-3 mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>📦</span>
                <span className="truncate">{card.suppliesDetail}</span>
              </div>
              <div className="mb-3 grid grid-cols-3 gap-1.5 text-xs font-semibold">
                <span className="rounded-xl border border-amber-200/80 bg-amber-50/90 py-1.5 text-center text-amber-900">
                  👶 {card.age}
                </span>
                <span className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 py-1.5 text-center text-emerald-900">
                  ⏱️ {card.time} 컷
                </span>
                <span className="flex flex-col items-center justify-center rounded-xl border border-sky-200/80 bg-sky-50/90 py-1.5 text-center leading-tight text-sky-900">
                  🧹 뒷정리 3초
                </span>
              </div>
              <span className="mt-auto flex w-full items-center justify-center rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all group-hover:bg-emerald-700 active:scale-[0.98]">
                🖨️ 무료 도안 & 15분 레시피 보기 →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}

export default SituationPage
