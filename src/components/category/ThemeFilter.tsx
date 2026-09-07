import { useEffect, useRef, useState } from 'react'
import { FEATURED_THEME_FILTERS, THEME_FILTERS } from '@/shared/config/smartFilters'
import { cn } from '@/shared/lib/cn'

type ThemeFilterProps = {
  value: string
  onChange: (id: string) => void
}

function chipClass(active: boolean) {
  return cn(
    'inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition sm:px-4',
    active
      ? 'bg-emerald-600 font-bold text-white shadow-sm'
      : 'bg-white font-medium text-ink/70 ring-1 ring-line hover:text-ink',
  )
}

export function ThemeFilter({ value, onChange }: ThemeFilterProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const extraSelected = Boolean(value !== 'all' && !FEATURED_THEME_FILTERS.some((item) => item.id === value))

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const select = (id: string) => {
    onChange(id)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex min-w-0 items-center gap-2">
        <div
          className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="대표 주제 필터"
        >
          {FEATURED_THEME_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={value === item.id}
              onClick={() => select(item.id)}
              className={chipClass(value === item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            'shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition',
            extraSelected || open
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
          )}
        >
          + 전체 주제 {open ? '▴' : '▾'}
        </button>
      </div>

      {open ? (
        <div
          role="listbox"
          aria-label="전체 주제"
          className="absolute right-0 z-20 mt-2 w-[min(100%,28rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:w-[32rem]"
        >
          <p className="mb-2 px-1 text-[11px] font-bold text-slate-500">전체 주제 선택</p>
          <div className="grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3">
            {THEME_FILTERS.map((item) => {
              const active = value === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => select(item.id)}
                  className={cn(
                    'rounded-xl px-3 py-2 text-left text-xs font-bold transition sm:text-sm',
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100',
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
