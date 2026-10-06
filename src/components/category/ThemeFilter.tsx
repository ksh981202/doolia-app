import { useTranslation } from 'react-i18next'
import { getCategoryThemes, type ThemeOption } from '@/shared/config/categories'
import { cn } from '@/shared/lib/cn'

type ThemeFilterProps = {
  value: string
  onChange: (id: string) => void
  options?: ThemeOption[]
  variant?: 'parent' | 'sub'
  showExpandCaret?: boolean
}

function chipClass(active: boolean) {
  return cn(
    'inline-flex min-h-[44px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-4 text-[13.5px] transition-all',
    active
      ? 'border border-emerald-600 bg-emerald-600 font-bold text-white shadow-sm shadow-emerald-600/20'
      : 'border border-slate-200/90 bg-white font-medium text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700',
  )
}

function chipLabel(item: ThemeOption, variant: 'parent' | 'sub', name: string) {
  if (variant === 'sub' || !item.icon) return name
  return `${item.icon} ${name}`
}

export function ThemeFilter({
  value,
  onChange,
  options,
  variant = 'parent',
  showExpandCaret,
}: ThemeFilterProps) {
  const { t } = useTranslation()
  const expandCaret = showExpandCaret ?? variant === 'parent'
  const chips = options?.length ? options : getCategoryThemes('coloring-pages')
  if (!chips?.length) return null

  return (
    <div
      className={cn(
        variant === 'sub'
          ? 'flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none py-1.5 px-1 -mx-1 [-webkit-overflow-scrolling:touch]'
          : 'flex flex-wrap content-start items-center gap-1.5',
      )}
      role="tablist"
      aria-label={variant === 'sub' ? '세부 주제 필터' : '주제 필터'}
    >
      {chips.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          onClick={() => onChange(item.id)}
          className={chipClass(value === item.id)}
        >
          {chipLabel(item, variant, t(`categories.${item.id}`, item.name))}
          {expandCaret && value === item.id && item.id !== 'all' ? (
            <span aria-hidden className="text-[10px] leading-none opacity-90">
              ▾
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
