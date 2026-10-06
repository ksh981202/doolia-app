import { SEO_SITE_ORIGIN } from '@/shared/config/seo'

const MARK = 'data-doolia-seo'

export type PageMetaInput = {
  title: string
  description: string
  image?: string
  url: string
  type?: string
  jsonLd?: unknown
}

function upsertMeta(attr: 'name' | 'property', key: string, value: string) {
  const tagged = document.head.querySelector(`meta[${attr}="${key}"][${MARK}]`)
  const existing = tagged || document.head.querySelector(`meta[${attr}="${key}"]`)
  const el = (existing as HTMLMetaElement | null) ?? document.createElement('meta')
  el.setAttribute(attr, key)
  el.setAttribute('content', value)
  el.setAttribute(MARK, '')
  if (!el.parentNode) document.head.appendChild(el)
}

function upsertLink(rel: string, href: string) {
  const tagged = document.head.querySelector(`link[rel="${rel}"][${MARK}]`)
  const existing = tagged || document.head.querySelector(`link[rel="${rel}"]`)
  const el = (existing as HTMLLinkElement | null) ?? document.createElement('link')
  el.setAttribute('rel', rel)
  el.setAttribute('href', href)
  el.setAttribute(MARK, '')
  if (!el.parentNode) document.head.appendChild(el)
}

function upsertJsonLd(data: unknown) {
  let el = document.head.querySelector(`script[type="application/ld+json"][${MARK}]`) as HTMLScriptElement | null
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute(MARK, '')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export function applyPageMeta(input: PageMetaInput) {
  document.title = input.title
  upsertMeta('name', 'description', input.description)
  upsertMeta('property', 'og:title', input.title)
  upsertMeta('property', 'og:description', input.description)
  upsertMeta('property', 'og:url', input.url)
  upsertMeta('property', 'og:type', input.type ?? 'article')
  upsertMeta('property', 'og:locale', 'ko_KR')
  upsertMeta('property', 'og:site_name', 'DOOLIA Printables')
  if (input.image) {
    upsertMeta('property', 'og:image', input.image)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:image', input.image)
  }
  upsertMeta('name', 'twitter:title', input.title)
  upsertMeta('name', 'twitter:description', input.description)
  upsertLink('canonical', input.url)
  upsertJsonLd(input.jsonLd)
}

export function homeCanonical() {
  return `${SEO_SITE_ORIGIN}/`
}
