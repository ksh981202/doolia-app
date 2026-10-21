/**
 * Builds sitemap.xml and prerendered printable HTML (unique head meta + JSON-LD).
 * Usage: npx tsx scripts/generate-seo-assets.ts
 * Runs after `vite build` so dist/index.html hashed assets can be cloned.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SITE = 'https://doolia.app'
const LOCALES = ['ko', 'en', 'ja', 'zh-Hant', 'es', 'pt', 'de', 'fr', 'it', 'vi'] as const

type Locale = (typeof LOCALES)[number]

type BundleRow = {
  slug: string
  title_ko?: string
  title_en?: string
  recommend_ko?: string
  recommend_reason?: string
  cover_image_url?: string
  updated_at?: string
  created_at?: string
}
type Row = {
  slug: string
  title_ko: string
  title_en: string
  title_ja: string
  title_zh: string
  title_es: string
  title_pt: string
  title_de: string
  title_fr: string
  title_it: string
  title_vi: string
  description_ko: string
  description_en: string
  description_ja: string
  description_zh: string
  description_es: string
  description_pt: string
  description_de: string
  description_fr: string
  description_it: string
  description_vi: string
  image_color_url: string
  updated_at?: string
  created_at?: string
}



function loadEnv() {
  for (const name of ['.env', '.env.local', '.env.development']) {
    try {
      for (const raw of readFileSync(resolve(process.cwd(), name), 'utf8').split(/\r?\n/)) {
        const line = raw.trim()
        if (!line || line.startsWith('#')) continue
        const cut = line.indexOf('=')
        if (cut < 1) continue
        const key = line.slice(0, cut).trim()
        let value = line.slice(cut + 1).trim()
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }
        if (!(key in process.env)) process.env[key] = value
      }
    } catch {
      /* optional */
    }
  }
}

function xml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function html(value: string) {
  return xml(value).replaceAll("'", '&#39;')
}

function lastmod(row: Row | BundleRow) {
  const raw = row.updated_at || row.created_at
  const date = raw ? new Date(raw) : new Date()
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10)
  return date.toISOString().slice(0, 10)
}

function writeFile(relOrAbs: string, contents: string) {
  const filePath = resolve(relOrAbs)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, contents)
}

function writePrerenders(outRoot: string, template: string, rows: Row[], bundles: BundleRow[] = []) {
  for (const row of rows) {
    writeFile(resolve(outRoot, 'printable', row.slug, 'index.html'), injectHead(template, row))
  }

  for (const bundle of bundles) {
    writeFile(resolve(outRoot, 'bundles', bundle.slug, 'index.html'), injectBundleHead(template, bundle))
  }

  const subPages = [
    {
      path: 'about',
      title: 'About DOOLIA | 100% Free Creative Coloring Platform',
      description: "Discover DOOLIA's mission to spark children's imagination with safe, original, and 100% free high-resolution printable coloring sheets.",
    },
    {
      path: 'contact',
      title: 'Contact Us | DOOLIA Support & Inquiries',
      description: 'Get in touch with the DOOLIA team for general inquiries, feedback, partnership, or coloring sheet suggestions.',
    },
    {
      path: 'report',
      title: 'Copyright & Content Notice | DOOLIA Ethics',
      description: 'Report copyright issues or content concerns on DOOLIA.',
    },
    {
      path: 'category',
      title: 'Coloring Categories | DOOLIA',
      description: 'Explore all coloring page categories on DOOLIA.',
    },
    {
      path: 'faq',
      title: 'FAQ | Frequently Asked Questions - DOOLIA',
      description: 'Find answers to common questions about using DOOLIA printable coloring pages.',
    },
    {
      path: 'privacy',
      title: 'Privacy Policy | DOOLIA',
      description: 'Read the privacy policy of DOOLIA.',
    },
    {
      path: 'bundles',
      title: 'Themed Coloring Packs & Bundles | DOOLIA',
      description: 'Download complete themed coloring book bundles in high-resolution A4 PDFs. Instant free download with no sign-up.',
    },
  ]

  for (const sp of subPages) {
    const url = `${SITE}/${sp.path}`
    const image = `${SITE}/og-image.jpg`
    const block = `
    <title>${html(sp.title)}</title>
    <meta name="description" content="${html(sp.description)}" />
    <link rel="canonical" href="${html(url)}" />
    <meta property="og:title" content="${html(sp.title)}" />
    <meta property="og:description" content="${html(sp.description)}" />
    <meta property="og:image" content="${html(image)}" />
    <meta property="og:url" content="${html(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="DOOLIA Printables" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${html(sp.title)}" />
    <meta name="twitter:description" content="${html(sp.description)}" />
    <meta name="twitter:image" content="${html(image)}" />
`
    let htmlOut = template
    htmlOut = htmlOut.replace(/<title>[\s\S]*?<\/title>/i, '')
    htmlOut = htmlOut.replace(/<meta\s+name="description"[^>]*>/i, '')
    htmlOut = htmlOut.replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    htmlOut = htmlOut.replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, '')
    htmlOut = htmlOut.replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, '')
    htmlOut = htmlOut.replace(/<link\s+rel="alternate"[^>]*>/gi, '')
    htmlOut = htmlOut.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
    if (htmlOut.includes('</head>')) {
      htmlOut = htmlOut.replace('</head>', `${block}\n  </head>`)
    } else {
      htmlOut = block + htmlOut
    }
    writeFile(resolve(outRoot, sp.path, 'index.html'), htmlOut)
  }
}

