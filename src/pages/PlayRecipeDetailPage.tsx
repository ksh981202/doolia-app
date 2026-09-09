import { Navigate, useParams } from 'react-router-dom'
import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { usePrintablesQuery } from '@/features/gallery/model/usePrintablesQuery'
import { matchesQuery } from '@/services/printableService'
import { getPlaySolution, situationEmoji } from '@/shared/config/playSolutions'
import { getSituation, isSituationId, situationPath } from '@/shared/config/playSituations'
import { useDownloadStore } from '@/shared/store/useDownloadStore'

export function PlayRecipeDetailPage() {
  const { situationId, recipeId } = useParams()
  const { data } = usePrintablesQuery()
  const openModal = useDownloadStore((state) => state.openModal)
  const recipe = getPlaySolution(recipeId)
  const situation = isSituationId(situationId) ? getSituation(situationId) : undefined

  if (!situation || !recipe || recipe.situation !== situation.id) {
    return <Navigate to={isSituationId(situationId) ? situationPath(situationId) : '/category'} replace />
  }

  const printable = (data ?? []).find((item) => matchesQuery(item, recipe.printQuery)) ?? data?.[0] ?? null

  return (
    <article>
      <SubpageHeader
        crumbs={[
          { label: '홈', to: '/' },
          { label: '맞춤 놀이 도구함', to: '/situation/all' },
          { label: situation.title, to: situationPath(situation.id) },
          { label: recipe.title },
        ]}
        title={recipe.title}
        emoji={situation.emoji}
      />

      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="aspect-[16/10] overflow-hidden bg-slate-100">
            <img src={recipe.imageUrl} alt={recipe.title} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-6 p-6 sm:p-8">
            <div>
              <p className="text-xs font-extrabold text-emerald-700">{recipe.situationLabel}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{recipe.desc}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2.5 text-center text-[11px] font-bold text-slate-700 sm:text-xs">
                👶 {recipe.age}
              </span>
              <span className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2.5 text-center text-[11px] font-bold text-slate-700 sm:text-xs">
                ⏱️ {recipe.time}
              </span>
              <span className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2.5 text-center text-[11px] font-bold text-slate-700 sm:text-xs">
                {situationEmoji(recipe.situation)} {recipe.material}
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-slate-700">
              <p className="font-extrabold text-emerald-800">📦 0원 준비물</p>
              <p className="mt-1">{recipe.suppliesDetail}</p>
            </div>

            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-slate-700 sm:text-base">{step}</p>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={() => {
                if (printable) openModal(printable)
              }}
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-800"
            >
              {printable ? '이 놀이 도안 인쇄하기 →' : '준비된 도안이 곧 추가돼요'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default PlayRecipeDetailPage
