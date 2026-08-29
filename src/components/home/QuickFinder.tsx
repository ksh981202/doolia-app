import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FINDER_AGES,
  FINDER_THEMES,
  FINDER_TYPES,
  buildFinderPath,
} from '@/shared/config/smartFilters'
import { cn } from '@/shared/lib/cn'

export function QuickFinder() {
  const navigate = useNavigate()
  const [age, setAge] = useState<string | null>(null)
  const [theme, setTheme] = useState<string | null>(null)
  const [type, setType] = useState<string | null>(null)

  const toggle = (current: string | null, next: string) => (current === next ? null : next)

  const find = () => {
    navigate(buildFinderPath(age, theme, type))
  }

  return (
    <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-emerald-100 bg-white/90 p-4 text-left shadow-[0_18px_40px_rgba(5,150,105,0.10)] sm:p-5">
      <FinderRow label="연령">
        {FINDER_AGES.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            active={age === item.id}
            onClick={() => setAge(toggle(age, item.id))}
          />
        ))}
      </FinderRow>
      <FinderRow label="주제">
        {FINDER_THEMES.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            active={theme === item.id}
            onClick={() => setTheme(toggle(theme, item.id))}
          />
        ))}
      </FinderRow>
      <FinderRow label="유형">
        {FINDER_TYPES.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            active={type === item.id}
            onClick={() => setType(toggle(type, item.id))}
          />
        ))}
      </FinderRow>
      <div className="mt-4 border-t border-slate-100 pt-2">
        <button
          type="button"
          onClick={find}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-600 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-xl"
        >
          맞춤 도안 찾기
        </button>
      </div>
    </div>
  )
}

function FinderRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <p className="w-12 flex-shrink-0 text-xs font-bold text-slate-500">{label}</p>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">{children}</div>
    </div>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-xs transition sm:text-sm',
        active
          ? 'border-emerald-600 bg-emerald-600 font-bold text-white shadow-sm'
          : 'border-slate-200/80 bg-slate-50 font-medium text-slate-700 hover:bg-slate-100',
      )}
    >
      {label}
    </button>
  )
}
