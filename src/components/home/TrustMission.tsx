import { BadgeCheck, HeartHandshake, Infinity as InfinityIcon, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    icon: InfinityIcon,
    title: '100% 영구 무료',
    body: '회원가입 없이 핵심 도안을 계속 무료로 인쇄할 수 있습니다.',
  },
  {
    icon: Sparkles,
    title: '300 DPI 고해상도',
    body: 'A4 규격 선화 PDF로 가정과 교실에서 또렷하게 출력됩니다.',
  },
  {
    icon: HeartHandshake,
    title: '1분 부모 코칭 팁',
    body: '인쇄 후 바로 쓸 수 있는 짧은 놀이 코칭으로 하루 10분을 채워 보세요.',
  },
]

export function TrustMission() {
  return (
    <section className="bg-page py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 ring-1 ring-emerald-100">
                <feature.icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{feature.body}</p>
            </article>
          ))}
        </div>

        <article className="mt-6 rounded-[28px] border border-emerald-100 bg-emerald-50/50 p-8 shadow-sm sm:p-10">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-1 shrink-0 text-emerald-600" size={28} />
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">
                우리의 미션: 아이 상태에 맞춘 두뇌·습관 솔루션
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base">
                DOOLIA는 산만한 집중력, 감정 표현, 아침 루틴처럼 아이가 지금 필요한 지점에 맞춰
                하루 10분짜리 A4 활동지를 고를 수 있도록, 고화질 프린터블을 계속 열어 둡니다.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
