import { Printer } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '@/shared/config/categories'

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <Link
      to="/"
      onClick={() => {
        onNavigate?.()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="group flex shrink-0 items-center gap-2.5 py-1 focus:outline-hidden sm:gap-3"
    >
      <span className="hidden h-8 w-8 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm sm:flex sm:h-10 sm:w-10">
        <Printer size={18} strokeWidth={2.4} />
      </span>
      <span className="min-w-0 leading-none">
        {logoFailed ? (
          <span className="block text-[17px] font-bold tracking-tight text-slate-900 sm:text-xl">{BRAND.shortName}</span>
        ) : (
          <img
            src="/doolia-logo.png"
            alt={BRAND.shortName}
            className="h-6 w-auto max-w-[7.5rem] object-contain object-left sm:h-8 sm:max-w-none"
            onError={() => setLogoFailed(true)}
          />
        )}
        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          PRINTABLES
        </span>
      </span>
    </Link>
  )
}
