import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminPendingCounts } from '@/admin/useAdminPendingCounts'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { listAdminPrintables } from '@/services/adminPrintableService'
import { listAdminTips } from '@/services/adminTipService'
import { printablePath } from '@/shared/config/catalog'
import { cn } from '@/shared/lib/cn'
import { getDisplayImageUrl } from '@/shared/utils/printableAssets'

interface TrafficStat {
  channel: string
  visits_count: number
}

interface PopularPrintable {
  id: string
  slug: string
  title_ko: string
  image_color_url: string
  download_count: number
  likes_count: number
}

interface SearchKeywordLog {
  id: string
  keyword: string
  result_count: number
  search_count: number
}

const CHANNEL_LABELS: Record<string, { label: string; color: string }> = {
  google: { label: '구글 검색 (SEO)', color: 'bg-blue-500' },
  naver: { label: '네이버 검색/블로그', color: 'bg-emerald-500' },
  instagram: { label: '인스타그램', color: 'bg-pink-400' },
  pinterest: { label: '핀터레스트', color: 'bg-rose-400' },
  direct: { label: '직접 접속 / 북마크', color: 'bg-slate-400' },
  other: { label: '기타 외부 사이트', color: 'bg-amber-400' },
}

const KPI_CARD =
  'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300'
const KPI_LABEL = 'text-[11.5px] font-semibold tracking-wide text-slate-400 uppercase'
const KPI_VALUE = 'mt-2 text-[26px] font-bold tracking-tight'
const KPI_UNIT = 'ml-1 text-[13px] font-normal text-slate-400'
const SECTION_CARD = 'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6'
const SECTION_TITLE = 'text-[15px] font-bold tracking-tight text-slate-800 sm:text-[16px]'
const EMPTY_STATE =
  'rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-[13px] font-medium leading-relaxed text-slate-400'
const KEYWORD_ROW =
  'flex items-center justify-between gap-3 rounded-xl border border-slate-100/80 bg-slate-50/70 p-2.5 sm:p-3'

function rankBadgeClass(idx: number) {
  return cn(
    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold',
    idx === 0
      ? 'bg-amber-100 text-amber-700'
      : idx === 1
        ? 'bg-sky-100 text-sky-700'
        : idx === 2
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-500',
  )
}

