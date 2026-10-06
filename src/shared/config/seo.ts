export const SEO_SITE_ORIGIN = 'https://doolia.com'

export const SEO_LOCALES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'] as const

export function seoPrintablePath(slug: string) {
  return `${SEO_SITE_ORIGIN}/printable/${slug}`
}

export function seoPrintableTitle(titleKo: string) {
  return `${titleKo} 무료 색칠도안 프린트 | 둘리아`
}

export function seoPrintableAlt(titleKo: string) {
  return `${titleKo} 색칠도안 도안 프린트`
}