function getLocalizedPrintableUrl(slugOrUrl: string, locale: Locale) {
  const slug = slugOrUrl.replace(/^https?:\/\/[^/]+\/printable\//, '').replace(/\?.*$/, '')
  const base = `${SITE}/printable/${slug}`
  return locale === 'ko' ? base : `${base}?lang=${locale}`
}

function hreflangLinks(slugOrUrl: string) {
  const slug = slugOrUrl.replace(/^https?:\/\/[^/]+\/printable\//, '').replace(/\?.*$/, '')
  const defaultUrl = `${SITE}/printable/${slug}`
  const links = LOCALES.map((locale) => {
    const locUrl = getLocalizedPrintableUrl(slug, locale)
    return `    <link rel="alternate" hreflang="${locale}" href="${html(locUrl)}" />`
  })
  links.push(`    <link rel="alternate" hreflang="x-default" href="${html(defaultUrl)}" />`)
  return links.join('\n')
}

function getLocalizedPageUrl(pathWithoutLeadingSlash: string, locale: Locale) {
  const base = `${SITE}/${pathWithoutLeadingSlash}`
  return locale === 'ko' ? base : `${base}${base.includes('?') ? '&' : '?'}lang=${locale}`
}

function sitemapXhtmlLinks(slug: string, isBundle = false) {
  const basePath = isBundle ? `bundles/${slug}` : `printable/${slug}`
  const defaultUrl = `${SITE}/${basePath}`
  const links = LOCALES.map((locale) => {
    const locUrl = isBundle ? getLocalizedPageUrl(basePath, locale) : getLocalizedPrintableUrl(slug, locale)
    return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${xml(locUrl)}" />`
  })
  links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(defaultUrl)}" />`)
  return links.join('\n')
}

function sitemapXhtmlLinksForPath(pathWithoutSlash: string) {
  const defaultUrl = `${SITE}/${pathWithoutSlash}`
  const links = LOCALES.map((locale) => {
    const locUrl = getLocalizedPageUrl(pathWithoutSlash, locale)
    return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${xml(locUrl)}" />`
  })
  links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(defaultUrl)}" />`)
  return links.join('\n')
}

