/**
 * Builds sitemap.xml and prerendered printable HTML (unique head meta + JSON-LD).
 * Usage: npx tsx scripts/generate-seo-assets.ts
 * Runs after `vite build` so dist/index.html hashed assets can be cloned.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SITE = 'https://doolia.com'
const LOCALES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'] as const

type Row = {
  slug: string
  title_ko: string
  description_ko: string
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

function lastmod(row: Row) {
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

function writePrerenders(outRoot: string, template: string, rows: Row[]) {
  for (const row of rows) {
    writeFile(resolve(outRoot, 'printable', row.slug, 'index.html'), injectHead(template, row))
  }
}

function sitemapXml(rows: Row[]) {
  const staticUrls: Array<{ loc: string; priority: string; changefreq: string }> = [
    { loc: `${SITE}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE}/category/coloring-pages`, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE}/category/senior-art`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${SITE}/parenting-tips`, priority: '0.6', changefreq: 'weekly' },
    { loc: `${SITE}/about`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${SITE}/faq`, priority: '0.5', changefreq: 'monthly' },
  ]
  const today = new Date().toISOString().slice(0, 10)
  const urls = [
    ...staticUrls.map(
      (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`,
    ),
    ...rows.map(
      (row) => `  <url>
    <loc>${SITE}/printable/${xml(row.slug)}</loc>
    <lastmod>${lastmod(row)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    ),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

function hreflangLinks(url: string) {
  return [
    ...LOCALES.map((code) => `    <link rel="alternate" hreflang="${code}" href="${html(url)}" />`),
    `    <link rel="alternate" hreflang="x-default" href="${html(url)}" />`,
  ].join('\n')
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

function seoTitle(titleKo: string) {
  return `${titleKo} 무료 색칠도안 프린트 | 둘리아`
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
${hreflangLinks(url)}
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
  const { data, error } = await supabase
    .from('printables')
    .select('slug,title_ko,description_ko,image_color_url,created_at,published')
    .eq('published', true)
    .range(0, 999)
  if (error) throw error
  return (data ?? [])
    .map((row) => ({
      slug: String(row.slug ?? '').trim(),
      title_ko: String(row.title_ko ?? '').trim(),
      description_ko: String(row.description_ko ?? '').trim(),
      image_color_url: String(row.image_color_url ?? '').trim(),
      updated_at: row.updated_at ? String(row.updated_at) : undefined,
      created_at: row.created_at ? String(row.created_at) : undefined,
    }))
    .filter((row) => row.slug)
}

loadEnv()
const rows = await fetchRows()
const sitemap = sitemapXml(rows)
writeFile('public/sitemap.xml', sitemap)
if (existsSync(resolve('dist'))) writeFile('dist/sitemap.xml', sitemap)
if (existsSync(resolve('public/robots.txt')) && existsSync(resolve('dist'))) {
  writeFile('dist/robots.txt', readFileSync(resolve('public/robots.txt'), 'utf8'))
}

const distTemplate = existsSync(resolve('dist/index.html')) ? readFileSync(resolve('dist/index.html'), 'utf8') : null
const devTemplate = readFileSync(resolve('index.html'), 'utf8')
writePrerenders(resolve('public'), devTemplate, rows)
if (distTemplate) writePrerenders(resolve('dist'), distTemplate, rows)

console.log(
  `SEO assets: ${rows.length} printables, sitemap.xml, prerender HTML → public/printable/*${distTemplate ? ' and dist/printable/*' : ''}`,
)
