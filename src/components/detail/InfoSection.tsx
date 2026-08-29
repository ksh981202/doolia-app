import { Check } from 'lucide-react'
import {
  detailAgeLabel,
  detailBrandBadge,
  detailTitle,
  educationalBenefits,
  parentCoachingTips,
} from '@/shared/lib/detailCopy'
import { useDownloadStore } from '@/shared/store/useDownloadStore'
import type { Printable } from '@/types/printable'

export function InfoSection({ printable }: { printable: Printable }) {
  const openModal = useDownloadStore((state) => state.openModal)
  const brand = detailBrandBadge(printable)
  const title = detailTitle(printable)
  const age = detailAgeLabel(printable)
  const benefits = educationalBenefits(printable)
  const tips = parentCoachingTips(printable)

  return (
    <aside>
      <div className="mb-2 inline-flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
          {brand.emoji} {brand.label}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{age}</span>
      </div>
      <h1 className="mb-4 break-keep text-3xl font-black leading-snug text-gray-900">{title}</h1>

      <button
        type="button"
        onClick={() => openModal(printable)}
        className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
      >
        🖨️ A4 PDF 무료 인쇄하기
      </button>
      <p className="mt-2 text-center text-xs text-slate-400">광고 3초 후 고화질 PDF를 받을 수 있어요</p>

      <div className="my-4 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4">
        <p className="mb-3 text-xs font-extrabold tracking-wide text-slate-500">핵심 두뇌 발달 효과</p>
        <div className="space-y-2">
          {benefits.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check size={14} strokeWidth={2.6} />
              </span>
              <span className="text-sm font-semibold text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-amber-50/80 to-emerald-50/80 p-5 text-gray-800 shadow-sm">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-emerald-900">
          💡 부모님을 위한 1분 놀이 코칭
        </p>
        <ul className="space-y-2.5">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-2.5 text-sm leading-6">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="font-semibold">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
