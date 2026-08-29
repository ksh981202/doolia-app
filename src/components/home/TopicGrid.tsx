import { CategoryCard } from '@/components/CategoryCard'
import { BRAND_PILLARS, NEED_FILTERS } from '@/shared/config/categories'
import { cn } from '@/shared/lib/cn'
import { useGalleryStore } from '@/shared/store/useGalleryStore'

export function TopicGrid() {
  const needFilter = useGalleryStore((state) => state.needFilter)
  const applyNeedFilter = useGalleryStore((state) => state.applyNeedFilter)
  const active = NEED_FILTERS.find((item) => item.id === needFilter)

  return (
    <section id="topic-explorer" className="scroll-mt-24 bg-page py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">
          카테고리 탐색
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted">
          아이의 상태와 목표에 맞춰 Kids · Brain · Family 솔루션을 골라 보세요.
        </p>
        {active ? (
          <p className="mt-3 text-center text-sm font-bold text-brand-dark">
            {active.emoji} {active.label}에 맞는 카테고리
            <button
              type="button"
              onClick={() => applyNeedFilter(active.id)}
              className="ml-2 underline-offset-2 hover:underline"
            >
              전체 보기
            </button>
          </p>
        ) : null}

        <div className="mt-10 space-y-6">
          {BRAND_PILLARS.map((pillar) => {
            const topics = active
              ? pillar.topics.filter((topic) =>
                  (active.topicIds as readonly string[]).includes(topic.id),
                )
              : pillar.topics
            if (topics.length === 0) return null

            const gridClass =
              topics.length <= 3
                ? 'grid grid-cols-1 gap-4 md:grid-cols-3'
                : topics.length === 4
                  ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'
                  : 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5'

            return (
              <div
                key={pillar.id}
                id={`pillar-${pillar.id}`}
                className={cn(
                  'scroll-mt-28 rounded-[28px] border p-5 sm:p-7',
                  pillar.theme.panel,
                )}
              >
                <div className="mb-6">
                  <p className={cn('text-xs font-bold uppercase tracking-[0.16em]', pillar.theme.accent)}>
                    {pillar.emoji} {pillar.brand}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-gray-800 sm:text-2xl">
                    {pillar.subtitle}
                  </h3>
                </div>

                <div className={gridClass}>
                  {topics.map((topic) => (
                    <CategoryCard key={topic.id} topic={topic} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
