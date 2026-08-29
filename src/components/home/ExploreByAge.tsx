import { Link } from 'react-router-dom'

const AGE_CARDS = [
  {
    age: '2-3',
    emoji: '👶',
    title: '만 2~3세 (영아)',
    subtitle: '첫 시작 & 감각 자극',
    tags: ['#첫색칠공부', '#기초선따기', '#쉬운오리기', '#감정모양'],
    cta: '만 2~3세 도안 모아보기 ➔',
    className: 'bg-emerald-50/60 border border-emerald-100',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    age: '4-5',
    emoji: '👦',
    title: '만 4~5세 (유아)',
    subtitle: '두뇌 자극 & 소근육 발달',
    tags: ['#쉬운미로', '#숨은그림찾기', '#숫자쓰기', '#루틴차트'],
    cta: '만 4~5세 도안 모아보기 ➔',
    className: 'bg-blue-50/60 border border-blue-100',
    buttonClass: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    age: '6-7',
    emoji: '👧',
    title: '만 6~7세+ (취학전)',
    subtitle: '사고력 & 기초 학습',
    tags: ['#복잡한미로', '#점잇기', '#알파벳쓰기', '#보드게임'],
    cta: '만 6~7세 도안 모아보기 ➔',
    className: 'bg-purple-50/60 border border-purple-100',
    buttonClass: 'bg-violet-600 hover:bg-violet-700',
  },
] as const

export function ExploreByAge() {
  return (
    <section id="explore-by-age" className="scroll-mt-24 bg-white py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">
          👶 아이 연령별 맞춤 탐색
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted">
          우리 아이 나이에 딱 맞는 발달 단계별 도안을 골라보세요.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {AGE_CARDS.map((card) => (
            <article
              key={card.age}
              className={`flex h-full min-h-[220px] flex-col justify-between rounded-2xl p-6 ${card.className}`}
            >
              <div>
                <p className="text-3xl">{card.emoji}</p>
                <h3 className="mt-3 text-lg font-extrabold text-gray-900">{card.title}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">{card.subtitle}</p>
                <div className="mb-5 mt-4 flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-black/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={`/category?age=${card.age}`}
                className={`inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-extrabold text-white transition ${card.buttonClass}`}
              >
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
