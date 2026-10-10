import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, loadLocaleResource, resolveLanguage } from '@/i18n'
import { cn } from '@/shared/lib/cn'

export function LanguageSwitcher({ listPlacement = 'bottom' }: { listPlacement?: 'bottom' | 'top' }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const currentLangObj =
    LANGUAGES.find((lang) => lang.code === resolveLanguage(i18n.language || i18n.resolvedLanguage)) ?? LANGUAGES[0]

  const changeLanguage = (code: (typeof LANGUAGES)[number]['code']) => {
    void loadLocaleResource(code)
    setOpen(false)
  }

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
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 transition hover:border-emerald-300"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={currentLangObj.name}
      >
        <span className="text-[14px]">🌐</span>
        <span className="text-[12.5px] font-bold text-slate-700 sm:text-[13px]">{currentLangObj.label}</span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className={cn(
            'absolute z-50 max-h-[min(70vh,420px)] min-w-[200px] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-1 shadow-xl',
            listPlacement === 'top' ? 'bottom-full left-0 mb-2' : 'right-0 mt-2',
          )}
        >
          {LANGUAGES.map((lang) => {
            const active = lang.code === currentLangObj.code
            return (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-left hover:bg-emerald-50',
                    active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700',
                  )}
                >
                  <span className="flag-emoji text-base leading-none">{lang.flag}</span>
                  <span className="text-[13.5px] font-medium text-slate-700">{lang.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
