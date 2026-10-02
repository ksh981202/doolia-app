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
  { to: '/privacy', key: 'footer.privacy' as const },
  { to: '/terms', key: 'footer.terms' as const },
  { to: '/contact', key: 'footer.contact' as const },
]

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:px-8 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold text-[#059669]">{BRAND.shortName}</p>
          <p className="mt-1 text-sm font-bold text-ink">{BRAND.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">{t('footer.blurb')}</p>
          <p className="mt-4 text-xs leading-5 text-muted">{t('footer.affiliate')}</p>
        </div>
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-muted">{t('footer.categories')}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm font-semibold">
            {CATEGORY_LINKS.map((item) => (
              <Link key={item.to} to={item.to} className="text-ink/80 hover:text-[#059669]">
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-muted">{t('footer.legal')}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm font-semibold">
            {LEGAL_LINKS.map((item) => (
              <Link key={item.to} to={item.to} className="text-ink/80 hover:text-[#059669]">
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-7xl px-4 py-5 text-xs text-muted sm:px-6 lg:px-8">
          {t('footer.copyright', { year: new Date().getFullYear(), brand: BRAND.name })}
        </p>
      </div>
    </footer>
  )
}