export function AdminDashboardPage() {
  const { pendingReportsCount, pendingInquiriesCount } = useAdminPendingCounts()
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({
    totalPrintables: 0,
    publishedPrintables: 0,
    parentingTips: 0,
    todayVisits: 0,
    todayDownloads: 0,
  })
  const [trafficStats, setTrafficStats] = useState<TrafficStat[]>([])
  const [popularPrintables, setPopularPrintables] = useState<PopularPrintable[]>([])
  const [popularKeywords, setPopularKeywords] = useState<SearchKeywordLog[]>([])
  const [missingKeywords, setMissingKeywords] = useState<SearchKeywordLog[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadDashboardData() {
      setLoading(true)
      try {
        const [printables, tips, popularKeywordRes, missingKeywordRes] = await Promise.all([
          listAdminPrintables(),
          listAdminTips(),
          supabase
            ? supabase
                .from('search_keyword_logs')
                .select('id, keyword, result_count, search_count')
                .gt('result_count', 0)
                .order('search_count', { ascending: false })
                .limit(6)
            : Promise.resolve({ data: [] as SearchKeywordLog[] }),
          supabase
            ? supabase
                .from('search_keyword_logs')
                .select('id, keyword, result_count, search_count')
                .eq('result_count', 0)
                .order('search_count', { ascending: false })
                .limit(6)
            : Promise.resolve({ data: [] as SearchKeywordLog[] }),
        ])
        if (cancelled) return

        const published = printables.filter((item) => item.published !== false)
        const totalDownloads = printables.reduce((sum, item) => sum + (item.downloads || 0), 0)
        const topFive: PopularPrintable[] = [...published]
          .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
          .slice(0, 5)
          .map((item) => ({
            id: item.id,
            slug: item.slug,
            title_ko: item.title_ko,
            image_color_url: getDisplayImageUrl(item.image_color_url || item.image_bw_url || '', 240),
            download_count: item.downloads || 0,
            likes_count: item.likes || 0,
          }))

        setCounts({
          totalPrintables: printables.length,
          publishedPrintables: published.length,
          parentingTips: tips.length,
          todayVisits: 0,
          todayDownloads: totalDownloads,
        })
        setTrafficStats([])
        setPopularPrintables(topFive)
        setPopularKeywords(popularKeywordRes.data || [])
        setMissingKeywords(missingKeywordRes.data || [])
      } catch (err) {
        console.error('Failed to fetch admin dashboard stats:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadDashboardData()
    return () => {
      cancelled = true
    }
  }, [])

  const totalTrafficVisits = trafficStats.reduce((sum, item) => sum + item.visits_count, 0) || 1

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold tracking-tight text-slate-800 sm:text-[24px]">
            둘리아 종합 관제 대시보드
          </h1>
          <p className="mt-1.5 text-[13.5px] font-medium leading-relaxed text-slate-500">
            실시간 트래픽 유입, 인기 도안 순위, 고객 문의를 한눈에 모니터링합니다.
          </p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11.5px] font-medium',
            isSupabaseConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
          )}
        >
          {isSupabaseConfigured ? '● 시스템 정상 가동 중' : '● 로컬 데이터 모드'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
        <div className={KPI_CARD}>
          <p className={KPI_LABEL}>오늘 방문자</p>
          <p className={cn(KPI_VALUE, 'text-blue-600')}>
            {loading ? '—' : counts.todayVisits.toLocaleString()}
            <span className={KPI_UNIT}>명</span>
          </p>
        </div>

        <div className={KPI_CARD}>
          <p className={KPI_LABEL}>누적 다운/인쇄</p>
          <p className={cn(KPI_VALUE, 'text-emerald-600')}>
            {loading ? '—' : counts.todayDownloads.toLocaleString()}
            <span className={KPI_UNIT}>회</span>
          </p>
        </div>

        <div className={KPI_CARD}>
          <p className={KPI_LABEL}>발행 도안</p>
          <p className={cn(KPI_VALUE, 'text-slate-800')}>
            {loading ? '—' : counts.publishedPrintables}
            <span className={KPI_UNIT}>/ {counts.totalPrintables}</span>
          </p>
        </div>

        <div className={KPI_CARD}>
          <p className={KPI_LABEL}>육아 매거진</p>
          <p className={cn(KPI_VALUE, 'text-slate-800')}>
            {loading ? '—' : counts.parentingTips}
            <span className={KPI_UNIT}>편</span>
          </p>
        </div>

        <Link
          to="/admin/reports"
          className={cn(
            KPI_CARD,
            pendingReportsCount > 0 && 'border-rose-200/80 bg-rose-50/40 hover:border-rose-300',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className={KPI_LABEL}>저작권 접수</p>
            {pendingReportsCount > 0 && (
              <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">N</span>
            )}
          </div>
          <p className={cn(KPI_VALUE, pendingReportsCount > 0 ? 'text-rose-600' : 'text-slate-800')}>
            {pendingReportsCount}
            <span className={KPI_UNIT}>건</span>
          </p>
        </Link>

        <Link
          to="/admin/inquiries"
          className={cn(
            KPI_CARD,
            pendingInquiriesCount > 0 && 'border-amber-200/80 bg-amber-50/40 hover:border-amber-300',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className={KPI_LABEL}>일반 문의</p>
            {pendingInquiriesCount > 0 && (
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">N</span>
            )}
          </div>
          <p className={cn(KPI_VALUE, pendingInquiriesCount > 0 ? 'text-amber-600' : 'text-slate-800')}>
            {pendingInquiriesCount}
            <span className={KPI_UNIT}>건</span>
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <div className={cn(SECTION_CARD, 'space-y-5 lg:col-span-5')}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={cn(SECTION_TITLE, 'flex items-center gap-2')}>
              <span className="text-[15px]">🧭</span> 유입 채널 분석 (오늘)
            </h2>
            <span className="text-[11.5px] font-medium text-slate-400">실시간 집계</span>
          </div>

          {trafficStats.length === 0 ? (
            <div className={EMPTY_STATE}>오늘 기록된 외부 유입 데이터가 아직 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {trafficStats.map((stat) => {
                const info = CHANNEL_LABELS[stat.channel] || { label: stat.channel, color: 'bg-slate-400' }
                const percentage = Math.round((stat.visits_count / totalTrafficVisits) * 100)

                return (
                  <div key={stat.channel} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13.5px] font-semibold text-slate-700">{info.label}</span>
                      <span className="text-[12px] font-medium text-slate-500">
                        {stat.visits_count}명 ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', info.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className={cn(SECTION_CARD, 'space-y-5 lg:col-span-7')}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={cn(SECTION_TITLE, 'flex items-center gap-2')}>
              <span className="text-[15px]">🔥</span> 인기 도안 TOP 5 (다운로드/인쇄 기준)
            </h2>
            <Link
              to="/admin/printables"
              className="text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              전체 도안 보기 →
            </Link>
          </div>

          {popularPrintables.length === 0 ? (
            <div className={EMPTY_STATE}>{loading ? '도안 순위를 불러오는 중…' : '발행된 도안이 없습니다.'}</div>
          ) : (
            <div className="space-y-1">
              {popularPrintables.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl px-1.5 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={rankBadgeClass(idx)}>{idx + 1}</span>
                    <img
                      src={item.image_color_url}
                      alt={item.title_ko}
                      className="h-11 w-11 shrink-0 rounded-lg border border-slate-100 bg-slate-50 object-cover"
                    />
                    <div className="min-w-0">
                      <Link
                        to={printablePath(item.slug)}
                        className="block truncate text-[13.5px] font-semibold text-slate-800 transition-colors hover:text-emerald-600"
                      >
                        {item.title_ko}
                      </Link>
                      <p className="mt-0.5 font-mono text-[11.5px] font-medium tracking-wide text-slate-400">
                        {item.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 text-right">
                    <div>
                      <span className="block text-[11px] font-medium text-slate-400">다운로드</span>
                      <span className="text-[13px] font-bold text-emerald-600">{item.download_count || 0}회</span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-slate-400">좋아요</span>
                      <span className="text-[13px] font-bold text-rose-500">{item.likes_count || 0}개</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <div className={cn(SECTION_CARD, 'space-y-4')}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={cn(SECTION_TITLE, 'flex items-center gap-2')}>
              <span className="text-[15px]">🔍</span> 유저 인기 검색어 TOP
            </h2>
            <span className="text-[11.5px] font-medium text-slate-400">결과 있는 검색</span>
          </div>

          {popularKeywords.length === 0 ? (
            <div className={EMPTY_STATE}>아직 집계된 인기 검색어가 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {popularKeywords.map((item, idx) => (
                <div key={item.id} className={KEYWORD_ROW}>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={rankBadgeClass(idx)}>{idx + 1}</span>
                    <p className="truncate text-[13.5px] font-semibold text-slate-700">{item.keyword}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      도안 {item.result_count}건
                    </span>
                    <span className="text-[11.5px] font-medium text-slate-500">{item.search_count}회 검색</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={cn(
            SECTION_CARD,
            'space-y-4 border-rose-100/70 bg-gradient-to-b from-rose-50/30 to-white',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className={cn(SECTION_TITLE, 'flex items-center gap-2')}>
              <span className="text-[15px]">⚠️</span> 미보유 검색어 (도안 제작 큐)
            </h2>
            <span className="text-[11.5px] font-medium text-rose-400">결과 0건</span>
          </div>

          {missingKeywords.length === 0 ? (
            <div className={EMPTY_STATE}>미보유 검색어가 아직 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {missingKeywords.map((item, idx) => (
                <div key={item.id} className={KEYWORD_ROW}>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={rankBadgeClass(idx)}>{idx + 1}</span>
                    <p className="truncate text-[13.5px] font-semibold text-slate-700">{item.keyword}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                      도안 없음
                    </span>
                    <span className="text-[11.5px] font-medium text-slate-500">{item.search_count}회 찾음</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
