import { Navigate, useParams } from 'react-router-dom'
import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { PlayRecipeCard } from '@/components/play/PlayRecipeCard'
import { PLAY_SOLUTIONS } from '@/shared/config/playSolutions'
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

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((card) => (
          <PlayRecipeCard key={card.id} item={card} />
        ))}
      </section>
    </div>
  )
}

export default SituationPage
