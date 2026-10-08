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
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-12 lg:px-8">
        <div className="space-y-3 md:col-span-5">
          <Link to="/" className="inline-block">
            <img src="/doolia-logo.png" alt="DOOLIA" className="h-8 w-auto object-contain sm:h-9" />
          </Link>
          <p className="max-w-sm text-xs leading-relaxed text-slate-500">
            {t('footer.blurb')}
            <br />
            <span className="font-semibold text-slate-600">{t('footer.tagline')}</span>
          </p>
          <p className="max-w-sm text-[11px] leading-normal text-slate-400">{t('footer.affiliate')}</p>
          <p className="pt-1 text-[11px] font-medium text-slate-400">
            {t('footer.copyright', { year: new Date().getFullYear(), brand: BRAND.name })}
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="text-[12.5px] font-bold tracking-[0.16em] text-muted sm:text-[13px]">{t('footer.categories')}</p>
          <div className="mt-3 flex flex-col gap-2 text-[14px] font-semibold sm:text-[14.5px]">
            {CATEGORY_LINKS.map((item) => (
              <Link key={item.to} to={item.to} className="text-ink/80 hover:text-[#059669]">
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-4">
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
    </footer>
  )
}
