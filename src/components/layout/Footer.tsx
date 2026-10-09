import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BRAND } from '@/shared/config/categories'
import { PAGE_SHELL } from '@/shared/lib/cn'

const CATEGORY_LINKS = [
  { to: '/category/coloring-pages', key: 'footer.allColoring' as const },
  { to: '/category/coloring-pages?theme=imagination', key: 'footer.imagination' as const },
  { to: '/category/coloring-pages?age=2-3', key: 'footer.byAge' as const },
  { to: '/category?theme=animals', key: 'footer.animals' as const },
]

const LEGAL_LINKS = [
  { to: '/about', key: 'footer.about' as const },
  { to: '/faq', key: 'footer.faq' as const },
  { to: '/terms', key: 'footer.terms' as const },
  { to: '/privacy', key: 'footer.privacy' as const },
  { to: '/contact', key: 'footer.contact' as const },
]

const CARD =
  'flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs transition-all hover:border-slate-300 sm:p-6'
const MENU_HEADING =
  'mb-4 flex items-center gap-1.5 text-[13.5px] font-extrabold uppercase tracking-wider text-slate-900'
const MENU_LINK =
  'flex min-w-0 items-center gap-2.5 break-words text-[14.5px] font-bold leading-snug text-slate-700 transition-colors hover:text-emerald-600 sm:text-[15px]'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="no-print mt-6 border-t border-slate-200/80 bg-slate-50/70 pt-6 pb-10 sm:mt-8 sm:pb-12">
      <div className={PAGE_SHELL}>
        <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 md:grid-cols-3">
          <div className={CARD}>
            <div>
              <Link to="/" className="inline-block">
                <img src="/doolia-logo.png" alt="DOOLIA" className="h-9 w-auto object-contain sm:h-10" />
              </Link>
              <p className="mt-3.5 text-[14px] font-medium leading-relaxed text-slate-700 sm:text-[14.5px]">
                {t('footer.blurb')}
                <br />
                <span className="font-semibold text-slate-700">{t('footer.tagline')}</span>
              </p>
              <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                {t('footer.freeBadge')}
              </span>
            </div>
            <p className="mt-3 text-[12px] text-slate-400">{t('footer.affiliate')}</p>
          </div>

          <div className={CARD}>
            <div>
              <h3 className={MENU_HEADING}>📂 {t('footer.categories')}</h3>
              <ul className="space-y-3">
                {CATEGORY_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className={MENU_LINK}>
                      {t(item.key, {
                        defaultValue: item.key === 'footer.animals' ? '🐶 귀여운 동물' : '',
                      })}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={CARD}>
            <div>
              <h3 className={MENU_HEADING}>🛡️ {t('footer.legalSupport', 'LEGAL & SUPPORT')}</h3>
              <ul className="space-y-3">
                {LEGAL_LINKS.map((item) => (
                  <li key={item.key}>
                    <Link to={item.to} className={MENU_LINK}>
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/report" className={MENU_LINK}>
                    {t('footer.dmca', '저작권/권리침해 신고')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-200/60 pt-6 text-[12.5px] text-slate-400 sm:flex-row">
          <p>{t('footer.copyright', { year: new Date().getFullYear(), brand: BRAND.name })}</p>
          <p>{t('footer.designedFor')}</p>
        </div>
      </div>
    </footer>
  )
}
