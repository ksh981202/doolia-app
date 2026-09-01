import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured } from '@/lib/supabase'
import { listAdminPrintables } from '@/services/adminPrintableService'
import { listAdminTips } from '@/services/adminTipService'

export function AdminDashboardPage() {
  const [printables, setPrintables] = useState(0)
  const [published, setPublished] = useState(0)
  const [tips, setTips] = useState(0)
  const [tipDrafts, setTipDrafts] = useState(0)

  useEffect(() => {
    void Promise.all([listAdminPrintables(), listAdminTips()]).then(([items, columns]) => {
      setPrintables(items.length)
      setPublished(items.filter((item) => item.published).length)
      setTips(columns.length)
      setTipDrafts(columns.filter((item) => !item.published).length)
    })
  }, [])

  const cards = [
    { label: '전체 도안', value: printables, to: '/admin/printables' },
    { label: '발행 중 도안', value: published, to: '/admin/printables' },
    { label: '육아 팁', value: tips, to: '/admin/tips' },
    { label: '미발행 팁', value: tipDrafts, to: '/admin/tips' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">대시보드</h1>
        <p className="mt-1 text-sm text-muted">
          도안·PDF·육아 팁을 등록하고 발행 상태를 관리합니다.{' '}
          {isSupabaseConfigured ? 'Supabase 연결됨' : '로컬 모드 (Supabase 미설정 — 브라우저에 임시 저장)'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm hover:border-emerald-200"
          >
            <p className="text-xs font-bold text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700">{card.value}</p>
          </Link>
        ))}
      </div>

      <Link
        to="/admin/printables/upload"
        className="block rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:border-emerald-200"
      >
        <p className="text-sm font-extrabold text-ink">대량 업로드 파이프라인</p>
        <p className="mt-1 text-sm text-muted">TSV 메타데이터와 흑백/컬러 이미지를 드롭해 파일명으로 짝을 맞춘 뒤 일괄 등록합니다.</p>
      </Link>

      <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-sm leading-6 text-slate-600">
        <p className="font-extrabold text-ink">운영 체크리스트</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>대량 등록은 TSV + 이미지 매칭 파이프라인(/admin/printables/upload)을 사용</li>
          <li>Supabase 마이그레이션 20260829140000_admin_parenting_tips.sql 적용</li>
          <li>Authentication 사용자 App Metadata에 role=admin 설정</li>
          <li>Storage 버킷 printables, parenting-tips 업로드 권한 확인</li>
        </ul>
      </div>
    </div>
  )
}

export default AdminDashboardPage
