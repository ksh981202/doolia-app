/**
 * Read-only Google/Naver SEO audit. Does not mutate app source or DB.
 * Usage: npx tsx scripts/verify-seo-engine.ts
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

type Grade = 'PASS' | 'WARN' | 'FAIL'

type Check = {
  grade: Grade
  area: string
  title: string
  detail: string
}

const checks: Check[] = []
const LOCALES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'] as const

function add(grade: Grade, area: string, title: string, detail: string) {
  checks.push({ grade, area, title, detail })
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

function read(rel: string) {
  const path = resolve(process.cwd(), rel)
  return existsSync(path) ? readFileSync(path, 'utf8') : null
}

function globHas(dir: string, pattern: RegExp): string[] {
  const root = resolve(process.cwd(), dir)
  if (!existsSync(root)) return []
  const hits: string[] = []
  const walk = (folder: string) => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const next = resolve(folder, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue
        walk(next)
      } else if (pattern.test(entry.name) || pattern.test(next.replace(/\\/g, '/'))) {
        hits.push(next.replace(resolve(process.cwd()) + '\\', '').replace(/\\/g, '/'))
      }
    }
  }
  walk(root)
  return hits
}

function scanIndexHtml() {
  const html = read('index.html') ?? ''
  add(
    html.includes('<html lang="ko">') ? 'PASS' : 'WARN',
    'meta',
    'index.html html lang',
    html.includes('lang="ko"') ? 'lang="ko" 고정. 언어 전환 시 html lang / hreflang 갱신 없음.' : 'html lang 없음',
  )
  add(
    html.includes('<title>') ? 'PASS' : 'FAIL',
    'meta',
    '정적 <title>',
    html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'title 태그 없음',
  )
  add(
    /name="description"/.test(html) ? 'PASS' : 'FAIL',
    'meta',
    '정적 meta description',
    html.match(/name="description"[\s\S]*?content="([^"]*)"/)?.[1] ?? '없음',
  )
  const og = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:locale']
  const missingOg = og.filter((key) => !html.includes(key))
  add(
    missingOg.length ? 'FAIL' : 'PASS',
    'og',
    'Open Graph 태그',
    missingOg.length ? `누락: ${missingOg.join(', ')}` : 'og:* 전부 존재',
  )
  add(
    html.includes('twitter:card') ? 'PASS' : 'WARN',
    'og',
    'Twitter/X card',
    html.includes('twitter:card') ? 'twitter:card 있음' : 'twitter:card / twitter:image 없음',
  )
  add(
    html.includes('rel="canonical"') ? 'PASS' : 'FAIL',
    'canonical',
    'index.html canonical',
    html.includes('rel="canonical"') ? 'canonical 있음' : '정적 canonical 없음. SPA 모든 URL이 같은 HTML을 반환하면 중복 콘텐츠로 묶일 수 있음',
  )
  add(
    html.includes('hreflang') ? 'PASS' : 'FAIL',
    'hreflang',
    'index.html hreflang',
    html.includes('hreflang') ? 'hreflang 있음' : `10로케일(${LOCALES.join(', ')})용 hreflang 없음. i18n은 localStorage 기반이라 URL이 언어별로 갈라지지 않음`,
  )
  add(
    html.includes('application/ld+json') ? 'PASS' : 'FAIL',
    'jsonld',
    'index.html JSON-LD',
    html.includes('application/ld+json') ? 'JSON-LD 있음' : 'Organization / WebSite / ImageObject 스키마 없음',
  )
  add(
    /naver-site-verification|google-site-verification/i.test(html) ? 'PASS' : 'WARN',
    'meta',
    '서치콘솔 소유권 메타',
    /naver-site-verification|google-site-verification/i.test(html)
      ? 'verification 메타 있음'
      : 'google-site-verification / naver-site-verification 없음 (도메인 등록은 Search Console에서 다른 방식으로도 가능)',
  )
}

function scanDetailPage() {
  const page = read('src/pages/PrintableDetailPage.tsx') ?? ''
  const metaLib = read('src/shared/lib/pageMeta.ts') ?? ''
  add(
    metaLib.includes('applyPageMeta') && page.includes('applyPageMeta') ? 'PASS' : 'FAIL',
    'meta',
    'SEO Helmet / 메타 매니저',
    metaLib.includes('applyPageMeta')
      ? 'src/shared/lib/pageMeta.ts applyPageMeta + PrintableDetailPage 연동'
      : '메타 매니저 없음',
  )
  add(
    page.includes('seoPrintableTitle') || page.includes('document.title') || metaLib.includes('document.title')
      ? 'PASS'
      : 'FAIL',
    'meta',
    '상세페이지 document.title',
    page.includes('applyPageMeta') ? 'applyPageMeta가 document.title을 도안 제목으로 갱신' : 'document.title 미연동',
  )
  add(
    metaLib.includes('og:image') && page.includes('image_color_url') ? 'PASS' : 'FAIL',
    'og',
    '상세 og:image / og:description 동적 치환',
    'applyPageMeta + image_color_url / description_ko',
  )
  add(
    page.includes('CreativeWork') && page.includes('ImageObject') ? 'PASS' : 'FAIL',
    'jsonld',
    '상세 JSON-LD (ImageObject / VisualArtwork)',
    page.includes('CreativeWork') ? 'CreativeWork + ImageObject 삽입' : '없음',
  )
  add(
    metaLib.includes('canonical') && page.includes('seoPrintablePath') ? 'PASS' : 'FAIL',
    'canonical',
    '상세 canonical URL',
    'canonical → https://doolia.com/printable/{slug}',
  )
  const router = read('src/app/router.tsx') ?? ''
  const dual =
    router.includes('path="/printable/:id"') && router.includes('path="/printables/:id"')
  add(
    dual ? 'WARN' : 'PASS',
    'canonical',
    '상세 URL 이중 경로',
    dual
      ? 'canonical은 /printable/:slug. /printables/:id 는 별칭으로 남음'
      : '상세 경로가 하나',
  )
}

function scanI18n() {
  const i18n = read('src/i18n/index.ts') ?? ''
  const present = LOCALES.filter((code) => i18n.includes(`code: '${code}'`))
  add(
    present.length === LOCALES.length ? 'PASS' : 'WARN',
    'hreflang',
    'i18n 10로케일 정의',
    `LANGUAGES: ${present.join(', ') || '없음'}. URL prefix (/en, /ja) 또는 ?lng= 기반 hreflang 라우트는 없음 (lng는 localStorage)`,
  )
}

function scanCrawlers() {
  const robots = read('public/robots.txt')
  add(
    robots ? 'PASS' : 'FAIL',
    'robots',
    'public/robots.txt',
    robots
      ? robots.slice(0, 240)
      : '파일 없음. Vite public 미배치 + Vercel SPA rewrite 때문에 /robots.txt 가 index.html 로 떨어질 수 있음',
  )
  if (robots) {
    add(
      /disallow:\s*\/admin/i.test(robots) ? 'PASS' : 'WARN',
      'robots',
      '/admin Disallow',
      /disallow:\s*\/admin/i.test(robots) ? 'Disallow: /admin 있음' : 'robots.txt는 있으나 /admin 차단 없음',
    )
    add(
      /sitemap\.xml/i.test(robots) ? 'PASS' : 'WARN',
      'robots',
      'Sitemap 지시',
      /sitemap\.xml/i.test(robots) ? 'Sitemap 경로 있음' : 'Sitemap: 지시 없음',
    )
  }

  const sitemap = read('public/sitemap.xml') ?? read('dist/sitemap.xml')
  const gen = existsSync(resolve('scripts/generate-seo-assets.ts'))
  add(
    sitemap && sitemap.includes('<urlset') && sitemap.includes('/printable/') && gen ? 'PASS' : 'FAIL',
    'sitemap',
    'sitemap.xml / 생성 스크립트',
    sitemap
      ? `urlset + printable URL, scripts/generate-seo-assets.ts ${gen ? '있음' : '없음'}`
      : 'sitemap.xml 없음',
  )

  const vercel = read('vercel.json') ?? ''
  add(
    vercel.includes('printable/') ? 'PASS' : 'WARN',
    'robots',
    'Vercel SPA rewrite',
    vercel.includes('printable/')
      ? 'printable/ · robots.txt · sitemap.xml 은 SPA fallback에서 제외'
      : '전 경로 index.html rewrite',
  )
}

function scanSsr() {
  const gen = existsSync(resolve('scripts/generate-seo-assets.ts'))
  const prerender = read('dist/printable/gl5/index.html') ?? read('public/printable/gl5/index.html')
  const ok =
    gen &&
    Boolean(prerender) &&
    (prerender?.includes('og:image') ?? false) &&
    (prerender?.includes('application/ld+json') ?? false) &&
    (prerender?.includes('rel="canonical"') ?? false)
  add(
    ok ? 'PASS' : 'FAIL',
    'crawl',
    '서버 렌더 / 프리렌더',
    ok
      ? 'generate-seo-assets가 printable/{slug}/index.html 에 title/OG/JSON-LD/canonical 주입'
      : '프리렌더 HTML이 아직 없음. npx tsx scripts/generate-seo-assets.ts 필요',
  )
}

async function scanCatalog() {
  loadEnv()
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    add('WARN', 'sitemap', '발행 도안 수', 'Supabase 키 없음. 카탈로그 건수 미확인')
    return { count: 0, sample: [] as Array<{ slug: string; title_ko: string }> }
  }
  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('printables')
    .select('slug,title_ko,description_ko,image_color_url,published')
    .eq('published', true)
    .range(0, 999)
  if (error) {
    add('WARN', 'sitemap', '발행 도안 조회 실패', error.message)
    return { count: 0, sample: [] as Array<{ slug: string; title_ko: string }> }
  }
  const rows = data ?? []
  const sitemap = read('public/sitemap.xml') ?? read('dist/sitemap.xml') ?? ''
  add(
    sitemap.includes(`/printable/`) && rows.length ? 'PASS' : 'WARN',
    'sitemap',
    `발행 도안 ${rows.length}건`,
    `sitemap printable URL 포함. 목표 120건 대비 ${rows.length}`,
  )
  const missingDesc = rows.filter((row) => !String(row.description_ko ?? '').trim()).length
  const missingImg = rows.filter((row) => !String(row.image_color_url ?? '').trim()).length
  add(
    missingDesc ? 'WARN' : 'PASS',
    'meta',
    'description_ko 채워진 비율',
    `${rows.length - missingDesc}/${rows.length}. OG에 연결만 되면 상세 스니펫에 사용 가능`,
  )
  add(
    missingImg ? 'WARN' : 'PASS',
    'og',
    'image_color_url 채워진 비율',
    `${rows.length - missingImg}/${rows.length}. og:image 후보`,
  )
  return {
    count: rows.length,
    sample: rows.slice(0, 3).map((row) => ({ slug: String(row.slug), title_ko: String(row.title_ko ?? '') })),
  }
}

async function probeLive(sampleSlug?: string) {
  const origin = process.env.SEO_ORIGIN || 'http://localhost:9999'
  const paths = ['/', '/robots.txt', '/sitemap.xml', '/printable/gl5']
  if (sampleSlug) paths.push(`/printable/${sampleSlug}`)
  for (const path of paths) {
    try {
      const response = await fetch(`${origin}${path}`, { redirect: 'follow' })
      const body = await response.text()
      const isHtml = /<!doctype html/i.test(body) || /<html/i.test(body)
      const title = body.match(/<title>([^<]*)<\/title>/i)?.[1] ?? ''
      const robotsLike = /user-agent:/i.test(body)
      const xml = /<urlset|<sitemapindex/i.test(body)
      let grade: Grade = 'WARN'
      let detail = `HTTP ${response.status} · ${isHtml ? 'HTML' : robotsLike ? 'robots-like' : xml ? 'xml' : 'other'} · title="${title.slice(0, 80)}"`
      if (path === '/robots.txt') {
        grade = robotsLike && !isHtml ? 'PASS' : 'FAIL'
        detail += robotsLike ? '' : ' · robots 문법 아님 (SPA HTML일 가능성)'
      } else if (path === '/sitemap.xml') {
        grade = xml ? 'PASS' : 'FAIL'
        detail += xml ? '' : ' · urlset 아님'
      } else if (path.startsWith('/printable')) {
        const prerender =
          read(`public${path.replace(/\/$/, '')}/index.html`) ?? read(`dist${path.replace(/\/$/, '')}/index.html`)
        const uniqueFile = Boolean(
          prerender &&
            prerender.includes('og:image') &&
            prerender.includes('application/ld+json') &&
            prerender.includes('rel="canonical"'),
        )
        const uniqueLive = body.includes('og:image') && body.includes('무료 색칠도안')
        grade = uniqueFile || uniqueLive ? 'PASS' : 'FAIL'
        detail += uniqueLive || uniqueFile ? ' · 고유 OG/JSON-LD' : ' · 홈 셸 HTML'
      } else if (path === '/') {
        grade = title ? 'PASS' : 'FAIL'
      }
      add(grade, 'live', `GET ${path}`, detail)
    } catch (error) {
      add('WARN', 'live', `GET ${origin}${path} 실패`, (error as Error).message)
    }
  }
}

function printReport() {
  const order: Grade[] = ['FAIL', 'WARN', 'PASS']
  const counts = {
    FAIL: checks.filter((item) => item.grade === 'FAIL').length,
    WARN: checks.filter((item) => item.grade === 'WARN').length,
    PASS: checks.filter((item) => item.grade === 'PASS').length,
  }
  console.log('DOOLIA SEO engine audit (read-only, no src mutation)')
  console.log(`summary: FAIL=${counts.FAIL} WARN=${counts.WARN} PASS=${counts.PASS}`)
  console.log('')
  for (const grade of order) {
    const group = checks.filter((item) => item.grade === grade)
    if (!group.length) continue
    console.log(`=== ${grade} (${group.length}) ===`)
    for (const item of group) {
      console.log(`[${item.area}] ${item.title}`)
      console.log(`    ${item.detail}`)
      console.log('')
    }
  }
  console.log('=== RECOMMENDATIONS (not applied) ===')
  console.log('1. public/robots.txt: Allow /, Disallow /admin, Sitemap: https://{host}/sitemap.xml')
  console.log('2. 동적 sitemap(발행 printables + /, /category, /parenting-tips) Vite 플러그인 또는 /api/sitemap')
  console.log('3. 상세 prerender/SSR: document.title, og:title/description/image, canonical=/printable/{slug}')
  console.log('4. JSON-LD ImageObject + CreativeWork (name, image, inLanguage, url)')
  console.log('5. 10로케일은 URL로 분리(/ko,/en) 후 hreflang+x-default. 현재 localStorage lng는 크롤러가 못 봄')
  console.log('6. /printables/:id 를 /printable/:slug 로 301')
  console.log('7. 네이버: OG+본문 텍스트가 초기 HTML에 있어야 함. JS-only 제목은 수집이 약함')
}

loadEnv()
scanIndexHtml()
scanDetailPage()
scanI18n()
scanCrawlers()
scanSsr()
const catalog = await scanCatalog()
await probeLive(catalog.sample[0]?.slug)
printReport()

process.exitCode = checks.some((item) => item.grade === 'FAIL') ? 1 : 0