function sitemapXml(rows: Row[], bundles: BundleRow[]) {
  const staticPaths = ['', 'about', 'contact', 'report', 'category', 'faq', 'privacy', 'bundles']
  const today = new Date().toISOString().slice(0, 10)

  const urls = [
    ...staticPaths.map((path) => {
      const loc = path === '' ? `${SITE}/` : `${SITE}/${path}`
      const priority = path === '' ? '1.0' : ['about', 'contact', 'report', 'category', 'faq', 'privacy', 'bundles'].includes(path) ? '0.7' : '0.5'
      const changefreq = path === '' ? 'daily' : 'weekly'
      const xhtmlBlock = sitemapXhtmlLinksForPath(path)
      return `  <url>
    <loc>${loc}</loc>
${xhtmlBlock}
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    }),
    ...bundles.map(
      (bundle) => `  <url>
    <loc>${SITE}/bundles/${xml(bundle.slug)}</loc>
${sitemapXhtmlLinks(bundle.slug, true)}
    <lastmod>${lastmod(bundle)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    ),
    ...rows.map(
      (row) => `  <url>
    <loc>${SITE}/printable/${xml(row.slug)}</loc>
${sitemapXhtmlLinks(row.slug, false)}
    <lastmod>${lastmod(row)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    ),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
}

function getLocalizedTitle(row: Row, locale: Locale) {
  const key = `title_${locale}` as keyof Row
  const val = (row[key] as string | undefined)?.trim()
  return val || row.title_ko || 'DOOLIA'
}

function getLocalizedDescription(row: Row, locale: Locale) {
  const key = `description_${locale}` as keyof Row
  const val = (row[key] as string | undefined)?.trim()
  return val || row.description_ko || getLocalizedTitle(row, locale)
}

function seoTitle(titleKo: string) {
  return `${titleKo} 무료 색칠도안 프린트 | 둘리아`
}

function jsonLdBundle(bundle: BundleRow) {
  const name = bundle.title_ko || bundle.title_en || 'Free Printable Coloring Book Bundle'
  const description = bundle.recommend_ko || bundle.recommend_reason || 'Free Printable Coloring Book Bundle'
  const url = `${SITE}/bundles/${bundle.slug}`
  const image = bundle.cover_image_url || 'https://cdn.doolia.app/og-image.png'
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    image,
    publisher: {
      '@type': 'Organization',
      name: 'DOOLIA',
      url: 'https://doolia.app',
      logo: 'https://cdn.doolia.app/doolia-logo.png',
    },
    isAccessibleForFree: true,
    inLanguage: ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'],
  }
}

function injectBundleHead(template: string, bundle: BundleRow) {
  const title = bundle.title_ko || bundle.title_en ? `${bundle.title_ko || bundle.title_en} | DOOLIA Bundles` : 'Themed Coloring Packs & Bundles | DOOLIA'
  const description = bundle.recommend_ko || bundle.recommend_reason || 'Download complete themed coloring book bundles in high-resolution A4 PDFs. Instant free download with no sign-up.'
  const url = `${SITE}/bundles/${bundle.slug}`
  const image = bundle.cover_image_url || `${SITE}/og-image.jpg`
  const block = `
    <title>${html(title)}</title>
    <meta name="description" content="${html(description)}" />
    <link rel="canonical" href="${html(url)}" />
    <meta property="og:title" content="${html(title)}" />
    <meta property="og:description" content="${html(description)}" />
    <meta property="og:image" content="${html(image)}" />
    <meta property="og:url" content="${html(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="DOOLIA Printables" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${html(title)}" />
    <meta name="twitter:description" content="${html(description)}" />
    <meta name="twitter:image" content="${html(image)}" />
    <script type="application/ld+json">${JSON.stringify(jsonLdBundle(bundle))}</script>
`
  let htmlOut = template
  htmlOut = htmlOut.replace(/<title>[\s\S]*?<\/title>/i, '')
  htmlOut = htmlOut.replace(/<meta\s+name="description"[^>]*>/i, '')
  htmlOut = htmlOut.replace(/<link\s+rel="canonical"[^>]*>/gi, '')
  htmlOut = htmlOut.replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, '')
  htmlOut = htmlOut.replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, '')
  htmlOut = htmlOut.replace(/<link\s+rel="alternate"[^>]*>/gi, '')
  htmlOut = htmlOut.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
  if (htmlOut.includes('</head>')) {
    htmlOut = htmlOut.replace('</head>', `${block}\n  </head>`)
  } else {
    htmlOut = block + htmlOut
  }
  return htmlOut
}
function jsonLd(row: Row) {
  const title = seoTitle(row.title_ko)
  const url = `${SITE}/printable/${row.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        name: title,
        description: row.description_ko || title,
        url,
        inLanguage: 'ko',
        workTranslation: LOCALES.filter((l) => l !== 'ko').map((locale) => ({
          '@type': 'CreativeWork',
          inLanguage: locale,
          url: getLocalizedPrintableUrl(row.slug, locale),
          name: getLocalizedTitle(row, locale),
          description: getLocalizedDescription(row, locale),
        })),
        image: {
          '@type': 'ImageObject',
          url: row.image_color_url,
          contentUrl: row.image_color_url,
        },
      },
      {
        '@type': 'ImageObject',
        name: `${row.title_ko} 색칠도안 도안 프린트`,
        url: row.image_color_url,
        contentUrl: row.image_color_url,
      },
    ],
  }
}

function injectHead(template: string, row: Row) {
  const title = seoTitle(row.title_ko)
  const description = row.description_ko || title
  const url = `${SITE}/printable/${row.slug}`
  const image = row.image_color_url
  const block = `
    <title>${html(title)}</title>
    <meta name="description" content="${html(description)}" />
    <link rel="canonical" href="${html(url)}" />
${hreflangLinks(row.slug)}
    <meta property="og:title" content="${html(title)}" />
    <meta property="og:description" content="${html(description)}" />
    <meta property="og:image" content="${html(image)}" />
    <meta property="og:url" content="${html(url)}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="DOOLIA Printables" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${html(title)}" />
    <meta name="twitter:description" content="${html(description)}" />
    <meta name="twitter:image" content="${html(image)}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd(row))}</script>
`
  let htmlOut = template
  htmlOut = htmlOut.replace(/<title>[\s\S]*?<\/title>/i, '')
  htmlOut = htmlOut.replace(/<meta\s+name="description"[^>]*>/i, '')
  htmlOut = htmlOut.replace(/<link\s+rel="canonical"[^>]*>/gi, '')
  htmlOut = htmlOut.replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, '')
  htmlOut = htmlOut.replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, '')
  htmlOut = htmlOut.replace(/<link\s+rel="alternate"[^>]*>/gi, '')
  htmlOut = htmlOut.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
  if (htmlOut.includes('</head>')) {
    htmlOut = htmlOut.replace('</head>', `${block}\n  </head>`)
  } else {
    htmlOut = block + htmlOut
  }
  return htmlOut
}

