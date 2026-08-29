import { Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BRAND } from '@/shared/config/categories'

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/"
      onClick={() => {
        onNavigate?.()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="flex items-center gap-3 justify-self-start"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
        <Printer size={18} strokeWidth={2.4} />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[17px] font-bold tracking-tight text-gray-900 sm:text-xl">
          {BRAND.shortName}
        </span>
        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-900">
          PRINTABLES
        </span>
      </span>
    </Link>
  )
}
