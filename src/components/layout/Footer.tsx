import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BRAND } from '@/shared/config/categories'

const CATEGORY_LINKS = [
  { to: '/category/coloring-pages', key: 'footer.allColoring' as const },
  { to: '/category/coloring-pages?theme=imagination', key: 'footer.imagination' as const },
  { to: '/category/coloring-pages?age=2-3', key: 'footer.byAge' as const },
  { to: '/category/coloring-pages?sort=popular', key: 'footer.popular' as const },
]

const LEGAL_LINKS = [
  { to: '/about', key: 'footer.about' as const },
  { to: '/faq', key: 'footer.faq' as const },
  { to: '/terms', key: 'footer.terms' as const },
  { to: '/privacy', key: 'footer.privacy' as const },
  { to: '/contact', key: 'footer.contact' as const },
]

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="no-print border-t border-line bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:px-8 md:grid-cols-3">
        <div>
          <Link to="/" className="inline-block">
            <img
              src="/doolia-logo.png"
              alt="DOOLIA"
              className="h-9 w-auto object-contain sm:h-10"
              onError={(e) => {
                console.error('Logo load failed:', e)
              }}
            />
          </Link>
          <div className="mt-3 max-w-sm space-y-1 text-[13.5px] font-normal leading-relaxed text-slate-500 sm:text-[14px]">
            <p>{t('footer.blurb')}</p>
            <p className="font-medium text-slate-600">{t('footer.tagline')}</p>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-muted">{t('footer.affiliate')}</p>
        </div>
        <div>
          <p className="text-[12.5px] font-bold tracking-[0.16em] text-muted sm:text-[13px]">{t('footer.categories')}</p>
          <div className="mt-3 flex flex-col gap-2 text-[14px] font-semibold sm:text-[14.5px]">
            {CATEGORY_LINKS.map((item) => (
              <Link key={item.to} to={item.to} className="text-ink/80 hover:text-[#059669]">
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[12.5px] font-bold tracking-[0.16em] text-muted sm:text-[13px]">{t('footer.legal')}</p>
          <div className="mt-3 flex flex-col gap-2 text-[14px] font-semibold sm:text-[14.5px]">
            {LEGAL_LINKS.map((item) => (
              <Link key={item.to} to={item.to} className="text-ink/80 hover:text-[#059669]">
                {t(item.key)}
              </Link>
            ))}
            <Link to="/report" className="text-ink/80 hover:text-[#059669]">
              {t('footer.dmca', '저작권/권리침해 신고')}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>{t('footer.copyright', { year: new Date().getFullYear(), brand: BRAND.name })}</p>
          <p className="text-[11.5px] text-slate-400">{t('footer.blurb')}</p>
        </div>
      </div>
    </footer>
  )
}
