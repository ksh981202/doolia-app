import { ArrowLeft, ChevronRight, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ParentingTipCard } from '@/components/parenting/ParentingTipCard'
import { TipBody } from '@/components/parenting/TipBody'
import {
  categoryLabel,
  formatTipDate,
  getParentingTip,
  getRelatedParentingTips,
  type ParentingTip,
} from '@/data/parentingTipsData'
import { getPublishedTipBySlug, listPublishedTips, type AdminTip } from '@/services/adminTipService'
import { tipBodySource } from '@/shared/lib/tipBody'

export function ParentingTipDetailPage() {
  const { slug } = useParams()
  const [tip, setTip] = useState<ParentingTip | AdminTip | undefined>(() => (slug ? getParentingTip(slug) : undefined))
  const [related, setRelated] = useState<ParentingTip[]>(() => (slug ? getRelatedParentingTips(slug) : []))
  const [copied, setCopied] = useState(false)
  const [ready, setReady] = useState(() => Boolean(slug && getParentingTip(slug)))

  useEffect(() => {
    if (!slug) return
    const fallback = getParentingTip(slug)
    let cancelled = false
    setTip(fallback)
    setReady(Boolean(fallback))
    void Promise.all([getPublishedTipBySlug(slug), listPublishedTips()]).then(([found, published]) => {
      if (cancelled) return
      setTip(found ?? fallback)
      const others = published.filter((item) => item.slug !== slug)
      setRelated(others.length ? others.slice(0, 3) : getRelatedParentingTips(slug))
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!tip) return
    const previous = document.title
    document.title = `${tip.title} | DOOLIA`
    return () => {
      document.title = previous
    }
  }, [tip])

  if (!slug) return <Navigate to="/parenting-tips" replace />
  if (ready && !tip) return <Navigate to="/parenting-tips" replace />
  if (!tip) {
    return (
      <div className="px-4 py-16 text-center text-sm font-bold text-muted" aria-busy="true">
        칼럼을 불러오는 중…
      </div>
    )
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: tip.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <article className="px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex flex-wrap items-center gap-1 text-sm font-bold text-muted" aria-label="breadcrumb">
        <Link to="/" className="hover:text-brand">
          홈
        </Link>
        <ChevronRight size={14} />
        <Link to="/parenting-tips" className="hover:text-brand">
          육아·놀이 팁
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink">{tip.title}</span>
      </nav>

      <div className="mx-auto mt-6 max-w-3xl">
        <Link to="/parenting-tips" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
          <ArrowLeft size={16} />
          목록으로 돌아가기
        </Link>

        <span className="mt-6 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
          {categoryLabel(tip.category)}
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold leading-snug text-ink sm:text-4xl">{tip.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500">
          <time dateTime={tip.publishedAt}>{formatTipDate(tip.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{tip.readMinutes}분 읽기</span>
          <button
            type="button"
            onClick={() => void share()}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-extrabold text-ink hover:bg-slate-50"
          >
            <Share2 size={14} />
            {copied ? '링크 복사됨' : '공유하기'}
          </button>
        </div>

        <img
          src={tip.thumbnail}
          alt={tip.thumbnailAlt}
          className="mt-8 w-full rounded-2xl object-cover sm:aspect-[16/9]"
        />

        <TipBody source={tipBodySource(tip)} className="mt-10" />

        <aside className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-extrabold text-emerald-800">부모 실행 요약</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-emerald-950 sm:text-base">
            {tip.takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>

        <Link
          to="/parenting-tips"
          className="mt-10 inline-flex h-11 items-center rounded-full border border-emerald-200 bg-white px-5 text-sm font-extrabold text-emerald-700 hover:bg-emerald-50"
        >
          목록으로 돌아가기
        </Link>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto mt-16 max-w-6xl">
          <h2 className="font-display text-2xl font-semibold text-ink">관련 육아 팁 더보기</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {related.map((item) => (
              <ParentingTipCard key={item.slug} tip={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}

export default ParentingTipDetailPage
