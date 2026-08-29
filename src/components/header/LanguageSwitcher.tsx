import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/i18n'
import { cn } from '@/shared/lib/cn'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current =
    LANGUAGES.find((item) => i18n.resolvedLanguage?.startsWith(item.code) || i18n.language.startsWith(item.code)) ??
    LANGUAGES[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('language')}
      >
        <span aria-hidden>🌐</span>
        <span className="hidden sm:inline">{current.flag}</span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-[180px] overflow-hidden rounded-2xl border border-gray-100 bg-white py-1 shadow-xl"
        >
          {LANGUAGES.map((item) => {
            const active = item.code === current.code
            return (
              <li key={item.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    void i18n.changeLanguage(item.code)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold',
                    active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  <span>{item.flag}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