async function fetchRows(): Promise<Row[]> {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 필요')
  const supabase = createClient(url, key)
  const selectFields = [
    'slug',
    'title_ko',
    'title_en',
    'title_ja',
    'title_zh',
    'title_es',
    'title_pt',
    'title_de',
    'title_fr',
    'title_it',
    'title_vi',
    'description_ko',
    'description_en',
    'description_ja',
    'description_zh',
    'description_es',
    'description_pt',
    'description_de',
    'description_fr',
    'description_it',
    'description_vi',
    'image_color_url',
    'created_at',
    'published',
  ].join(',')

  const { data, error } = await supabase
    .from('printables')
    .select(selectFields)
    .eq('published', true)
    .range(0, 999)
  if (error) throw error
  return (data ?? [])
    .map((row: any) => ({
      slug: String(row.slug ?? '').trim(),
      title_ko: String(row.title_ko ?? '').trim(),
      title_en: String(row.title_en ?? '').trim(),
      title_ja: String(row.title_ja ?? '').trim(),
      title_zh: String(row.title_zh ?? '').trim(),
      title_es: String(row.title_es ?? '').trim(),
      title_pt: String(row.title_pt ?? '').trim(),
      title_de: String(row.title_de ?? '').trim(),
      title_fr: String(row.title_fr ?? '').trim(),
      title_it: String(row.title_it ?? '').trim(),
      title_vi: String(row.title_vi ?? '').trim(),
      description_ko: String(row.description_ko ?? '').trim(),
      description_en: String(row.description_en ?? '').trim(),
      description_ja: String(row.description_ja ?? '').trim(),
      description_zh: String(row.description_zh ?? '').trim(),
      description_es: String(row.description_es ?? '').trim(),
      description_pt: String(row.description_pt ?? '').trim(),
      description_de: String(row.description_de ?? '').trim(),
      description_fr: String(row.description_fr ?? '').trim(),
      description_it: String(row.description_it ?? '').trim(),
      description_vi: String(row.description_vi ?? '').trim(),
      image_color_url: String(row.image_color_url ?? '').trim(),
      updated_at: row.updated_at ? String(row.updated_at) : undefined,
      created_at: row.created_at ? String(row.created_at) : undefined,
    }))
    .filter((row) => row.slug)
}

async function fetchBundles(): Promise<BundleRow[]> {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return []
  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase
      .from('bundles')
      .select('slug, title_ko, title_en, recommend_ko, recommend_reason, cover_image_url, updated_at, created_at')
      .range(0, 999)
    if (error || !data) return []
    return data.map((b: any) => ({
      slug: String(b.slug ?? '').trim(),
      title_ko: String(b.title_ko ?? '').trim(),
      title_en: String(b.title_en ?? '').trim(),
      recommend_ko: String(b.recommend_ko ?? '').trim(),
      recommend_reason: String(b.recommend_reason ?? '').trim(),
      cover_image_url: String(b.cover_image_url ?? '').trim(),
      updated_at: b.updated_at ? String(b.updated_at) : undefined,
      created_at: b.created_at ? String(b.created_at) : undefined,
    })).filter((b) => b.slug)
  } catch {
    return []
  }
}

loadEnv()
const rows = await fetchRows()
const bundles = await fetchBundles()
const sitemap = sitemapXml(rows, bundles)
writeFile('public/sitemap.xml', sitemap)
if (existsSync(resolve('dist'))) writeFile('dist/sitemap.xml', sitemap)
if (existsSync(resolve('public/robots.txt')) && existsSync(resolve('dist'))) {
  writeFile('dist/robots.txt', readFileSync(resolve('public/robots.txt'), 'utf8'))
}

const distTemplate = existsSync(resolve('dist/index.html')) ? readFileSync(resolve('dist/index.html'), 'utf8') : null
const devTemplate = readFileSync(resolve('index.html'), 'utf8')
writePrerenders(resolve('public'), devTemplate, rows, bundles)
if (distTemplate) writePrerenders(resolve('dist'), distTemplate, rows, bundles)

console.log(
  `SEO assets: ${rows.length} printables, ${bundles.length} bundles, sitemap.xml, prerender HTML → public/(printable|bundles)/*${distTemplate ? ' and dist/(printable|bundles)/*' : ''}`,
)
