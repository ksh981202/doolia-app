import { Link } from 'react-router-dom'
import { ParentingTipCard } from '@/components/parenting/ParentingTipCard'
import { PARENTING_TIPS } from '@/data/parentingTipsData'

export function ParentingTipsPreview() {
  const tips = PARENTING_TIPS.slice(0, 3)

  return (
    <section id="parenting-tips" className="scroll-mt-24 bg-page py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">💡 부모를 위한 육아·놀이 팁</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              아이의 감정 조절, 소근육 발달, 올바른 생활 습관을 돕는 유용한 놀이 정보 가이드입니다.
            </p>
          </div>
          <Link
            to="/parenting-tips"
            className="shrink-0 text-sm font-extrabold text-emerald-600 hover:text-emerald-700"
          >
            전체 육아·놀이 팁 보기 →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {tips.map((tip) => (
            <ParentingTipCard key={tip.slug} tip={tip} />
          ))}
        </div>
      </div>
    </section>
  )
}
